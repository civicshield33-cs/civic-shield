import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { subscribeCommandIncidents } from "../services/commandCenterService";
import { CommandIncident } from "../types/operator";

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

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function iconFor(incident: CommandIncident) {
  if (incident.source === "sos") return "🚨";
  if (incident.source === "flood") return "🌊";
  if (incident.source === "missing") return "👤";
  if (incident.title.toLowerCase().includes("fire")) return "🔥";
  if (incident.title.toLowerCase().includes("crime")) return "🚔";
  return "📋";
}

export default function IncidentFeedScreen({ navigation }: any) {
  const [incidents, setIncidents] = useState<CommandIncident[]>([]);

  useEffect(() => {
    return subscribeCommandIncidents(setIncidents);
  }, []);

  const active = incidents.filter(
    (i) => i.status === "active" || i.status === "assigned"
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Feed</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Live updates • {active.length} active
        </Text>

        {active.length === 0 ? (
          <Text style={styles.empty}>No active incidents right now.</Text>
        ) : (
          active.map((item) => (
            <TouchableOpacity
              key={`${item.source}-${item.id}`}
              style={styles.feedCard}
              onPress={() =>
                navigation.navigate("IncidentDetail", { incident: item })
              }
            >
              <Text style={styles.feedIcon}>{iconFor(item)}</Text>

              <View style={styles.feedInfo}>
                <Text style={styles.feedTitle}>{item.title}</Text>
                <Text style={styles.feedLocation}>{item.location}</Text>
                <Text style={styles.feedTime}>
                  {timeAgo(item.createdAt)} •{" "}
                  <Text style={{ color: severityColor(item.severity) }}>
                    {item.severity.toUpperCase()}
                  </Text>
                </Text>
              </View>

              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: severityColor(item.severity) },
                ]}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { paddingRight: 15 },
  backArrow: { fontSize: 28, color: "#FFFFFF", fontWeight: "bold" },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "#FFFFFF" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: 16, color: "#6B7280", marginBottom: 20 },
  empty: { textAlign: "center", color: "#94A3B8", marginTop: 40 },
  feedCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  feedIcon: { fontSize: 34, marginRight: 14, width: 40 },
  feedInfo: { flex: 1 },
  feedTitle: { fontSize: 17, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
  feedLocation: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  feedTime: { fontSize: 13, color: "#6B7280" },
  severityDot: { width: 12, height: 12, borderRadius: 6 },
});
