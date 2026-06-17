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

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  return `${mins}m ago`;
}

export default function CommandCenterDashboard({ navigation }: any) {
  const [incidents, setIncidents] = useState<CommandIncident[]>([]);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  useEffect(() => {
    return subscribeCommandIncidents((items) => {
      setIncidents(items);
      setLastUpdated("Just now");
    });
  }, []);

  const active = incidents.filter(
    (i) => i.status === "active" || i.status === "assigned"
  );
  const critical = active.filter((i) => i.severity === "critical").length;
  const high = active.filter((i) => i.severity === "high").length;
  const resolvedToday = incidents.filter((i) => {
    if (i.status !== "resolved") return false;
    const d = new Date(i.updatedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const feed = active.slice(0, 6);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.mainLayout}>
        <View style={styles.sidebar}>
          <View style={styles.logoSection}>
            <Text style={styles.shield}>🛡️</Text>
            <Text style={styles.logoText}>CIVIC SHIELD</Text>
            <Text style={styles.subLogo}>OPERATIONS CENTER</Text>
            <Text style={styles.liveStatus}>🟢 Live feed connected</Text>
          </View>

          <ScrollView style={styles.menuContainer}>
            <TouchableOpacity style={[styles.menuItem, styles.activeMenu]}>
              <Text style={styles.menuTextActive}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Overview")}
            >
              <Text style={styles.menuText}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("LiveMap")}
            >
              <Text style={styles.menuText}>Live Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("IncidentFeed")}
            >
              <Text style={styles.menuText}>Incident Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("UnitsStatus")}
            >
              <Text style={styles.menuText}>Units Status</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.topBar}>
            <Text style={styles.pageTitle}>Command Center</Text>
            <Text style={styles.updated}>Updated {lastUpdated}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{active.length}</Text>
              <Text style={styles.statLabel}>Active Incidents</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#EF4444" }]}>
              <Text style={[styles.statNumber, { color: "white" }]}>{critical}</Text>
              <Text style={[styles.statLabel, { color: "white" }]}>Critical</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#F59E0B" }]}>
              <Text style={[styles.statNumber, { color: "white" }]}>{high}</Text>
              <Text style={[styles.statLabel, { color: "white" }]}>High</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{resolvedToday}</Text>
              <Text style={styles.statLabel}>Resolved Today</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Live Incident Feed</Text>
          {feed.length === 0 ? (
            <Text style={styles.emptyFeed}>No active incidents</Text>
          ) : (
            feed.map((incident) => (
              <TouchableOpacity
                key={`${incident.source}-${incident.id}`}
                style={styles.feedItem}
                onPress={() =>
                  navigation.navigate("IncidentDetail", { incident })
                }
              >
                <Text style={styles.feedIcon}>
                  {incident.source === "sos" ? "🚨" : "📋"}
                </Text>
                <View style={styles.feedContent}>
                  <Text style={styles.feedTitle}>{incident.title}</Text>
                  <Text style={styles.feedLocation}>{incident.location}</Text>
                  <Text style={styles.feedTime}>
                    {timeAgo(incident.createdAt)} • {incident.severity.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  mainLayout: { flex: 1, flexDirection: "row" },
  sidebar: { width: 240, backgroundColor: "#001F3F", paddingTop: 40 },
  logoSection: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1E40AF",
  },
  shield: { fontSize: 40, marginBottom: 6 },
  logoText: { color: "white", fontSize: 18, fontWeight: "bold" },
  subLogo: { color: "#93C5FD", fontSize: 11 },
  liveStatus: { color: "#4ADE80", marginTop: 8, fontWeight: "600", fontSize: 12 },
  menuContainer: { paddingTop: 16 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 20 },
  activeMenu: {
    backgroundColor: "#1E40AF",
    borderLeftWidth: 4,
    borderLeftColor: "#60A5FA",
  },
  menuText: { color: "#BFDBFE", fontSize: 15 },
  menuTextActive: { color: "white", fontSize: 15, fontWeight: "600" },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: { fontSize: 26, fontWeight: "bold", color: "#1F2937" },
  updated: { color: "#6B7280", fontSize: 13 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    flex: 1,
    minWidth: 120,
    elevation: 3,
  },
  statNumber: { fontSize: 32, fontWeight: "bold", color: "#1F2937" },
  statLabel: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#1F2937" },
  emptyFeed: { color: "#94A3B8", fontStyle: "italic" },
  feedItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  feedIcon: { fontSize: 28, marginRight: 12 },
  feedContent: { flex: 1 },
  feedTitle: { fontSize: 15, fontWeight: "600" },
  feedLocation: { fontSize: 13, color: "#6B7280", marginVertical: 2 },
  feedTime: { fontSize: 12, color: "#EF4444", fontWeight: "500" },
});
