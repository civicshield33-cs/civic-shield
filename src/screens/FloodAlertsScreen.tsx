import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

import { getFloodAlerts } from "../services/gambiaService";
import { FloodAlert, GambiaRegion, GAMBIA_REGIONS } from "../types/gambia";

function severityColor(severity: FloodAlert["severity"]) {
  switch (severity) {
    case "critical":
      return "#EF4444";
    case "high":
      return "#F59E0B";
    default:
      return "#3B82F6";
  }
}

export default function FloodAlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [region, setRegion] = useState<GambiaRegion | "All">("All");

  useEffect(() => {
    getFloodAlerts(region === "All" ? undefined : region).then(setAlerts);
  }, [region]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flood & Disaster Alerts</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {(["All", ...GAMBIA_REGIONS] as const).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.tab, region === r && styles.tabActive]}
            onPress={() => setRegion(r)}
          >
            <Text style={[styles.tabText, region === r && styles.tabTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {alerts.length === 0 ? (
          <Text style={styles.empty}>No active flood alerts for this region.</Text>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.card}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: severityColor(alert.severity) },
                ]}
              >
                <Text style={styles.badgeText}>{alert.severity.toUpperCase()}</Text>
              </View>
              <Text style={styles.title}>🌊 {alert.title}</Text>
              <Text style={styles.region}>{alert.region} Region</Text>
              <Text style={styles.description}>{alert.description}</Text>
            </View>
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
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backArrow: { fontSize: 28, color: "#fff", marginRight: 12 },
  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "700", flex: 1 },
  tabs: { paddingHorizontal: 12, paddingVertical: 12, maxHeight: 56 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#001F3F" },
  tabText: { color: "#475569", fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: "center", color: "#64748B", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  title: { fontSize: 17, fontWeight: "700", color: "#0F172A", marginBottom: 4 },
  region: { fontSize: 13, color: "#64748B", marginBottom: 8 },
  description: { fontSize: 14, color: "#334155", lineHeight: 21 },
});
