import { getFirebaseAuth, getFirestoreDb, getFirebaseStorage, isFirebaseConfigured } from "./firebase";
import {
  appendLocalItem,
  deleteLocalItem,
  LOCAL_KEYS,
  readLocalCollection,
  updateLocalItem,
  writeLocalCollection,
} from "./localStore";
import { resolveReportCoordinates } from "../data/gambiaLocations";
import { CommunityAlert, IncidentReport, MissingPersonReport } from "../types/emergency";
import {
  collection,
  getDocs,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  doc,
  limit,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type SavedReportResult<T> = {
  data: T;
  savedTo: "cloud" | "local";
  uploadFailed?: boolean;
};

export type PendingReportSync = {
  reportId: string;
  alertId: string;
  kind: "incident" | "missing";
  syncAttempts: number;
  queuedAt: string;
  report: IncidentReport | MissingPersonReport;
  alert: CommunityAlert;
};

export type ReportSyncDrop = {
  title: string;
  reportId: string;
};

export type ReportSyncResult = {
  synced: number;
  dropped: ReportSyncDrop[];
};

const MAX_REPORT_SYNC_ATTEMPTS = 3;

type SyncFailureListener = (failures: ReportSyncDrop[]) => void;
const syncFailureListeners = new Set<SyncFailureListener>();

export function subscribeReportSyncFailures(listener: SyncFailureListener) {
  syncFailureListeners.add(listener);
  return () => {
    syncFailureListeners.delete(listener);
  };
}

function notifySyncFailures(failures: ReportSyncDrop[]) {
  if (failures.length === 0) return;
  syncFailureListeners.forEach((listener) => listener(failures));
}

function mapReportType(type: string): CommunityAlert["type"] {
  const normalized = type.toLowerCase();
  if (normalized.includes("fire")) return "fire";
  if (normalized.includes("flood")) return "flood";
  if (normalized.includes("crime")) return "crime";
  if (normalized.includes("accident")) return "accident";
  if (normalized.includes("missing")) return "other";
  return "other";
}

function severityForType(type: CommunityAlert["type"]): CommunityAlert["severity"] {
  switch (type) {
    case "fire":
    case "crime":
      return "critical";
    case "flood":
    case "accident":
      return "high";
    default:
      return "medium";
  }
}

function sortAlerts(alerts: CommunityAlert[]) {
  return [...alerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function mergeAlertLists(
  local: CommunityAlert[],
  remote: CommunityAlert[]
): CommunityAlert[] {
  const byId = new Map<string, CommunityAlert>();
  for (const alert of local) byId.set(alert.id, alert);
  for (const alert of remote) byId.set(alert.id, alert);
  return sortAlerts([...byId.values()]);
}

async function loadLocalAlerts() {
  return readLocalCollection<CommunityAlert>(LOCAL_KEYS.alerts);
}

async function loadRemoteAlerts(): Promise<CommunityAlert[]> {
  if (!isFirebaseConfigured()) return [];

  const db = getFirestoreDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, "community_alerts"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CommunityAlert);
  } catch {
    return [];
  }
}

function buildCommunityAlert(input: {
  id: string;
  userId: string;
  type: string;
  title?: string;
  location: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}): CommunityAlert {
  const alertType = mapReportType(input.type);
  return {
    id: `alert-${input.id}`,
    reportId: input.id,
    userId: input.userId,
    type: alertType,
    title: input.title || `${input.type} Reported`,
    location: input.location,
    severity: severityForType(alertType),
    createdAt: input.createdAt,
    description: input.description || "New community incident report.",
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

async function ensureFirebaseAuth(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser.uid;

  try {
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  } catch {
    return null;
  }
}

async function resolveReportUserId(fallbackUserId: string) {
  const firebaseUid = await ensureFirebaseAuth();
  return firebaseUid ?? fallbackUserId;
}

type AlertsListener = (alerts: CommunityAlert[]) => void;
const localListeners = new Set<AlertsListener>();

async function emitLocalAlerts() {
  const alerts = await loadMergedAlerts();
  localListeners.forEach((listener) => listener(alerts));
}

async function saveLocalReportBundle(input: {
  report: IncidentReport | MissingPersonReport;
  alert: CommunityAlert;
  kind: PendingReportSync["kind"];
}) {
  if (input.kind === "incident") {
    await appendLocalItem(
      LOCAL_KEYS.reports,
      input.report as IncidentReport
    );
  } else {
    await appendLocalItem(
      LOCAL_KEYS.missing,
      input.report as MissingPersonReport
    );
  }

  await saveLocalAlert(input.alert);
  await queuePendingReportSync({
    reportId: input.report.id,
    alertId: input.alert.id,
    kind: input.kind,
    syncAttempts: 1,
    queuedAt: new Date().toISOString(),
    report: input.report,
    alert: input.alert,
  });
  await emitLocalAlerts();
}

async function finalizeReportSubmit<T extends IncidentReport | MissingPersonReport>(
  report: T,
  alert: CommunityAlert,
  kind: PendingReportSync["kind"]
): Promise<SavedReportResult<T>> {
  await saveLocalReportBundle({ report, alert, kind });

  const syncResult = await syncPendingReports({ notify: false });
  const dropped = syncResult.dropped.find((item) => item.reportId === report.id);

  if (dropped) {
    return { data: report, savedTo: "local", uploadFailed: true };
  }

  if (syncResult.synced > 0) {
    const remote = await loadRemoteAlerts();
    const uploaded = remote.find((item) => item.reportId === report.id);
    if (uploaded) {
      return { data: report, savedTo: "cloud" };
    }
  }

  return { data: report, savedTo: "local" };
}

async function saveLocalAlert(alert: CommunityAlert) {
  await appendLocalItem(LOCAL_KEYS.alerts, alert);
}

async function loadPendingReportSyncs() {
  return readLocalCollection<PendingReportSync>(LOCAL_KEYS.pendingReports);
}

async function writePendingReportSyncs(items: PendingReportSync[]) {
  await writeLocalCollection(LOCAL_KEYS.pendingReports, items);
}

async function queuePendingReportSync(entry: PendingReportSync) {
  const pending = await loadPendingReportSyncs();
  const index = pending.findIndex((item) => item.reportId === entry.reportId);
  if (index === -1) {
    pending.unshift(entry);
  } else {
    pending[index] = entry;
  }
  await writePendingReportSyncs(pending);
}

async function removePendingReportSync(reportId: string) {
  const pending = await loadPendingReportSyncs();
  await writePendingReportSyncs(
    pending.filter((item) => item.reportId !== reportId)
  );
}

async function removeLocalReportData(
  reportId: string,
  alertId: string,
  kind: PendingReportSync["kind"]
) {
  await deleteLocalItem(LOCAL_KEYS.alerts, alertId);
  if (kind === "incident") {
    await deleteLocalItem(LOCAL_KEYS.reports, reportId);
  } else {
    await deleteLocalItem(LOCAL_KEYS.missing, reportId);
  }
}

async function uploadIncidentToCloud(
  report: IncidentReport,
  alert: CommunityAlert,
  firebaseUid: string
) {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    await setDoc(doc(db, "incident_reports", report.id), {
      ...report,
      userId: firebaseUid,
    });
    await setDoc(doc(db, "community_alerts", alert.id), {
      ...alert,
      userId: firebaseUid,
    });
    return true;
  } catch {
    return false;
  }
}

async function uploadMissingPersonToCloud(
  report: MissingPersonReport,
  alert: CommunityAlert,
  firebaseUid: string
) {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    await setDoc(doc(db, "missing_persons", report.id), {
      ...report,
      userId: firebaseUid,
    });
    await setDoc(doc(db, "community_alerts", alert.id), {
      ...alert,
      userId: firebaseUid,
    });
    return true;
  } catch {
    return false;
  }
}

async function uploadPendingReportToCloud(item: PendingReportSync) {
  if (!isFirebaseConfigured()) return false;

  const firebaseUid = await ensureFirebaseAuth();
  if (!firebaseUid) return false;

  if (item.kind === "incident") {
    return uploadIncidentToCloud(
      item.report as IncidentReport,
      item.alert,
      firebaseUid
    );
  }

  return uploadMissingPersonToCloud(
    item.report as MissingPersonReport,
    item.alert,
    firebaseUid
  );
}

export async function syncPendingReports(options?: {
  notify?: boolean;
}): Promise<ReportSyncResult> {
  if (!isFirebaseConfigured()) {
    return { synced: 0, dropped: [] };
  }

  const pending = await loadPendingReportSyncs();
  if (pending.length === 0) {
    return { synced: 0, dropped: [] };
  }

  let synced = 0;
  const dropped: ReportSyncDrop[] = [];
  const nextPending: PendingReportSync[] = [];

  for (const item of pending) {
    if (item.syncAttempts >= MAX_REPORT_SYNC_ATTEMPTS) {
      await removeLocalReportData(item.reportId, item.alertId, item.kind);
      dropped.push({ title: item.alert.title, reportId: item.reportId });
      continue;
    }

    const uploaded = await uploadPendingReportToCloud(item);
    if (uploaded) {
      await removeLocalReportData(item.reportId, item.alertId, item.kind);
      await removePendingReportSync(item.reportId);
      synced += 1;
      continue;
    }

    const failed = {
      ...item,
      syncAttempts: item.syncAttempts + 1,
    };

    if (failed.syncAttempts >= MAX_REPORT_SYNC_ATTEMPTS) {
      await removeLocalReportData(item.reportId, item.alertId, item.kind);
      dropped.push({ title: item.alert.title, reportId: item.reportId });
      continue;
    }

    nextPending.push(failed);
  }

  await writePendingReportSyncs(nextPending);

  if (synced > 0 || dropped.length > 0) {
    await emitLocalAlerts();
  }

  if (dropped.length > 0 && options?.notify !== false) {
    notifySyncFailures(dropped);
  }

  return { synced, dropped };
}

async function loadMergedAlerts(): Promise<CommunityAlert[]> {
  const [local, remote] = await Promise.all([
    loadLocalAlerts(),
    loadRemoteAlerts(),
  ]);
  const remoteIds = new Set(remote.map((alert) => alert.id));
  const localOnly = local.filter((alert) => !remoteIds.has(alert.id));
  return mergeAlertLists(localOnly, remote);
}

export async function uploadImageAsync(
  uri: string,
  path: string
): Promise<string | undefined> {
  if (!isFirebaseConfigured()) return uri;

  const storage = getFirebaseStorage();
  if (!storage) return uri;

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  } catch {
    return undefined;
  }
}

