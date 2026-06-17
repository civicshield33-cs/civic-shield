import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  limit,
} from "firebase/firestore";

import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { fetchCommunityAlerts } from "./incidentService";
import {
  appendLocalItem,
  LOCAL_KEYS,
  readLocalCollection,
  updateLocalItem,
} from "./localStore";
import { listActiveSosIncidents } from "./sosService";
import { IncidentReport, MissingPersonReport, SosIncident } from "../types/emergency";
import {
  AuditLogEntry,
  CommandIncident,
  DEFAULT_UNITS,
  IncidentSeverity,
  IncidentSource,
  ResponseUnit,
} from "../types/operator";

const UNITS_KEY = "COMMAND_UNITS";
const AUDIT_KEY = "COMMAND_AUDIT_LOG";
const ASSIGNMENTS_KEY = "COMMAND_ASSIGNMENTS";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sosToCommand(incident: SosIncident): CommandIncident {
  const loc = incident.location || incident.locationTrail.at(-1);
  return {
    id: incident.id,
    source: "sos",
    title: `SOS — ${incident.userName}`,
    location: loc
      ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
      : "GPS pending",
    severity: "critical",
    status:
      incident.status === "resolved"
        ? "resolved"
        : incident.status === "cancelled"
          ? "cancelled"
          : "active",
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
    latitude: loc?.latitude,
    longitude: loc?.longitude,
    userName: incident.userName,
    userPhone: incident.userPhone,
    audioUrl: incident.audioUrl,
    photoUrl: incident.photoUrl,
    locationTrail: incident.locationTrail,
  };
}

function reportToCommand(report: IncidentReport): CommandIncident {
  return {
    id: report.id,
    source: "report",
    title: `${report.type} Report`,
    location: report.location,
    severity: "high",
    status: report.status === "resolved" ? "resolved" : "active",
    createdAt: report.createdAt,
    updatedAt: report.createdAt,
    latitude: report.latitude,
    longitude: report.longitude,
    description: report.description,
    photoUrl: report.photoUrl,
  };
}

function missingToCommand(report: MissingPersonReport): CommandIncident {
  return {
    id: report.id,
    source: "missing",
    title: `Missing — ${report.fullName}`,
    location: report.location,
    severity: "high",
    status: report.status === "found" ? "resolved" : "active",
    createdAt: report.createdAt,
    updatedAt: report.createdAt,
    description: `Last seen: ${report.lastSeen}`,
    photoUrl: report.photoUrl,
  };
}

async function loadAssignments(): Promise<Record<string, Partial<CommandIncident>>> {
  const raw = await AsyncStorage.getItem(ASSIGNMENTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveAssignment(id: string, patch: Partial<CommandIncident>) {
  const all = await loadAssignments();
  all[id] = { ...all[id], ...patch, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(all));
}

function mergeAssignments(
  incidents: CommandIncident[],
  assignments: Record<string, Partial<CommandIncident>>
) {
  return incidents.map((incident) => ({
    ...incident,
    ...assignments[incident.id],
  }));
}

export async function fetchCommandIncidents(): Promise<CommandIncident[]> {
  let incidents: CommandIncident[] = [];

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const [sosSnap, reportSnap, missingSnap] = await Promise.all([
        getDocs(query(collection(db, "sos_alerts"), orderBy("createdAt", "desc"), limit(30))),
        getDocs(query(collection(db, "incident_reports"), orderBy("createdAt", "desc"), limit(30))),
        getDocs(query(collection(db, "missing_persons"), orderBy("createdAt", "desc"), limit(20))),
      ]);

      incidents = [
        ...sosSnap.docs.map((d) => sosToCommand(d.data() as SosIncident)),
        ...reportSnap.docs.map((d) => reportToCommand(d.data() as IncidentReport)),
        ...missingSnap.docs.map((d) => missingToCommand(d.data() as MissingPersonReport)),
      ];
    }
  }

  if (incidents.length === 0) {
    const [sos, reports, missing] = await Promise.all([
      readLocalCollection<SosIncident>(LOCAL_KEYS.sos),
      readLocalCollection<IncidentReport>(LOCAL_KEYS.reports),
      readLocalCollection<MissingPersonReport>(LOCAL_KEYS.missing),
    ]);

    incidents = [
      ...sos.map(sosToCommand),
      ...reports.map(reportToCommand),
      ...missing.map(missingToCommand),
    ];
  }

  const floodAlerts = (await fetchCommunityAlerts())
    .filter((a) => a.type === "flood")
    .map(
      (a): CommandIncident => ({
        id: a.id,
        source: "flood",
        title: a.title,
        location: a.location,
        severity: a.severity as IncidentSeverity,
        status: "active",
        createdAt: a.createdAt,
        updatedAt: a.createdAt,
        description: a.description,
      })
    );

  incidents = [...incidents, ...floodAlerts];
  const assignments = await loadAssignments();

  return mergeAssignments(incidents, assignments).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function subscribeCommandIncidents(
  callback: (incidents: CommandIncident[]) => void
) {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const unsubSos = onSnapshot(
        query(collection(db, "sos_alerts"), orderBy("createdAt", "desc"), limit(30)),
        async () => callback(await fetchCommandIncidents())
      );
      const unsubReports = onSnapshot(
        query(collection(db, "incident_reports"), orderBy("createdAt", "desc"), limit(30)),
        async () => callback(await fetchCommandIncidents())
      );
      return () => {
        unsubSos();
        unsubReports();
      };
    }
  }

  let active = true;
  const poll = async () => {
    while (active) {
      callback(await fetchCommandIncidents());
      await new Promise((r) => setTimeout(r, 3000));
    }
  };
  poll();
  return () => {
    active = false;
  };
}

