import { useEffect } from "react";
import { Platform } from "react-native";

import { useSettingsStore } from "../store/settingsStore";

export { useShakeTrigger } from "./useShakeTrigger";

type TriggerHandler = () => void;

export function useVoiceTrigger(onTrigger: TriggerHandler) {
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled);
  const voicePhrase = useSettingsStore((s) => s.settings.voicePhrase);

  useEffect(() => {
    if (!voiceEnabled || Platform.OS !== "web") return;
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GM";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ")
        .toLowerCase();

      const phrases = [
        voicePhrase.toLowerCase(),
        "help me now",
        "red alert",
      ].filter(Boolean);

      if (phrases.some((p) => transcript.includes(p))) {
        onTrigger();
      }
    };

    recognition.onerror = () => undefined;
    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [voiceEnabled, voicePhrase, onTrigger]);
}
