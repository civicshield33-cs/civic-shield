import { GeoPoint } from "./emergency";

export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "active" | "assigned" | "resolved" | "cancelled";
export type IncidentSource = "sos" | "report" | "missing" | "flood";

export type CommandIncident = {
  id: string;
  source: IncidentSource;
  title: string;
  location: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
  userName?: string;
  userPhone?: string;
  description?: string;
  assignedUnit?: string;
  etaMinutes?: number;
  audioUrl?: string;
  photoUrl?: string;
  locationTrail?: GeoPoint[];
};

export type ResponseUnit = {
  id: string;
  name: string;
  type: "police" | "ambulance" | "fire" | "rapid";
  status: "available" | "responding" | "offline";
  latitude: number;
  longitude: number;
  assignedIncidentId?: string;
  etaMinutes?: number;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  incidentId?: string;
  operatorId: string;
  createdAt: string;
  details?: string;
};

export const DEFAULT_UNITS: ResponseUnit[] = [
  {
    id: "police-08",
    name: "Police Unit P-08",
    type: "police",
    status: "available",
    latitude: 13.463,
    longitude: -16.605,
  },
  {
    id: "ambulance-12",
    name: "Ambulance A-12",
    type: "ambulance",
    status: "available",
    latitude: 13.441,
    longitude: -16.654,
  },
  {
    id: "fire-04",
    name: "Fire Unit F-04",
    type: "fire",
    status: "available",
    latitude: 13.482,
    longitude: -16.631,
  },
  {
    id: "rapid-02",
    name: "Rapid Response R-02",
    type: "rapid",
    status: "available",
    latitude: 13.45,
    longitude: -16.62,
  },
];

export const OPERATOR_PIN =
  process.env.EXPO_PUBLIC_OPERATOR_PIN || "112233";
