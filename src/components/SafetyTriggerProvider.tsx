import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { useShakeTrigger, useVoiceTrigger } from "../hooks/useSafetyTriggers";
import { useSettingsStore } from "../store/settingsStore";
import { prepareSilentSOS } from "../utils/silentSOS";

export default function SafetyTriggerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = useNavigation<any>();
  const womensSafetyMode = useSettingsStore((s) => s.settings.womensSafetyMode);
  const silentMode = useSettingsStore((s) => s.settings.silentMode);

  const triggerSilent = useCallback(() => {
    const { screen, params } = prepareSilentSOS({
      silent: silentMode || womensSafetyMode,
      skipHold: true,
    });
    navigation.navigate(screen, params);
  }, [navigation, silentMode, womensSafetyMode]);

  useShakeTrigger(triggerSilent);
  useVoiceTrigger(triggerSilent);

  return <>{children}</>;
}
