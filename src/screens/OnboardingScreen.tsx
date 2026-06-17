import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";

import { markOnboardingComplete } from "../services/gambiaService";
import { useSettingsStore } from "../store/settingsStore";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "🛡️",
    title: "Welcome to Civic Shield",
    body: "Your national emergency and community safety platform for The Gambia.",
  },
  {
    icon: "🚨",
    title: "How SOS Works",
    body: "Press and hold the SOS button for 3 seconds. You get 15 seconds to cancel before alerts go out with your live location.",
  },
  {
    icon: "👥",
    title: "Add Trusted Contacts",
    body: "Add family or friends who receive SMS and WhatsApp alerts with a live tracking link when you trigger SOS.",
  },
  {
    icon: "🤫",
    title: "Silent Activation",
    body: "Set a secret PIN, shake your phone 3 times, or say your emergency phrase. Enable Women's Safety Mode for discreet alerts.",
  },
  {
    icon: "🌊",
    title: "Community & Flood Alerts",
    body: "Report incidents, receive regional safety alerts, and get rainy-season flood warnings for your area.",
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState(0);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const finish = async () => {
    await markOnboardingComplete();
    await updateSettings({ onboardingComplete: true });
    navigation.replace("Welcome");
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.slide}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === step && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        {!isLast ? (
          <>
            <TouchableOpacity onPress={finish}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setStep((s) => s + 1)}
            >
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.finishBtn} onPress={finish}>
            <Text style={styles.finishText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001F3F",
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },
  slide: { flex: 1, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 64, marginBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    maxWidth: width * 0.85,
  },
  body: {
    fontSize: 16,
    color: "#BFDBFE",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: width * 0.85,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: { backgroundColor: "#fff", width: 24 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skip: { color: "#93C5FD", fontSize: 16 },
  nextBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextText: { color: "#001F3F", fontWeight: "700", fontSize: 16 },
  finishBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  finishText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
