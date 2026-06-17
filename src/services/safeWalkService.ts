import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import {
  appendLocalItem,
  getLocalItem,
  LOCAL_KEYS,
  updateLocalItem,
} from "./localStore";
import { GeoPoint, SafeWalkJourney } from "../types/emergency";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getSafeWalkUrl } from "../config/app";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function startSafeWalk(input: {
  userId: string;
  userName: string;
  destination?: string;
  startLocation: GeoPoint;
}): Promise<SafeWalkJourney> {
  const now = new Date().toISOString();
  const journey: SafeWalkJourney = {
    id: createId(),
    userId: input.userId,
    userName: input.userName,
    status: "active",
    destination: input.destination,
    createdAt: now,
    updatedAt: now,
    locationTrail: [input.startLocation],
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await setDoc(doc(db, "safe_walks", journey.id), journey);
      return journey;
    }
  }

  await appendLocalItem(LOCAL_KEYS.walks, journey);
  return journey;
}

export async function getSafeWalk(id: string) {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const snap = await getDoc(doc(db, "safe_walks", id));
      if (snap.exists()) return snap.data() as SafeWalkJourney;
    }
  }
  return getLocalItem<SafeWalkJourney>(LOCAL_KEYS.walks, id);
}

export function subscribeSafeWalk(
  id: string,
  callback: (journey: SafeWalkJourney | null) => void
) {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      return onSnapshot(doc(db, "safe_walks", id), (snap) => {
        callback(snap.exists() ? (snap.data() as SafeWalkJourney) : null);
      });
    }
  }

  let active = true;
  const poll = async () => {
    while (active) {
      callback(await getLocalItem<SafeWalkJourney>(LOCAL_KEYS.walks, id));
      await new Promise((r) => setTimeout(r, 2000));
    }
  };
  poll();
  return () => {
    active = false;
  };
}

export async function appendSafeWalkLocation(id: string, point: GeoPoint) {
  const journey = await getSafeWalk(id);
  if (!journey) return null;

  const locationTrail = [...journey.locationTrail, point];
  const patch = {
    locationTrail,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "safe_walks", id), patch);
      return { ...journey, ...patch };
    }
  }

  return updateLocalItem<SafeWalkJourney>(LOCAL_KEYS.walks, id, patch);
}

export async function completeSafeWalk(id: string) {
  const patch = {
    status: "completed" as const,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "safe_walks", id), patch);
      return;
    }
  }

  await updateLocalItem<SafeWalkJourney>(LOCAL_KEYS.walks, id, patch);
}

export async function triggerSafeWalkSos(id: string) {
  const patch = {
    status: "sos" as const,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, "safe_walks", id), patch);
      return;
    }
  }

  await updateLocalItem<SafeWalkJourney>(LOCAL_KEYS.walks, id, patch);
}

export function buildSafeWalkShareMessage(journeyId: string, userName: string) {
  return (
    `🚶 Safe Walk — Civic Shield\n\n` +
    `${userName} is sharing their journey with you.\n\n` +
    `Track live:\n${getSafeWalkUrl(journeyId)}`
  );
}
