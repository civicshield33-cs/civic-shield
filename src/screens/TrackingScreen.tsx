import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Share,
  Linking,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TrackingMap from "../components/TrackingMap";
import { getTrackingUrl } from "../config/app";
import { useSOSStore } from "../store/sosStore";
import {
  appendSosLocation,
  getSosIncident,
  resolveSosIncident,
  subscribeSosIncident,
} from "../services/sosService";
import { GeoPoint, SosIncident } from "../types/emergency";
import { confirmAlert } from "../utils/alert";

const POLICE_NUMBER = "117";
const TAB_BAR_PADDING = 88;

function formatClockTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatElapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just started";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function LivePulse() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <View style={styles.liveBadge}>
      <Animated.View style={[styles.liveDot, { transform: [{ scale }] }]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
}

export default function TrackingScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const storeIncidentId = useSOSStore((state) => state.incidentId);
  const incidentId = route?.params?.incidentId || storeIncidentId;
  const contactsNotified = useSOSStore((state) => state.contactsNotified);
  const deactivate = useSOSStore((state) => state.deactivate);

  const [mapType, setMapType] = useState<"hybrid" | "standard">("hybrid");
  const [trail, setTrail] = useState<GeoPoint[]>([]);
  const [current, setCurrent] = useState<GeoPoint | null>(null);
  const [incident, setIncident] = useState<SosIncident | null>(null);
  const [lastUpdate, setLastUpdate] = useState("Just now");
  const mapRef = useRef<MapView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const trackingUrl = incidentId ? getTrackingUrl(incidentId) : "";
  const bottomPadding = insets.bottom + TAB_BAR_PADDING;

  useEffect(() => {
    if (!incidentId) return;

    const unsub = subscribeSosIncident(incidentId, (next) => {
      if (!next) return;
      setIncident(next);
      setTrail(next.locationTrail);
      if (next.location) setCurrent(next.location);
    });

    return unsub;
  }, [incidentId]);

  useEffect(() => {
    if (!incidentId) return;

    const startWatch = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 3000,
        },
        async (loc) => {
          const point: GeoPoint = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: new Date().toISOString(),
          };
          setCurrent(point);
          setLastUpdate("Just now");
          await appendSosLocation(incidentId, point, {
            locationArea: "Live GPS",
            locationSource: "gps",
          });

          mapRef.current?.animateToRegion({
            latitude: point.latitude,
            longitude: point.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      );
    };

    startWatch();
    getSosIncident(incidentId).then((loaded) => {
      if (!loaded) return;
      setIncident(loaded);
      if (loaded.locationTrail?.length) {
        setTrail(loaded.locationTrail);
        setCurrent(loaded.locationTrail[loaded.locationTrail.length - 1]);
      }
    });

    return () => {
      watchRef.current?.remove();
    };
  }, [incidentId]);

  useEffect(() => {
    if (!current) return;
    const timer = setInterval(() => {
      const diff = Date.now() - new Date(current.timestamp).getTime();
      const secs = Math.floor(diff / 1000);
      if (secs < 10) {
        setLastUpdate("Just now");
      } else if (secs < 60) {
        setLastUpdate(`${secs}s ago`);
      } else {
        setLastUpdate(`${Math.floor(secs / 60)}m ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const timeline = useMemo(() => {
    const startedAt = incident?.createdAt;
    const notified = incident?.contactsNotified ?? contactsNotified;

    return [
      {
        key: "sos",
        label: "SOS sent",
        time: startedAt ? formatClockTime(startedAt) : "—",
        state: "done" as const,
      },
      {
        key: "contacts",
        label: notified
          ? "Emergency contacts notified"
          : "Alerting emergency contacts…",
        time: notified && startedAt ? formatClockTime(startedAt) : "In progress",
        state: notified ? ("done" as const) : ("active" as const),
      },
      {
        key: "gps",
        label: current ? "GPS updating live" : "Waiting for GPS signal…",
        time: lastUpdate,
        state: current ? ("active" as const) : ("pending" as const),
      },
      {
        key: "responders",
        label: "Connecting responders",
        time: "Stand by",
        state: current ? ("active" as const) : ("pending" as const),
      },
    ];
  }, [incident, contactsNotified, current, lastUpdate]);

  const shareLiveLink = async () => {
    if (!trackingUrl) return;
    try {
      await Share.share({
        message: `🚨 EMERGENCY — track my live location:\n${trackingUrl}`,
      });
    } catch {
      // Share cancelled or unavailable.
    }
  };

  const callPolice = () => {
    Linking.openURL(`tel:${POLICE_NUMBER}`).catch(() => undefined);
  };

  const endEmergency = () => {
    confirmAlert(
      "End emergency?",
      "This will stop live tracking and mark the incident as resolved.",
      async () => {
        if (incidentId) await resolveSosIncident(incidentId);
        deactivate();
        navigation.navigate("MainTabs", { screen: "HomeTab" });
      },
      "End Emergency"
    );
  };

  if (!incidentId) {
    return (
      <View style={[styles.center, { paddingBottom: bottomPadding }]}>
        <Text style={styles.missingTitle}>No active emergency</Text>
        <Text style={styles.missingSubtitle}>
          Start SOS from Home to share your live location.
        </Text>
        <TouchableOpacity
          style={styles.missingBtn}
          onPress={() => navigation.navigate("HomeTab")}
        >
          <Text style={styles.missingBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />

      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Text style={styles.headerEyebrow}>SOS ACTIVE</Text>
          <Text style={styles.headerTitle}>Live Tracking</Text>
        </View>
        <LivePulse />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        bounces
      >
        <View style={styles.mapShell}>
          <TrackingMap
            trail={trail}
            current={current}
            mapType={mapType}
            mapRef={mapRef}
          />

          {Platform.OS !== "web" ? (
            <View style={styles.mapSwitch}>
              <TouchableOpacity onPress={() => setMapType("hybrid")}>
                <Text
                  style={[
                    styles.switchText,
                    mapType === "hybrid" && styles.activeSwitch,
                  ]}
                >
                  Hybrid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMapType("standard")}>
                <Text
                  style={[
                    styles.switchText,
                    mapType === "standard" && styles.activeSwitch,
                  ]}
                >
                  Map
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sessionRow}>
            <View style={styles.sessionIcon}>
              <Text style={styles.sessionEmoji}>🚨</Text>
            </View>
            <View style={styles.sessionCopy}>
              <Text style={styles.sessionTitle}>Sharing live location</Text>
              <Text style={styles.sessionMeta}>
                {incident?.userName || "You"}
                {incident?.userPhone ? ` • ${incident.userPhone}` : ""}
              </Text>
              {incident?.locationArea ? (
                <Text style={styles.sessionMeta}>{incident.locationArea}</Text>
              ) : null}
              {incident?.createdAt ? (
                <Text style={styles.sessionMeta}>
                  Started {formatElapsed(incident.createdAt)}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.timeline}>
            {timeline.map((step) => (
              <TimelineStep key={step.key} {...step} />
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareButton} onPress={shareLiveLink}>
              <Ionicons name="link-outline" size={20} color="#1D4ED8" />
              <Text style={styles.shareButtonText}>Share link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.callButton} onPress={callPolice}>
              <Ionicons name="call-outline" size={20} color="#7F1D1D" />
              <Text style={styles.callButtonText}>Call {POLICE_NUMBER}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.endButton} onPress={endEmergency}>
            <Text style={styles.endButtonText}>End Emergency</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function TimelineStep({
  label,
  time,
  state,
}: {
  label: string;
  time: string;
  state: "done" | "active" | "pending";
}) {
  const dotColor =
    state === "done" ? "#059669" : state === "active" ? "#2563EB" : "#CBD5E1";

  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: dotColor }]}>
        {state === "done" ? (
          <Ionicons name="checkmark" size={10} color="#fff" />
        ) : null}
      </View>
      <View style={styles.timelineCopy}>
        <Text
          style={[
            styles.timelineLabel,
            state === "pending" && styles.timelineLabelMuted,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.timelineTime}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7F1D1D" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  missingSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  missingBtn: {
    backgroundColor: "#001F3F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  missingBtnText: { color: "#fff", fontWeight: "700" },
  header: {
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerMain: { flex: 1 },
  headerEyebrow: {
    color: "#FECACA",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 7,
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FCA5A5",
  },
  liveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  scroll: {
    flex: 1,
    ...(Platform.OS === "web"
      ? ({ overflowY: "auto", WebkitOverflowScrolling: "touch" } as object)
      : null),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  mapShell: {
    height: 280,
    marginBottom: 10,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  mapSwitch: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 6,
    gap: 8,
    elevation: 4,
  },
  switchText: { fontWeight: "600", color: "#6B7280", paddingHorizontal: 6 },
  activeSwitch: { color: "#7F1D1D" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    marginBottom: 14,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sessionEmoji: { fontSize: 22 },
  sessionCopy: { flex: 1 },
  sessionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  sessionMeta: { fontSize: 13, color: "#64748B" },
  timeline: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  timelineCopy: { flex: 1 },
  timelineLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  timelineLabelMuted: { color: "#94A3B8" },
  timelineTime: { fontSize: 12, color: "#64748B", marginTop: 1 },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 14,
  },
  shareButtonText: { color: "#1D4ED8", fontWeight: "700", fontSize: 15 },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 14,
  },
  callButtonText: { color: "#7F1D1D", fontWeight: "700", fontSize: 15 },
  endButton: {
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  endButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
});
