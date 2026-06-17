import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { useSOSStore } from "../store/sosStore";
import {
  appendSosLocation,
  getSosIncident,
  resolveSosIncident,
  subscribeSosIncident,
} from "../services/sosService";
import { GeoPoint } from "../types/emergency";

export default function TrackingScreen({ navigation, route }: any) {
  const incidentId =
    route?.params?.incidentId || useSOSStore.getState().incidentId;
  const { deactivate, contactsNotified } = useSOSStore();

  const [mapType, setMapType] = useState<"hybrid" | "standard">("hybrid");
  const [trail, setTrail] = useState<GeoPoint[]>([]);
  const [current, setCurrent] = useState<GeoPoint | null>(null);
  const [lastUpdate, setLastUpdate] = useState("Just now");
  const mapRef = useRef<MapView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!incidentId) return;

    const unsub = subscribeSosIncident(incidentId, (incident) => {
      if (!incident) return;
      setTrail(incident.locationTrail);
      if (incident.location) setCurrent(incident.location);
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
          await appendSosLocation(incidentId, point);

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
    getSosIncident(incidentId).then((incident) => {
      if (incident?.locationTrail?.length) {
        setTrail(incident.locationTrail);
        setCurrent(incident.locationTrail[incident.locationTrail.length - 1]);
      }
    });

    return () => {
      watchRef.current?.remove();
    };
  }, [incidentId]);

  const endEmergency = async () => {
    if (incidentId) await resolveSosIncident(incidentId);
    deactivate();
    navigation.navigate("MainTabs");
  };

  const region = current
    ? {
        latitude: current.latitude,
        longitude: current.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : {
        latitude: 13.4549,
        longitude: -16.579,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={mapType}
          initialRegion={region}
          showsUserLocation
        >
          {trail.length > 1 ? (
            <Polyline
              coordinates={trail.map((p) => ({
                latitude: p.latitude,
                longitude: p.longitude,
              }))}
              strokeColor="#2563EB"
              strokeWidth={4}
            />
          ) : null}

          {current ? (
            <Marker
              coordinate={{
                latitude: current.latitude,
                longitude: current.longitude,
              }}
              title="You"
              description="Current location"
            />
          ) : null}
        </MapView>

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
      </View>

      <View style={styles.statusCard}>
        <StatusLine
          icon="checkmark-circle"
          text="GPS Tracking Active"
          ok
        />
        <StatusLine
          icon="people"
          text={
            contactsNotified
              ? "Emergency Contacts Alerted"
              : "Alerting emergency contacts..."
          }
          ok={contactsNotified}
        />
        <StatusLine icon="shield" text="Police Notified" ok />
        <StatusLine icon="time" text={`Last update: ${lastUpdate}`} ok />

        <TouchableOpacity style={styles.endButton} onPress={endEmergency}>
          <Text style={styles.endButtonText}>End Emergency</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatusLine({
  icon,
  text,
  ok,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  ok: boolean;
}) {
  return (
    <View style={styles.statusRow}>
      <Ionicons
        name={icon}
        size={20}
        color={ok ? "#059669" : "#94A3B8"}
        style={styles.statusIcon}
      />
      <Text style={styles.statusText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 70,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { paddingRight: 15 },
  backArrow: { fontSize: 28, color: "#FFFFFF", fontWeight: "bold" },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  liveBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  mapContainer: { flex: 1, position: "relative" },
  map: { flex: 1 },
  mapSwitch: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 6,
    gap: 10,
    elevation: 5,
  },
  switchText: { fontWeight: "600", color: "#6B7280", paddingHorizontal: 6 },
  activeSwitch: { color: "#001F3F" },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    elevation: 15,
  },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  statusIcon: { marginRight: 14 },
  statusText: { fontSize: 16, color: "#1F2937", fontWeight: "500" },
  endButton: {
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
  },
  endButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
});
