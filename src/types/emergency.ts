export type GeoPoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type SosIncident = {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  status: "active" | "resolved" | "cancelled";
  createdAt: string;
  updatedAt: string;
  location: GeoPoint | null;
  locationTrail: GeoPoint[];
  locationArea?: string;
  locationSource?: "gps" | "nearby";
  contactsNotified: boolean;
  audioUrl?: string;
  photoUrl?: string;
};

export type IncidentReport = {
  id: string;
  userId: string;
  type: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  status: "open" | "resolved";
  createdAt: string;
};

export type CommunityAlert = {
  id: string;
  type: "fire" | "flood" | "crime" | "accident" | "other";
  title: string;
  location: string;
  severity: "critical" | "high" | "medium" | "low";
  createdAt: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  userId?: string;
  reportId?: string;
};

export type MissingPersonReport = {
  id: string;
  userId: string;
  fullName: string;
  age?: string;
  lastSeen: string;
  location: string;
  photoUrl?: string;
  status: "open" | "found";
  createdAt: string;
};

export type SafeWalkJourney = {
  id: string;
  userId: string;
  userName: string;
  status: "active" | "completed" | "cancelled" | "sos";
  destination?: string;
  createdAt: string;
  updatedAt: string;
  locationTrail: GeoPoint[];
};

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};