export async function submitIncidentReport(input: {
  userId: string;
  type: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photoUri?: string | null;
}): Promise<SavedReportResult<IncidentReport>> {
  const now = new Date().toISOString();
  const id = createId();
  const userId = await resolveReportUserId(input.userId);
  const coords = resolveReportCoordinates(
    input.location,
    input.latitude,
    input.longitude
  );

  let photoUrl: string | undefined;
  if (input.photoUri) {
    photoUrl = await uploadImageAsync(
      input.photoUri,
      `reports/${input.userId}/${id}.jpg`
    );
  }

  const report: IncidentReport = {
    id,
    userId,
    type: input.type,
    description: input.description,
    location: input.location,
    latitude: coords.latitude,
    longitude: coords.longitude,
    photoUrl,
    status: "open",
    createdAt: now,
  };

  const alert = buildCommunityAlert({
    id,
    userId,
    type: input.type,
    location: input.location,
    description: input.description,
    latitude: coords.latitude,
    longitude: coords.longitude,
    createdAt: now,
  });

  if (isFirebaseConfigured()) {
    const firebaseUid = await ensureFirebaseAuth();
    if (firebaseUid) {
      const uploaded = await uploadIncidentToCloud(report, alert, firebaseUid);
      if (uploaded) {
        await removeLocalReportData(id, alert.id, "incident");
        await removePendingReportSync(id);
        return { data: { ...report, userId: firebaseUid }, savedTo: "cloud" };
      }
    }
  }

  return finalizeReportSubmit(report, alert, "incident");
}

