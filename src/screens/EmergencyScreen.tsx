import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Share,
  Vibration,
  Platform,
} from "react-native";

import StatusRow from "../components/StatusRow";
import { useSOSStore } from "../store/sosStore";
import { getStoredUser } from "../utils/auth";
import { getCurrentUserId } from "../services/authService";
import { getLocalContacts } from "../services/contactService";
import {
  createSosIncident,
  resolveSosLocation,
  markContactsNotified,
  notifyEmergencyContacts,
} from "../services/sosService";
import {
  startEmergencyRecording,
  stopEmergencyRecording,
} from "../services/evidenceService";
import { getTrackingUrl } from "../config/app";
import { showAlert } from "../utils/alert";

const STATUS_STEPS = [
  "Sending alerts...",
  "Recording audio...",
  "GPS tracking active...",
  "Alerting emergency contacts...",
  "Connecting to responders...",
];

export default function EmergencyScreen({ navigation, route }: any) {
  const {
    countdown,
    setCountdown,
    activate,
    deactivate,
    setIncidentId,
    setContactsNotified,
  } = useSOSStore();

  const silent =
    route?.params?.silent ||
    route?.params?.silentMode ||
    false;

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationArea, setLocationArea] = useState("");
  const [locationSource, setLocationSource] = useState<"gps" | "nearby">(
    "gps"
  );
  const [trackingUrl, setTrackingUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);
  const wentToTrackingRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const boot = async () => {
      if (!silent) {
        Vibration.vibrate([200, 200, 300]);
      }

      const user = await getStoredUser();
      const userId = await getCurrentUserId();
      const resolved = await resolveSosLocation("Banjul");

      setLocation({
        latitude: resolved.point.latitude,
        longitude: resolved.point.longitude,
      });
      setLocationArea(resolved.areaLabel);
      setLocationSource(resolved.source);

      const incident = await createSosIncident({
        userId,
        userName: user?.fullName || "Civic Shield User",
        userPhone: user?.phone || "",
        location: resolved.point,
        locationArea: resolved.areaLabel,
        locationSource: resolved.source,
      });

      setIncidentId(incident.id);
      activate(incident.id);
      setTrackingUrl(getTrackingUrl(incident.id));
      setCurrentStep(1);

      try {
        await startEmergencyRecording();
      } catch {
        // Microphone unavailable on web/some devices — SOS still continues.
      }
      setCurrentStep(2);

      try {
        const contacts = await getLocalContacts();
        if (contacts.length > 0) {
          await notifyEmergencyContacts(
            contacts,
            incident.id,
            user?.fullName || "A Civic Shield user"
          );
          await markContactsNotified(incident.id);
          setContactsNotified(true);
        }
      } catch {
        // Contact alerts are best-effort; don't block emergency mode.
      }

      setCurrentStep(4);
      setReady(true);
      setCountdown(15);
    };

    boot().catch(() => {
      const { incidentId } = useSOSStore.getState();
      if (!incidentId) {
        showAlert(
          "Error",
          "Could not start emergency mode. Please try again or call 117."
        );
      }
      setReady(true);
    });
  }, [activate, setContactsNotified, setIncidentId, silent]);

  useEffect(() => {
    if (!ready) return;
    if (currentStep < STATUS_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((step) => step + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentStep, ready]);

  useEffect(() => {
    if (!ready) return;

    if (countdown <= 0) {
      if (wentToTrackingRef.current) return;
      wentToTrackingRef.current = true;

      const { incidentId } = useSOSStore.getState();
      if (incidentId) {
        stopEmergencyRecording(incidentId).catch(() => undefined);
      }
      navigation.replace("MainTabs", {
        screen: "TrackingTab",
        params: { incidentId },
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigation, ready, setCountdown]);

  const goToTrackingNow = () => {
    setCountdown(0);
  };

  const shareIncident = async () => {
    if (!trackingUrl) return;
    try {
      await Share.share({
        message: `🚨 EMERGENCY ALERT LIVE\n\nTrack incident:\n${trackingUrl}`,
      });
    } catch {
      // Share cancelled or unavailable.
    }
  };

  const cancelEmergency = async () => {
    const { incidentId } = useSOSStore.getState();
    if (incidentId) {
      const { cancelSosIncident } = await import("../services/sosService");
      await stopEmergencyRecording(incidentId).catch(() => undefined);
      await cancelSosIncident(incidentId);
    }
    deactivate();
    setCountdown(15);
    navigation.navigate("MainTabs");
  };

  const bgColor = silent ? "#1E293B" : "#B91C1C";
  const headerTitle = silent ? "Safety check active" : "EMERGENCY ACTIVATED";
  const headerSubtitle = silent
    ? "Alerts sent discreetly. Help is on the way."
    : "Help is being dispatched immediately";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />

      <View style={styles.header}>
        <TouchableOpacity onPress={cancelEmergency}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        bounces
      >
        {!silent ? <Text style={styles.bellIcon}>🚨</Text> : null}
        <Text style={styles.title}>{headerTitle}</Text>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>

        <View style={styles.statusContainer}>
          {STATUS_STEPS.map((item, index) => (
            <StatusRow
              key={item}
              text={item}
              checked={index <= currentStep}
            />
          ))}
        </View>

        {location ? (
          <View style={styles.locationBox}>
            <Text style={styles.locationTitle}>
              📍{" "}
              {locationSource === "gps"
                ? "Live Location Captured"
                : "Nearby Area Recorded"}
            </Text>
            <Text style={styles.locationText}>{locationArea}</Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
            {locationSource === "nearby" ? (
              <Text style={styles.locationNote}>
                GPS permission denied — using nearest known area. Enable location
                on Tracking for live updates.
              </Text>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity style={styles.shareBtn} onPress={shareIncident}>
          <Text style={styles.shareText}>🔗 Share Live Incident</Text>
        </TouchableOpacity>

        <Text style={styles.autoContinueText}>
          Continuing to live tracking in {countdown}s…
        </Text>

        <TouchableOpacity style={styles.continueButton} onPress={goToTrackingNow}>
          <Text style={styles.continueText}>Go to live tracking now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergency}>
          <Text style={styles.cancelText}>Cancel SOS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B91C1C",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backArrow: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  scroll: {
    flex: 1,
    ...(Platform.OS === "web"
      ? ({ overflowY: "auto", WebkitOverflowScrolling: "touch" } as object)
      : null),
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 40,
  },
  bellIcon: {
    fontSize: 72,
    marginTop: 8,
    marginBottom: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 24,
  },
  statusContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  locationBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 15,
    borderRadius: 14,
    width: "100%",
    marginBottom: 16,
  },
  locationTitle: { color: "#fff", fontWeight: "700", marginBottom: 5 },
  locationText: { color: "#fff", fontWeight: "600", marginBottom: 4 },
  locationCoords: { color: "#fff", opacity: 0.9 },
  locationNote: {
    color: "#FEE2E2",
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  shareBtn: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  shareText: { color: "#fff", fontWeight: "700" },
  autoContinueText: {
    color: "#FEE2E2",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  continueText: {
    color: "#B91C1C",
    fontSize: 17,
    fontWeight: "800",
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginTop: 4,
  },
  cancelText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
