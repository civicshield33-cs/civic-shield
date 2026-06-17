import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_SAFETY_SETTINGS,
  SafetySettings,
} from "../types/settings";

const SETTINGS_KEY = "SAFETY_SETTINGS";

export async function loadSafetySettings(): Promise<SafetySettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SAFETY_SETTINGS };

  try {
    return { ...DEFAULT_SAFETY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SAFETY_SETTINGS };
  }
}

export async function saveSafetySettings(settings: SafetySettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function updateSafetySettings(patch: Partial<SafetySettings>) {
  const current = await loadSafetySettings();
  const next = { ...current, ...patch };
  await saveSafetySettings(next);
  return next;
}