export async function assignIncidentToUnit(input: {
  incidentId: string;
  source: IncidentSource;
  unitId: string;
  unitName: string;
  etaMinutes: number;
  operatorId: string;
}) {
  await saveAssignment(input.incidentId, {
    status: "assigned",
    assignedUnit: input.unitName,
    etaMinutes: input.etaMinutes,
  });

  const units = await getResponseUnits();
  const updated = units.map((u) =>
    u.id === input.unitId
      ? {
          ...u,
          status: "responding" as const,
          assignedIncidentId: input.incidentId,
          etaMinutes: input.etaMinutes,
        }
      : u
  );
  await AsyncStorage.setItem(UNITS_KEY, JSON.stringify(updated));

  await appendAuditLog({
    operatorId: input.operatorId,
    action: "assign_unit",
    incidentId: input.incidentId,
    details: `${input.unitName} assigned (ETA ${input.etaMinutes} min)`,
  });

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db && input.source === "sos") {
      await updateDoc(doc(db, "sos_alerts", input.incidentId), {
        assignedUnit: input.unitName,
        etaMinutes: input.etaMinutes,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export async function resolveCommandIncident(input: {
  incidentId: string;
  source: IncidentSource;
  operatorId: string;
}) {
  await saveAssignment(input.incidentId, { status: "resolved" });

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (!db) return;

    const collectionName =
      input.source === "sos"
        ? "sos_alerts"
        : input.source === "report"
          ? "incident_reports"
          : input.source === "missing"
            ? "missing_persons"
            : null;

    if (collectionName) {
      await updateDoc(doc(db, collectionName, input.incidentId), {
        status: input.source === "missing" ? "found" : "resolved",
        updatedAt: new Date().toISOString(),
      });
    }
  } else {
    if (input.source === "sos") {
      await updateLocalItem(LOCAL_KEYS.sos, input.incidentId, {
        status: "resolved",
        updatedAt: new Date().toISOString(),
      });
    }
    if (input.source === "report") {
      await updateLocalItem(LOCAL_KEYS.reports, input.incidentId, {
        status: "resolved",
      });
    }
    if (input.source === "missing") {
      await updateLocalItem(LOCAL_KEYS.missing, input.incidentId, {
        status: "found",
      });
    }
  }

  await appendAuditLog({
    operatorId: input.operatorId,
    action: "resolve_incident",
    incidentId: input.incidentId,
    details: "Incident marked resolved",
  });
}

export async function getResponseUnits(): Promise<ResponseUnit[]> {
  const raw = await AsyncStorage.getItem(UNITS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(UNITS_KEY, JSON.stringify(DEFAULT_UNITS));
    return DEFAULT_UNITS;
  }
  try {
    return JSON.parse(raw) as ResponseUnit[];
  } catch {
    return DEFAULT_UNITS;
  }
}

export async function appendAuditLog(input: {
  operatorId: string;
  action: string;
  incidentId?: string;
  details?: string;
}) {
  const entry: AuditLogEntry = {
    id: createId(),
    operatorId: input.operatorId,
    action: input.action,
    incidentId: input.incidentId,
    details: input.details,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await setDoc(doc(db, "audit_log", entry.id), entry);
      return entry;
    }
  }

  await appendLocalItem(AUDIT_KEY, entry);
  return entry;
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      const snap = await getDocs(
        query(collection(db, "audit_log"), orderBy("createdAt", "desc"), limit(50))
      );
      return snap.docs.map((d) => d.data() as AuditLogEntry);
    }
  }
  return readLocalCollection<AuditLogEntry>(AUDIT_KEY);
}

export async function getActiveSosCount() {
  const incidents = await fetchCommandIncidents();
  return incidents.filter((i) => i.source === "sos" && i.status === "active").length;
}

export { listActiveSosIncidents };
