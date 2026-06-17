import { create } from "zustand";

interface SOSState {
  active: boolean;
  countdown: number;
  incidentId: string | null;
  contactsNotified: boolean;

  activate: (incidentId?: string) => void;
  deactivate: () => void;
  setCountdown: (value: number) => void;
  setIncidentId: (id: string | null) => void;
  setContactsNotified: (value: boolean) => void;
}

export const useSOSStore = create<SOSState>((set) => ({
  active: false,
  countdown: 15,
  incidentId: null,
  contactsNotified: false,

  activate: (incidentId) =>
    set({
      active: true,
      incidentId: incidentId ?? null,
    }),

  deactivate: () =>
    set({
      active: false,
      countdown: 15,
      incidentId: null,
      contactsNotified: false,
    }),

  setCountdown: (value) =>
    set({
      countdown: value,
    }),

  setIncidentId: (id) => set({ incidentId: id }),

  setContactsNotified: (value) => set({ contactsNotified: value }),
}));
