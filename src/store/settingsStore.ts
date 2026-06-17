import { create } from "zustand";

import {
  loadSafetySettings,
  saveSafetySettings,
} from "../services/settingsService";
import {
  DEFAULT_SAFETY_SETTINGS,
  SafetySettings,
} from "../types/settings";

type SettingsState = {
  settings: SafetySettings;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<SafetySettings>) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_SAFETY_SETTINGS },
  loaded: false,

  loadSettings: async () => {
    const settings = await loadSafetySettings();
    set({ settings, loaded: true });
  },

  updateSettings: async (patch) => {
    const next = { ...get().settings, ...patch };
    await saveSafetySettings(next);
    set({ settings: next });
  },
}));