export async function submitMissingPersonReport(input: {
  userId: string;
  fullName: string;
  age?: string;
  lastSeen: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photoUri?: string | null;
}): Promise<SavedReportResult<MissingPersonReport>> {
  const now = new Date().toISOString();
  const id = createId();
  const userId = await resolveReportUserId(input.userId);
  const coords = resolveReportCoordinates(
    input.location,
    input.latitude,
    input.longitude
  );

  let photoUrl: string | undefined;
  if (input.photoUri) {
    photoUrl = await uploadImageAsync(
      input.photoUri,
      `missing/${input.userId}/${id}.jpg`
    );
  }

  const report: MissingPersonReport = {
    id,
    userId,
    fullName: input.fullName,
    age: input.age,
    lastSeen: input.lastSeen,
    location: input.location,
    photoUrl,
    status: "open",
    createdAt: now,
  };

  const alert = buildCommunityAlert({
    id,
    userId,
    type: "Missing Person",
    title: `Missing Person: ${input.fullName}`,
    location: input.location,
    description:
      `Last seen: ${input.lastSeen}` +
      (input.age ? ` • Age ${input.age}` : ""),
    latitude: coords.latitude,
    longitude: coords.longitude,
    createdAt: now,
  });
  alert.severity = "critical";

  if (isFirebaseConfigured()) {
    const firebaseUid = await ensureFirebaseAuth();
    if (firebaseUid) {
      const uploaded = await uploadMissingPersonToCloud(
        report,
        alert,
        firebaseUid
      );
      if (uploaded) {
        await removeLocalReportData(id, alert.id, "missing");
        await removePendingReportSync(id);
        return { data: { ...report, userId: firebaseUid }, savedTo: "cloud" };
      }
    }
  }

  return finalizeReportSubmit(report, alert, "missing");
}

