import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";

import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { appendLocalItem, LOCAL_KEYS } from "./localStore";
import { CommunityAlert } from "../types/emergency";
import {
  EmergencyPhrase,
  FloodAlert,
  GambiaRegion,
  TouristProfile,
} from "../types/gambia";

const TOURIST_KEY = "TOURIST_PROFILE";
const FLOOD_KEY = "FLOOD_ALERTS";
const ONBOARDING_KEY = "ONBOARDING_COMPLETE";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_FLOOD_ALERTS: FloodAlert[] = [
  {
    id: "flood-ban-1",
    region: "Banjul",
    title: "Heavy Rain Advisory",
    description:
      "Heavy rainfall expected in Banjul and surrounding areas. Low-lying zones may flood.",
    severity: "high",
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: "flood-wc-1",
    region: "West Coast",
    title: "Coastal Flood Watch",
    description:
      "West Coast Region: monitor coastal roads near Brikama and Sukuta during high tide.",
    severity: "medium",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    active: true,
  },
  {
    id: "flood-nb-1",
    region: "North Bank",
    title: "River Level Rising",
    description:
      "Gambia River levels rising near Farafenni. Ferry crossings may be delayed.",
    severity: "high",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    active: true,
  },
];

export const EMERGENCY_PHRASES: EmergencyPhrase[] = [
  {
    id: "1",
    english: "Help me, I need emergency assistance",
    translation: "Demal ma, maa ngay soxla ndimbal",
    language: "Wolof",
    category: "help",
  },
  {
    id: "2",
    english: "Call the police",
    translation: "Wo lepolisi",
    language: "Wolof",
    category: "police",
  },
  {
    id: "3",
    english: "I need a doctor",
    translation: "Maa ngay soxla dokotor",
    language: "Wolof",
    category: "medical",
  },
  {
    id: "4",
    english: "There is a fire",
    translation: "Dafay jonta",
    language: "Wolof",
    category: "fire",
  },
  {
    id: "5",
    english: "Help me, I need emergency assistance",
    translation: "A n ma wan, n tun mako la",
    language: "Mandinka",
    category: "help",
  },
  {
    id: "6",
    english: "Call the police",
    translation: "Polisi wele",
    language: "Mandinka",
    category: "police",
  },
  {
    id: "7",
    english: "Help me please",
    translation: "Secourir-moi s'il vous plaît",
    language: "French",
    category: "help",
  },
  {
    id: "8",
    english: "I need an ambulance",
    translation: "J'ai besoin d'une ambulance",
    language: "French",
    category: "medical",
  },
];

export async function getFloodAlerts(region?: GambiaRegion): Promise<FloodAlert[]> {
  const raw = await AsyncStorage.getItem(FLOOD_KEY);
  let alerts: FloodAlert[] = raw ? JSON.parse(raw) : DEFAULT_FLOOD_ALERTS;

  if (!raw) {
    await AsyncStorage.setItem(FLOOD_KEY, JSON.stringify(DEFAULT_FLOOD_ALERTS));
  }

  const filtered = alerts.filter((a) => a.active);
  if (!region) return filtered;
  return filtered.filter((a) => a.region === region);
}

export async function publishFloodAlert(alert: Omit<FloodAlert, "id" | "createdAt">) {
  const entry: FloodAlert = {
    ...alert,
    id: createId(),
    createdAt: new Date().toISOString(),
  };

  const existing = await getFloodAlerts();
  const next = [entry, ...existing];
  await AsyncStorage.setItem(FLOOD_KEY, JSON.stringify(next));

  const communityAlert: CommunityAlert = {
    id: `flood-${entry.id}`,
    type: "flood",
    title: entry.title,
    location: entry.region,
    severity: entry.severity === "critical" ? "critical" : "high",
    createdAt: entry.createdAt,
    description: entry.description,
  };

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb();
    if (db) {
      await setDoc(doc(db, "community_alerts", communityAlert.id), communityAlert);
    }
  } else {
    await appendLocalItem(LOCAL_KEYS.alerts, communityAlert);
  }

  return entry;
}

export async function saveTouristProfile(profile: TouristProfile) {
  await AsyncStorage.setItem(TOURIST_KEY, JSON.stringify(profile));
  return profile;
}

export async function getTouristProfile(): Promise<TouristProfile | null> {
  const raw = await AsyncStorage.getItem(TOURIST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TouristProfile;
  } catch {
    return null;
  }
}

export async function isOnboardingComplete() {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === "true";
}

export async function markOnboardingComplete() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export function filterAlertsByRegion<T extends { location: string }>(
  items: T[],
  region: GambiaRegion
) {
  const keywords: Record<GambiaRegion, string[]> = {
    Banjul: ["banjul", "capital"],
    Kanifing: ["kanifing", "serrekunda", "bakau", "kololi", "westfield"],
    "West Coast": ["west coast", "brikama", "sukuta", "gunjur", "tanji"],
    "North Bank": ["north bank", "farafenni", "kerewan", "essau"],
    "Lower River": ["lower river", "soma", "mansakonko"],
    "Central River": ["central river", "janjanbureh", "bansang"],
    "Upper River": ["upper river", "basse", "fatoto"],
  };

  const terms = keywords[region];
  return items.filter((item) =>
    terms.some((t) => item.location.toLowerCase().includes(t))
  );
}
