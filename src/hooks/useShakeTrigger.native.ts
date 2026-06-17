import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

import { useSettingsStore } from "../store/settingsStore";

type TriggerHandler = () => void;

const SHAKE_THRESHOLD = 1.8;
const SHAKE_COUNT_REQUIRED = 3;
const SHAKE_WINDOW_MS = 2000;

export function useShakeTrigger(onTrigger: TriggerHandler) {
  const shakeEnabled = useSettingsStore((s) => s.settings.shakeEnabled);
  const shakeCount = useRef(0);
  const lastShake = useRef(0);

  useEffect(() => {
    if (!shakeEnabled) return;

    Accelerometer.setUpdateInterval(120);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude < SHAKE_THRESHOLD) return;

      const now = Date.now();
      if (now - lastShake.current > SHAKE_WINDOW_MS) {
        shakeCount.current = 0;
      }

      lastShake.current = now;
      shakeCount.current += 1;

      if (shakeCount.current >= SHAKE_COUNT_REQUIRED) {
        shakeCount.current = 0;
        onTrigger();
      }
    });

    return () => sub.remove();
  }, [shakeEnabled, onTrigger]);
}
