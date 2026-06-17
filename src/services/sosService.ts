import { Linking, Platform, Share } from "react-native";
import * as Location from "expo-location";

import { getTrackingUrl } from "../config/app";
import {
  DEFAULT_MAP_CENTER,
  getTownCenter,
} from "../data/gambiaLocations";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { ensureFirebaseAuth } from "./firebaseAuth";
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
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function saveSosLocally(incident: SosIncident) {
  const existing = await getLocalItem<SosIncident>(LOCAL_KEYS.sos, incident.id);
  if (existing) {
    await updateLocalItem(LOCAL_KEYS.sos, incident.id, incident);
    return incident;
  }
  await appendLocalItem(LOCAL_KEYS.sos, incident);
  return incident;
}

async function persistSosIncident(incident: SosIncident): Promise<SosIncident> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      try {
        const firebaseUid = await ensureFirebaseAuth();
        if (firebaseUid) {
          const cloudIncident = { ...incident, userId: firebaseUid };
          await setDoc(doc(db, "sos_alerts", incident.id), cloudIncident);
          await saveSosLocally(cloudIncident);
          return cloudIncident;
        }
      } catch {
        // Cloud write failed — continue with local save.
      }
    }
  }

  return saveSosLocally(incident);
}

async function patchSosIncident(
  id: string,
  patch: Partial<SosIncident>
): Promise<SosIncident | null> {
  const incident =
    (await getSosIncident(id)) ??
    (await getLocalItem<SosIncident>(LOCAL_KEYS.sos, id));
  if (!incident) return null;

  const next = { ...incident, ...patch };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      try {
        const firebaseUid = await ensureFirebaseAuth();
        if (firebaseUid) {
          await updateDoc(doc(db, "sos_alerts", id), patch);
          return next;
        }
      } catch {
        // Fall back to local storage.
      }
    }
  }

  return updateLocalItem<SosIncident>(LOCAL_KEYS.sos, id, patch);
}

export async function createSosIncident(input: {
  userId: string;
  userName: string;
  userPhone: string;
  location?: GeoPoint | null;
  locationArea?: string;
  locationSource?: SosIncident["locationSource"];
  nearbyTown?: string;
}): Promise<SosIncident> {
  const now = new Date().toISOString();
  const resolved =
    input.location != null
      ? {
          point: input.location,
          areaLabel: input.locationArea ?? "Live GPS",
          source: (input.locationSource ?? "gps") as SosIncident["locationSource"],
        }
      : await resolveSosLocation(input.nearbyTown);

  const incident: SosIncident = {
    id: createId(),
    userId: input.userId,
    userName: input.userName,
    userPhone: input.userPhone,
    status: "active",
    createdAt: now,
    updatedAt: now,
    location: resolved.point,
    locationTrail: [resolved.point],
    locationArea: resolved.areaLabel,
    locationSource: resolved.source,
    contactsNotified: false,
  };

  return persistSosIncident(incident);
}

export async function getSosIncident(id: string) {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      try {
        const snap = await getDoc(doc(db, "sos_alerts", id));
        if (snap.exists()) return snap.data() as SosIncident;
      } catch {
        // Fall through to local lookup.
      }
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
      return onSnapshot(
        doc(db, "sos_alerts", id),
        async (snap) => {
          if (snap.exists()) {
            callback(snap.data() as SosIncident);
            return;
          }
          callback(await getLocalItem<SosIncident>(LOCAL_KEYS.sos, id));
        },
        async () => {
          callback(await getLocalItem<SosIncident>(LOCAL_KEYS.sos, id));
        }
      );
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

export async function appendSosLocation(
  id: string,
  point: GeoPoint,
  meta?: Pick<SosIncident, "locationArea" | "locationSource">
) {
  const patch = {
    location: point,
    locationTrail: [
      ...((await getSosIncident(id))?.locationTrail ?? []),
      point,
    ],
    updatedAt: new Date().toISOString(),
    ...meta,
  };

  return patchSosIncident(id, patch);
}

export async function resolveSosIncident(id: string) {
  await patchSosIncident(id, {
    status: "resolved",
    updatedAt: new Date().toISOString(),
  });
}

export async function cancelSosIncident(id: string) {
  await patchSosIncident(id, {
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  });
}

export async function markContactsNotified(id: string) {
  await patchSosIncident(id, {
    contactsNotified: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function attachSosEvidence(
  id: string,
  evidence: { audioUrl?: string; photoUrl?: string }
) {
  await patchSosIncident(id, {
    ...evidence,
    updatedAt: new Date().toISOString(),
  });
}

export async function getCurrentLocation(): Promise<GeoPoint | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function resolveSosLocation(nearbyTown = "Banjul"): Promise<{
  point: GeoPoint;
  source: NonNullable<SosIncident["locationSource"]>;
  areaLabel: string;
}> {
  const gps = await getCurrentLocation();
  if (gps) {
    return {
      point: gps,
      source: "gps",
      areaLabel: "Live GPS",
    };
  }

  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      return {
        point: {
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
          timestamp: new Date().toISOString(),
        },
        source: "gps",
        areaLabel: "Last known location",
      };
    }
  } catch {
    // Permission denied or unavailable — use nearby town center.
  }

  const town = nearbyTown.trim() || "Banjul";
  const center = getTownCenter(town);
  const fallback = {
    latitude: center.latitude,
    longitude: center.longitude,
  };

  const isDefault =
    fallback.latitude === DEFAULT_MAP_CENTER.latitude &&
    fallback.longitude === DEFAULT_MAP_CENTER.longitude &&
    town.toLowerCase() !== "banjul";

  return {
    point: {
      ...fallback,
      timestamp: new Date().toISOString(),
    },
    source: "nearby",
    areaLabel: isDefault
      ? "Banjul (nearby area)"
      : `${town} (nearby area)`,
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

  try {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ text: message, title: "Civic Shield Emergency" });
      }
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
  } catch {
    // Share cancelled or unavailable — SOS should still continue.
  }
}

export async function listActiveSosIncidents() {
  const all = await readLocalCollection<SosIncident>(LOCAL_KEYS.sos);
  return all.filter((item) => item.status === "active");
}
