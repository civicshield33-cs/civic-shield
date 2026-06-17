export type GambiaRegion =
  | "Banjul"
  | "Kanifing"
  | "West Coast"
  | "North Bank"
  | "Lower River"
  | "Central River"
  | "Upper River";

export type FloodAlert = {
  id: string;
  region: GambiaRegion;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  createdAt: string;
  active: boolean;
};

export type TouristProfile = {
  hotelName: string;
  hotelPhone: string;
  embassyName: string;
  embassyPhone: string;
  emergencyContact: string;
  registeredAt: string;
};

export type EmergencyPhrase = {
  id: string;
  english: string;
  translation: string;
  language: string;
  category: "help" | "medical" | "police" | "fire";
};

export const GAMBIA_REGIONS: GambiaRegion[] = [
  "Banjul",
  "Kanifing",
  "West Coast",
  "North Bank",
  "Lower River",
  "Central River",
  "Upper River",
];
