import { useEffect } from "react";

type TriggerHandler = () => void;

/** Shake detection is not available on web. */
export function useShakeTrigger(_onTrigger: TriggerHandler) {
  useEffect(() => {
    // no-op on web
  }, []);
}
