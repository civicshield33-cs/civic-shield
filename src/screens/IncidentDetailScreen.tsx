import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import {
  assignIncidentToUnit,
  getResponseUnits,
  resolveCommandIncident,
} from "../services/commandCenterService";
import { CommandIncident, ResponseUnit } from "../types/operator";
import { getTrackingUrl } from "../config/app";

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

export default function IncidentDetailScreen({ navigation, route }: any) {
  const incident: CommandIncident = route.params?.incident;
  const [units, setUnits] = useState<ResponseUnit[]>([]);

  useEffect(() => {
    getResponseUnits().then(setUnits);
  }, []);

  if (!incident) {
    return (
      <View style={styles.center}>
        <Text>Incident not found</Text>
      </View>
    );
  }

  const trail = incident.locationTrail || [];
  const latest = trail.at(-1);

  const handleAssign = (unit: ResponseUnit) => {
    Alert.alert(
      `Assign ${unit.name}?`,
      `Dispatch to ${incident.location}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dispatch",
          onPress: async () => {
            const eta = Math.floor(Math.random() * 8) + 5;
            await assignIncidentToUnit({
              incidentId: incident.id,
              source: incident.source,
              unitId: unit.id,
              unitName: unit.name,
              etaMinutes: eta,
              operatorId: "operator-1",
            });
            Alert.alert("Dispatched", `${unit.name} ETA ${eta} minutes`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleResolve = async () => {
    await resolveCommandIncident({
      incidentId: incident.id,
      source: incident.source,
      operatorId: "operator-1",
    });
    Alert.alert("Resolved", "Incident marked as resolved.");
    navigation.goBack();
  };

  const trackingUrl =
    incident.source === "sos" ? getTrackingUrl(incident.id) : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: severityColor(incident.severity) },
          ]}
        >
          <Text style={styles.severityText}>
            {incident.severity.toUpperCase()} • {incident.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>{incident.title}</Text>
        <Text style={styles.location}>{incident.location}</Text>
        {incident.description ? (
          <Text style={styles.description}>{incident.description}</Text>
        ) : null}

        {incident.assignedUnit ? (
          <View style={styles.assignedBox}>
            <Text style={styles.assignedLabel}>Assigned unit</Text>
            <Text style={styles.assignedValue}>{incident.assignedUnit}</Text>
            {incident.etaMinutes ? (
              <Text style={styles.eta}>ETA: {incident.etaMinutes} min</Text>
            ) : null}
          </View>
        ) : null}

        {latest ? (
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: latest.latitude,
                longitude: latest.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
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
              <Marker
                coordinate={{
                  latitude: latest.latitude,
                  longitude: latest.longitude,
                }}
              />
            </MapView>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Evidence</Text>
        {incident.audioUrl ? (
          <TouchableOpacity
            style={styles.evidenceBtn}
            onPress={() => Linking.openURL(incident.audioUrl!)}
          >
            <Text style={styles.evidenceText}>🔊 Play audio recording</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.muted}>No audio uploaded yet</Text>
        )}
        {incident.photoUrl ? (
          <TouchableOpacity
            style={styles.evidenceBtn}
            onPress={() => Linking.openURL(incident.photoUrl!)}
          >
            <Text style={styles.evidenceText}>📷 View photo evidence</Text>
          </TouchableOpacity>
        ) : null}

        {trackingUrl ? (
          <TouchableOpacity
            style={styles.evidenceBtn}
            onPress={() => Linking.openURL(trackingUrl)}
          >
            <Text style={styles.evidenceText}>📍 Open live tracking URL</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.sectionTitle}>Dispatch unit</Text>
        {units
          .filter((u) => u.status === "available")
          .map((unit) => (
            <TouchableOpacity
              key={unit.id}
              style={styles.unitRow}
              onPress={() => handleAssign(unit)}
            >
              <Text style={styles.unitName}>{unit.name}</Text>
              <Text style={styles.unitType}>{unit.type}</Text>
            </TouchableOpacity>
          ))}

        <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
          <Text style={styles.resolveText}>Mark Resolved</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backArrow: { fontSize: 28, color: "#fff", marginRight: 12 },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },
  content: { padding: 20, paddingBottom: 40 },
  severityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  severityText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  location: { fontSize: 15, color: "#64748B", marginBottom: 8 },
  description: { fontSize: 15, color: "#334155", lineHeight: 22, marginBottom: 16 },
  assignedBox: {
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  assignedLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  assignedValue: { fontSize: 16, fontWeight: "700", color: "#1E40AF" },
  eta: { fontSize: 14, color: "#2563EB", marginTop: 4 },
  mapWrap: {
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
    marginTop: 8,
  },
  evidenceBtn: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  evidenceText: { fontWeight: "600", color: "#1E40AF" },
  muted: { color: "#94A3B8", marginBottom: 12 },
  unitRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  unitName: { fontWeight: "700", color: "#0F172A" },
  unitType: { color: "#64748B", textTransform: "capitalize" },
  resolveBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  resolveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
