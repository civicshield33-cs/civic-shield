import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";

import { subscribeCommandIncidents, getResponseUnits } from "../services/commandCenterService";
import { CommandIncident, ResponseUnit } from "../types/operator";

function severityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "#EF4444";
    case "high":
      return "#F59E0B";
    case "medium":
      return "#EAB308";
    default:
      return "#10B981";
  }
}

export default function LiveMapScreen({ navigation }: any) {
  const [mapType, setMapType] = useState<"hybrid" | "satellite">("hybrid");
  const [incidents, setIncidents] = useState<CommandIncident[]>([]);
  const [units, setUnits] = useState<ResponseUnit[]>([]);

  useEffect(() => {
    const unsub = subscribeCommandIncidents(setIncidents);
    getResponseUnits().then(setUnits);
    return unsub;
  }, []);

  const active = incidents.filter(
    (i) =>
      (i.status === "active" || i.status === "assigned") &&
      i.latitude &&
      i.longitude
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Map</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            mapType={mapType}
            initialRegion={{
              latitude: 13.4549,
              longitude: -16.579,
              latitudeDelta: 1.2,
              longitudeDelta: 1.2,
            }}
          >
            {active.map((incident) => (
              <Marker
                key={`${incident.source}-${incident.id}`}
                coordinate={{
                  latitude: incident.latitude!,
                  longitude: incident.longitude!,
                }}
                title={incident.title}
                description={incident.location}
                pinColor={severityColor(incident.severity)}
                onCalloutPress={() =>
                  navigation.navigate("IncidentDetail", { incident })
                }
              />
            ))}

            {units.map((unit) => (
              <Marker
                key={unit.id}
                coordinate={{
                  latitude: unit.latitude,
                  longitude: unit.longitude,
                }}
                title={unit.name}
                description={unit.status}
                pinColor={
                  unit.type === "police"
                    ? "#10B981"
                    : unit.type === "ambulance"
                      ? "#3B82F6"
                      : "#F59E0B"
                }
              />
            ))}
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
            <TouchableOpacity onPress={() => setMapType("satellite")}>
              <Text
                style={[
                  styles.switchText,
                  mapType === "satellite" && styles.activeSwitch,
                ]}
              >
                Satellite
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Severity legend</Text>
          {[
            { label: "Critical", color: "#EF4444" },
            { label: "High", color: "#F59E0B" },
            { label: "Medium", color: "#EAB308" },
            { label: "Low / units", color: "#10B981" },
          ].map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.count}>
          {active.length} incident pin{active.length === 1 ? "" : "s"} • {units.length} units
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { paddingRight: 15 },
  backArrow: { fontSize: 28, color: "#fff", fontWeight: "bold" },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: "600", color: "#fff", textAlign: "center" },
  liveBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  scrollContent: { paddingBottom: 40 },
  mapContainer: {
    height: 480,
    margin: 15,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
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
  },
  switchText: { fontWeight: "600", color: "#6B7280" },
  activeSwitch: { color: "#001F3F" },
  legend: {
    backgroundColor: "#fff",
    margin: 15,
    marginTop: 0,
    padding: 16,
    borderRadius: 14,
  },
  legendTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendText: { fontSize: 14, color: "#374151" },
  count: { textAlign: "center", color: "#64748B", marginBottom: 20 },
});