export async function fetchCommunityAlerts(): Promise<CommunityAlert[]> {
  await syncPendingReports();
  return loadMergedAlerts();
}

export async function refreshCommunityAlerts(): Promise<CommunityAlert[]> {
  return fetchCommunityAlerts();
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
      return onSnapshot(
        q,
        async (snap) => {
          await syncPendingReports();
          const remote = snap.docs.map((d) => d.data() as CommunityAlert);
          const local = await loadLocalAlerts();
          const remoteIds = new Set(remote.map((alert) => alert.id));
          const localOnly = local.filter((alert) => !remoteIds.has(alert.id));
          callback(mergeAlertLists(localOnly, remote));
        },
        async () => {
          callback(await fetchCommunityAlerts());
        }
      );
    }
  }

  let active = true;
  localListeners.add(callback);
  fetchCommunityAlerts().then((alerts) => {
    if (active) callback(alerts);
  });

  return () => {
    active = false;
    localListeners.delete(callback);
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

export function isCommunityAlertOwner(
  alert: CommunityAlert,
  currentUserId: string,
  firebaseUid?: string | null
) {
  if (!alert.userId) return false;
  if (alert.userId === currentUserId) return true;
  return Boolean(firebaseUid && alert.userId === firebaseUid);
}

export async function updateCommunityAlert(
  alertId: string,
  patch: Partial<
    Pick<
      CommunityAlert,
      "location" | "description" | "latitude" | "longitude" | "title"
    >
  >
): Promise<CommunityAlert | null> {
  const updatedAt = new Date().toISOString();
  const local = await readLocalCollection<CommunityAlert>(LOCAL_KEYS.alerts);
  const existing = local.find((item) => item.id === alertId);

  if (existing) {
    const next = { ...existing, ...patch };
    await updateLocalItem(LOCAL_KEYS.alerts, alertId, next);
    await emitLocalAlerts();
  }

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      try {
        await ensureFirebaseAuth();
        const current =
          existing ??
          (await readFirestoreDoc<CommunityAlert>(db, "community_alerts", alertId));
        if (!current) return null;

        const next = { ...current, ...patch };
        await setDoc(doc(db, "community_alerts", alertId), next);

        if (current.reportId) {
          await setDoc(
            doc(db, "incident_reports", current.reportId),
            {
              location: next.location,
              description: next.description ?? current.description,
              latitude: next.latitude,
              longitude: next.longitude,
              updatedAt,
            },
            { merge: true }
          );
        }
        await emitLocalAlerts();
        return next;
      } catch {
        return existing ? { ...existing, ...patch } : null;
      }
    }
  }

  return existing ? { ...existing, ...patch } : null;
}

async function readFirestoreDoc<T>(
  db: NonNullable<ReturnType<typeof getFirestoreDb>>,
  collectionName: string,
  id: string
): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? (snap.data() as T) : null;
}

export async function deleteCommunityAlert(alertId: string): Promise<boolean> {
  const local = await readLocalCollection<CommunityAlert>(LOCAL_KEYS.alerts);
  const existing = local.find((item) => item.id === alertId);

  if (existing) {
    await deleteLocalItem(LOCAL_KEYS.alerts, alertId);
    if (existing.reportId) {
      await deleteLocalItem(LOCAL_KEYS.reports, existing.reportId);
    }
    await emitLocalAlerts();
  }

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      try {
        await ensureFirebaseAuth();
        const remote =
          existing ??
          (await readFirestoreDoc<CommunityAlert>(db, "community_alerts", alertId));
        await deleteDoc(doc(db, "community_alerts", alertId));
        if (remote?.reportId) {
          await deleteDoc(doc(db, "incident_reports", remote.reportId));
        }
        await emitLocalAlerts();
        return true;
      } catch {
        return Boolean(existing);
      }
    }
  }

  return Boolean(existing);
}
