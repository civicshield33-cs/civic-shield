import { useSOSStore } from "../store/sosStore";

export type SilentSOSOptions = {
  silent?: boolean;
  skipHold?: boolean;
};

export function prepareSilentSOS(options: SilentSOSOptions = {}) {
  const { activate } = useSOSStore.getState();
  activate();
  return {
    screen: options.skipHold ? "Emergency" : "HoldSOS",
    params: { silent: options.silent ?? true },
  };
}
