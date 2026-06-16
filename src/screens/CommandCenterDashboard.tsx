import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import * as Notifications from "expo-notifications";

const { width } = Dimensions.get("window");

export default function CommandCenterDashboard({ navigation }: any) {
  const [activeIncidents, setActiveIncidents] = useState(12);
  const [critical, setCritical] = useState(4);
  const [high, setHigh] = useState(5);
  const [resolvedToday, setResolvedToday] = useState(20);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const [incidents, setIncidents] = useState([
    { id: 1, type: "Armed Robbery", location: "Serrekunda, West Coast Region", time: "2 mins ago", severity: "CRITICAL", icon: "🚨" },
    { id: 2, type: "Domestic Violence", location: "Kanifing Municipal", time: "5 mins ago", severity: "CRITICAL", icon: "👨‍👩‍👧" },
  ]);

  // Real-time + Push Notification Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();

      if (rand > 0.55) {
        setActiveIncidents(prev => Math.min(20, prev + 1));
      }
      if (rand > 0.7) {
        setCritical(prev => Math.min(8, prev + 1));
      }
      if (rand > 0.8) {
        setResolvedToday(prev => prev + 1);
      }

      // Critical Push Notification
      if (rand > 0.75) {
        const newIncident = {
          id: Date.now(),
          type: rand > 0.9 ? "Fire Outbreak" : "Armed Robbery",
          location: "Serrekunda / Banjul Area",
          time: "Just now",
          severity: "CRITICAL",
          icon: "🚨",
        };

        setIncidents(prev => [newIncident, ...prev].slice(0, 6));

        // Trigger Real Push Notification
        Notifications.scheduleNotificationAsync({
          content: {
            title: "🚨 CRITICAL INCIDENT",
            body: `${newIncident.type} reported in ${newIncident.location}`,
            data: { type: "new_incident" },
          },
          trigger: null,
        });
      }

      setLastUpdated("Just now");
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdated("Just now");
    Alert.alert("✅ Live", "Connected to Command Center Server");
  };

  const handleIncidentPress = (incident: any) => {
    Alert.alert(
      incident.type,
      `${incident.location}\n\nTime: ${incident.time}\nSeverity: ${incident.severity}`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.mainLayout}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.logoSection}>
            <Text style={styles.shield}>🛡️</Text>
            <Text style={styles.logoText}>CIVIC SHIELD</Text>
            <Text style={styles.subLogo}>OPERATIONS CENTER</Text>
            <Text style={styles.liveStatus}>🟢 Real-time Push Active</Text>
          </View>

          <ScrollView style={styles.menuContainer}>
            <TouchableOpacity style={[styles.menuItem, styles.activeMenu]}>
              <Text style={styles.menuTextActive}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Overview")}>
              <Text style={styles.menuText}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("LiveMap")}>
              <Text style={styles.menuText}>Live Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("IncidentFeed")}>
              <Text style={styles.menuText}>Incident Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("UnitsStatus")}>
              <Text style={styles.menuText}>Units Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Settings")}>
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.topBar}>
            <Text style={styles.pageTitle}>Command Center</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshText}>↻ Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{activeIncidents}</Text>
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

          {/* Live Incident Feed */}
          <View style={styles.feedSection}>
            <Text style={styles.sectionTitle}>Live Incident Feed</Text>
            {incidents.map((incident) => (
              <TouchableOpacity
                key={incident.id}
                style={styles.feedItem}
                onPress={() => handleIncidentPress(incident)}
              >
                <Text style={styles.feedIcon}>{incident.icon}</Text>
                <View style={styles.feedContent}>
                  <Text style={styles.feedTitle}>{incident.type}</Text>
                  <Text style={styles.feedLocation}>{incident.location}</Text>
                  <Text style={styles.feedTime}>{incident.time} • {incident.severity}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  mainLayout: { flex: 1, flexDirection: "row" },
  sidebar: { width: 260, backgroundColor: "#001F3F", paddingTop: 40 },
  logoSection: { alignItems: "center", paddingBottom: 30, borderBottomWidth: 1, borderBottomColor: "#1E40AF" },
  shield: { fontSize: 48, marginBottom: 8 },
  logoText: { color: "white", fontSize: 22, fontWeight: "bold" },
  subLogo: { color: "#93C5FD", fontSize: 12 },
  liveStatus: { color: "#4ADE80", marginTop: 8, fontWeight: "600" },

  menuContainer: { paddingTop: 20 },
  menuItem: { paddingVertical: 16, paddingHorizontal: 25 },
  activeMenu: { backgroundColor: "#1E40AF", borderLeftWidth: 5, borderLeftColor: "#60A5FA" },
  menuText: { color: "#BFDBFE", fontSize: 16 },
  menuTextActive: { color: "white", fontSize: 16, fontWeight: "600" },

  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#1F2937" },
  refreshButton: { backgroundColor: "#001F3F", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  refreshText: { color: "white", fontWeight: "600" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 25 },
  statCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    flex: 1,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: { fontSize: 36, fontWeight: "bold", color: "#1F2937" },
  statLabel: { fontSize: 14, color: "#6B7280", marginTop: 6 },

  feedSection: {},
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#1F2937" },
  feedItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedIcon: { fontSize: 34, marginRight: 14 },
  feedContent: { flex: 1 },
  feedTitle: { fontSize: 16, fontWeight: "600" },
  feedLocation: { fontSize: 14, color: "#6B7280", marginVertical: 4 },
  feedTime: { fontSize: 13, color: "#EF4444", fontWeight: "500" },
});