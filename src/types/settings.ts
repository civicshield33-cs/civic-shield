export type SafetySettings = {
  silentPin: string;
  voicePhrase: string;
  shakeEnabled: boolean;
  powerButtonEnabled: boolean;
  voiceEnabled: boolean;
  silentMode: boolean;
  womensSafetyMode: boolean;
  hiddenButtonEnabled: boolean;
  sosDelay: number;
  language: string;
  touristMode: boolean;
  lowBandwidthMode: boolean;
  onboardingComplete: boolean;
};

export const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  silentPin: "",
  voicePhrase: "help me now",
  shakeEnabled: true,
  powerButtonEnabled: false,
  voiceEnabled: true,
  silentMode: false,
  womensSafetyMode: false,
  hiddenButtonEnabled: true,
  sosDelay: 5,
  language: "English",
  touristMode: false,
  lowBandwidthMode: false,
  onboardingComplete: false,
};
