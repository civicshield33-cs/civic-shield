import { getFirestoreDb, getFirebaseStorage, isFirebaseConfigured } from "./firebase";
import {
  appendLocalItem,
  LOCAL_KEYS,
  readLocalCollection,
} from "./localStore";
import { CommunityAlert, IncidentReport, MissingPersonReport } from "../types/emergency";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  doc,
  limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_ALERTS: CommunityAlert[] = [
  {
    id: "seed-1",
    type: "fire",
    title: "Fire Incident",
    location: "Brikama",
    severity: "high",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    description: "Market area fire reported. Avoid the area.",
  },
  {
    id: "seed-2",
    type: "accident",
    title: "Traffic Accident",
    location: "Westfield",
    severity: "medium",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    description: "Road obstruction near junction.",
  },
  {
    id: "seed-3",
    type: "crime",
    title: "Crime Alert",
    location: "Serrekunda",
    severity: "critical",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    description: "Police advise caution in the area.",
  },
  {
    id: "seed-4",
    type: "flood",
    title: "Flood Warning",
    location: "Banjul",
    severity: "high",
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    description: "Heavy rain expected. Low-lying areas at risk.",
  },
];

function mapReportType(type: string): CommunityAlert["type"] {
  const normalized = type.toLowerCase();
  if (normalized.includes("fire")) return "fire";
  if (normalized.includes("flood")) return "flood";
  if (normalized.includes("crime")) return "crime";
  if (normalized.includes("accident")) return "accident";
  return "other";
}

export async function uploadImageAsync(uri: string, path: string) {
  if (!isFirebaseConfigured()) return uri;

  const storage = getFirebaseStorage();
  if (!storage) return uri;

  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function submitIncidentReport(input: {
  userId: string;
  type: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photoUri?: string | null;
}): Promise<IncidentReport> {
  const now = new Date().toISOString();
  const id = createId();

  let photoUrl: string | undefined;
  if (input.photoUri) {
    photoUrl = await uploadImageAsync(
      input.photoUri,
      `reports/${input.userId}/${id}.jpg`
    );
  }

  const report: IncidentReport = {
    id,
    userId: input.userId,
    type: input.type,
    description: input.description,
    location: input.location,
    latitude: input.latitude,
    longitude: input.longitude,
    photoUrl,
    status: "open",
    createdAt: now,
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await setDoc(doc(db, "incident_reports", id), report);

      const alert: CommunityAlert = {
        id: `alert-${id}`,
        type: mapReportType(input.type),
        title: `${input.type} Reported`,
        location: input.location,
        severity: "high",
        createdAt: now,
        description: input.description || "New community incident report.",
      };
      await setDoc(doc(db, "community_alerts", alert.id), alert);
      return report;
    }
  }

  await appendLocalItem(LOCAL_KEYS.reports, report);

  const alert: CommunityAlert = {
    id: `alert-${id}`,
    type: mapReportType(input.type),
    title: `${input.type} Reported`,
    location: input.location,
    severity: "high",
    createdAt: now,
    description: input.description || "New community incident report.",
  };
  await appendLocalItem(LOCAL_KEYS.alerts, alert);

  return report;
}

export async function submitMissingPersonReport(input: {
  userId: string;
  fullName: string;
  age?: string;
  lastSeen: string;
  location: string;
  photoUri?: string | null;
}): Promise<MissingPersonReport> {
  const now = new Date().toISOString();
  const id = createId();

  let photoUrl: string | undefined;
  if (input.photoUri) {
    photoUrl = await uploadImageAsync(
      input.photoUri,
      `missing/${input.userId}/${id}.jpg`
    );
  }

  const report: MissingPersonReport = {
    id,
    userId: input.userId,
    fullName: input.fullName,
    age: input.age,
    lastSeen: input.lastSeen,
    location: input.location,
    photoUrl,
    status: "open",
    createdAt: now,
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await setDoc(doc(db, "missing_persons", id), report);
      return report;
    }
  }

  await appendLocalItem(LOCAL_KEYS.missing, report);
  return report;
}

export async function fetchCommunityAlerts(): Promise<CommunityAlert[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const q = query(
        collection(db, "community_alerts"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snap = await getDocs(q);
      const alerts = snap.docs.map((d) => d.data() as CommunityAlert);
      if (alerts.length > 0) return alerts;
    }
  }

  const local = await readLocalCollection<CommunityAlert>(LOCAL_KEYS.alerts);
  return local.length > 0 ? local : DEFAULT_ALERTS;
}

export function subscribeCommunityAlerts(
  callback: (alerts: CommunityAlert[]) => void
) {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const q = query(
        collection(db, "community_alerts"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      return onSnapshot(q, async (snap) => {
        const alerts = snap.docs.map((d) => d.data() as CommunityAlert);
        callback(alerts.length > 0 ? alerts : await fetchCommunityAlerts());
      });
    }
  }

  let active = true;
  const poll = async () => {
    while (active) {
      callback(await fetchCommunityAlerts());
      await new Promise((r) => setTimeout(r, 3000));
    }
  };
  poll();
  return () => {
    active = false;
  };
}

export async function fetchMissingPersons(): Promise<MissingPersonReport[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const q = query(
        collection(db, "missing_persons"),
        orderBy("createdAt", "desc"),
        limit(30)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as MissingPersonReport);
    }
  }

  return readLocalCollection<MissingPersonReport>(LOCAL_KEYS.missing);
}
