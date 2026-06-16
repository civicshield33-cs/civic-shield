import { create } from "zustand";

interface SOSState {
  active: boolean;
  countdown: number;

  activate: () => void;
  deactivate: () => void;
  setCountdown: (value: number) => void;
}

export const useSOSStore =
  create<SOSState>((set) => ({
    active: false,
    countdown: 15,

    activate: () =>
      set({
        active: true,
      }),

    deactivate: () =>
      set({
        active: false,
        countdown: 15,
      }),

    setCountdown: (value) =>
      set({
        countdown: value,
      }),
  }));