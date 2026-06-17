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
} from "react-native";

import StatusRow from "../components/StatusRow";
import { useSOSStore } from "../store/sosStore";
import { getStoredUser } from "../utils/auth";
import { getCurrentUserId } from "../services/authService";
import { getLocalContacts } from "../services/contactService";
import {
  createSosIncident,
  getCurrentLocation,
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
  const [trackingUrl, setTrackingUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const boot = async () => {
      if (!silent) {
        Vibration.vibrate([200, 200, 300]);
      }

      const [user, point, userId] = await Promise.all([
        getStoredUser(),
        getCurrentLocation(),
        getCurrentUserId(),
      ]);

      if (point) {
        setLocation({
          latitude: point.latitude,
          longitude: point.longitude,
        });
      }

      const incident = await createSosIncident({
        userId,
        userName: user?.fullName || "Civic Shield User",
        userPhone: user?.phone || "",
        location: point,
      });

      setIncidentId(incident.id);
      activate(incident.id);
      setTrackingUrl(getTrackingUrl(incident.id));
      setCurrentStep(1);

      await startEmergencyRecording();
      setCurrentStep(2);

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
      setCurrentStep(4);
      setReady(true);
    };

    boot().catch(() => {
      showAlert("Error", "Could not fully start emergency mode.");
      setReady(true);
    });
  }, [activate, setContactsNotified, setIncidentId]);

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
    if (countdown === 0) {
      const { incidentId } = useSOSStore.getState();
      if (incidentId) {
        stopEmergencyRecording(incidentId).catch(() => undefined);
      }
      navigation.replace("Tracking", { incidentId });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigation, setCountdown]);

  const shareIncident = async () => {
    if (!trackingUrl) return;
    await Share.share({
      message: `🚨 EMERGENCY ALERT LIVE\n\nTrack incident:\n${trackingUrl}`,
    });
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!silent ? <Text style={styles.bellIcon}>🚨</Text> : null}
        <Text style={styles.title}>{headerTitle}</Text>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>

        <View style={styles.statusContainer}>
          {STATUS_STEPS.map((item, index) => (
            <StatusRow key={item} text={item} active={index <= currentStep} />
          ))}
        </View>

        {location ? (
          <View style={styles.locationBox}>
            <Text style={styles.locationTitle}>📍 Live Location Captured</Text>
            <Text style={styles.locationText}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.shareBtn} onPress={shareIncident}>
          <Text style={styles.shareText}>🔗 Share Live Incident</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergency}>
        <Text style={styles.cancelText}>Cancel ({countdown}s)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#B91C1C" },
  header: { paddingTop: 50, paddingHorizontal: 20 },
  backArrow: { fontSize: 28, color: "#FFFFFF", fontWeight: "bold" },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  bellIcon: { fontSize: 90, marginTop: 20, marginBottom: 10 },
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
  locationTitle: { color: "#fff", fontWeight: "700", marginBottom: 5 },
  locationText: { color: "#fff", opacity: 0.9 },
  shareBtn: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  shareText: { color: "#fff", fontWeight: "700" },
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
