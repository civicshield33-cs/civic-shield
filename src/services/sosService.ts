import { Linking, Platform, Share } from "react-native";
import * as Location from "expo-location";

import { getTrackingUrl } from "../config/app";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import {
  appendLocalItem,
  getLocalItem,
  LOCAL_KEYS,
  readLocalCollection,
  updateLocalItem,
} from "./localStore";
import { GeoPoint, SosIncident } from "../types/emergency";
import { EmergencyContact } from "../types/emergency";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function createSosIncident(input: {
  userId: string;
  userName: string;
  userPhone: string;
  location?: GeoPoint | null;
}): Promise<SosIncident> {
  const now = new Date().toISOString();
  const incident: SosIncident = {
    id: createId(),
    userId: input.userId,
    userName: input.userName,
    userPhone: input.userPhone,
    status: "active",
    createdAt: now,
    updatedAt: now,
    location: input.location || null,
    locationTrail: input.location ? [input.location] : [],
    contactsNotified: false,
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await setDoc(doc(db, "sos_alerts", incident.id), incident);
      return incident;
    }
  }

  await appendLocalItem(LOCAL_KEYS.sos, incident);
  return incident;
}

export async function getSosIncident(id: string) {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const snap = await getDoc(doc(db, "sos_alerts", id));
      if (snap.exists()) return snap.data() as SosIncident;
    }
  }
  return getLocalItem<SosIncident>(LOCAL_KEYS.sos, id);
}

export function subscribeSosIncident(
  id: string,
  callback: (incident: SosIncident | null) => void
) {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      return onSnapshot(doc(db, "sos_alerts", id), (snap) => {
        callback(snap.exists() ? (snap.data() as SosIncident) : null);
      });
    }
  }

  let active = true;
  const poll = async () => {
    while (active) {
      const incident = await getLocalItem<SosIncident>(LOCAL_KEYS.sos, id);
      callback(incident);
      await new Promise((r) => setTimeout(r, 2000));
    }
  };
  poll();
  return () => {
    active = false;
  };
}

export async function appendSosLocation(id: string, point: GeoPoint) {
  const incident = await getSosIncident(id);
  if (!incident) return null;

  const locationTrail = [...incident.locationTrail, point];
  const patch = {
    location: point,
    locationTrail,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "sos_alerts", id), patch);
      return { ...incident, ...patch };
    }
  }

  return updateLocalItem<SosIncident>(LOCAL_KEYS.sos, id, patch);
}

export async function resolveSosIncident(id: string) {
  const patch = {
    status: "resolved" as const,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "sos_alerts", id), patch);
      return;
    }
  }

  await updateLocalItem<SosIncident>(LOCAL_KEYS.sos, id, patch);
}

export async function cancelSosIncident(id: string) {
  const patch = {
    status: "cancelled" as const,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "sos_alerts", id), patch);
      return;
    }
  }

  await updateLocalItem<SosIncident>(LOCAL_KEYS.sos, id, patch);
}

export async function markContactsNotified(id: string) {
  const patch = {
    contactsNotified: true,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "sos_alerts", id), patch);
      return;
    }
  }

  await updateLocalItem<SosIncident>(LOCAL_KEYS.sos, id, patch);
}

export async function attachSosEvidence(
  id: string,
  evidence: { audioUrl?: string; photoUrl?: string }
) {
  const patch = {
    ...evidence,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "sos_alerts", id), patch);
      return;
    }
  }

  await updateLocalItem<SosIncident>(LOCAL_KEYS.sos, id, patch);
}

export async function getCurrentLocation(): Promise<GeoPoint | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  const loc = await Location.getCurrentPositionAsync({});
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    timestamp: new Date().toISOString(),
  };
}

export async function notifyEmergencyContacts(
  contacts: EmergencyContact[],
  incidentId: string,
  userName: string
) {
  const link = getTrackingUrl(incidentId);
  const message =
    `🚨 CIVIC SHIELD EMERGENCY\n\n` +
    `${userName} has triggered an SOS alert.\n\n` +
    `Live tracking:\n${link}`;

  if (Platform.OS === "web") {
    await Share.share({ message });
    return;
  }

  await Share.share({ message });

  for (const contact of contacts) {
    const phone = contact.phone.replace(/\s+/g, "");
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
    const canSms = await Linking.canOpenURL(smsUrl);
    if (canSms) {
      await Linking.openURL(smsUrl);
      break;
    }
  }
}

export async function listActiveSosIncidents() {
  const all = await readLocalCollection<SosIncident>(LOCAL_KEYS.sos);
  return all.filter((item) => item.status === "active");
}
