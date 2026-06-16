import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Share,
  Vibration,
} from "react-native";

import StatusRow from "../components/StatusRow";
import * as Location from "expo-location";
import { useSOSStore } from "../store/sosStore";

export default function EmergencyScreen({ navigation }: any) {
  const { countdown, setCountdown } = useSOSStore();

  const [location, setLocation] = useState<any>(null);
  const [incidentLink, setIncidentLink] = useState("");

  const [status, setStatus] = useState([
    "Initializing emergency protocol...",
    "Capturing GPS location...",
    "Sending distress signal...",
    "Alerting nearby responders...",
    "Police units notified...",
  ]);

  const [currentStep, setCurrentStep] = useState(0);

  // -----------------------------
  // LOCATION CAPTURE
  // -----------------------------
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // -----------------------------
  // STATUS PROGRESSION (REAL-TIME FEEL)
  // -----------------------------
  useEffect(() => {
    if (currentStep < status.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((p) => p + 1);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // -----------------------------
  // SHARE INCIDENT LINK
  // -----------------------------
  const shareIncident = async () => {
    const id = Math.floor(Math.random() * 999999);
    const link = `https://safewalk.app/emergency/${id}`;

    setIncidentLink(link);

    await Share.share({
      message: `🚨 EMERGENCY ALERT LIVE\n\nTrack incident:\n${link}`,
    });
  };

  // -----------------------------
  // COUNTDOWN NAVIGATION
  // -----------------------------
  useEffect(() => {
    if (countdown === 0) {
      navigation.replace("Tracking");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // -----------------------------
  // INITIAL ALERT FEEDBACK
  // -----------------------------
  useEffect(() => {
    Vibration.vibrate([200, 200, 300]);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ICON */}
        <Text style={styles.bellIcon}>🚨</Text>

        {/* TITLE */}
        <Text style={styles.title}>EMERGENCY ACTIVATED</Text>

        <Text style={styles.subtitle}>
          Help is being dispatched immediately
        </Text>

        {/* LIVE STATUS PANEL */}
        <View style={styles.statusContainer}>
          {status.map((item, index) => (
            <StatusRow
              key={index}
              text={item}
              active={index <= currentStep}
            />
          ))}
        </View>

        {/* LOCATION DISPLAY */}
        {location && (
          <View style={styles.locationBox}>
            <Text style={styles.locationTitle}>
              📍 Live Location Captured
            </Text>
            <Text style={styles.locationText}>
              {location.latitude.toFixed(5)},{" "}
              {location.longitude.toFixed(5)}
            </Text>
          </View>
        )}

        {/* SHARE BUTTON */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={shareIncident}
        >
          <Text style={styles.shareText}>
            🔗 Share Live Incident
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CANCEL / STATUS BUTTON */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>
          Cancel ({countdown}s)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B91C1C",
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  backArrow: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },

  bellIcon: {
    fontSize: 90,
    marginTop: 20,
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 30,
  },

  statusContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },

  locationBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 15,
    borderRadius: 14,
    width: "100%",
    marginBottom: 20,
  },

  locationTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 5,
  },

  locationText: {
    color: "#fff",
    opacity: 0.9,
  },

  shareBtn: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },

  shareText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 25,
    marginBottom: 40,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  cancelText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});