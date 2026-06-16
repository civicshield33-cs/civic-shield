import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

import MapView, { Marker } from "react-native-maps";
import AlertCard from "../components/AlertCard";

const initialAlerts = [
  {
    id: 1,
    emoji: "🔥",
    title: "Fire Incident",
    location: "Brikama",
    time: "15 mins ago",
    severity: "high",
  },
  {
    id: 2,
    emoji: "🚗",
    title: "Traffic Accident",
    location: "Westfield",
    time: "5 mins ago",
    severity: "medium",
  },
  {
    id: 3,
    emoji: "🚔",
    title: "Crime Alert",
    location: "Serrekunda",
    time: "25 mins ago",
    severity: "critical",
  },
  {
    id: 4,
    emoji: "🌊",
    title: "Flood Warning",
    location: "Banjul",
    time: "1 hour ago",
    severity: "high",
  },
];

export default function CommunityAlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [activeTab, setActiveTab] = useState("All");

  // 🔥 Fake real-time updates (replace with Firebase later)
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((prev) => {
        const updated = [...prev];
        if (Math.random() > 0.7) {
          updated.unshift({
            id: Date.now(),
            emoji: "🚨",
            title: "New Emergency Reported",
            location: "Unknown",
            time: "Just now",
            severity: "critical",
          });
        }
        return updated.slice(0, 8);
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const triggerSOS = () => {
    alert("🚨 SOS SENT TO EMERGENCY NETWORK (Firebase hook point)");
    // 🔥 Firebase: push SOS event here
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Community Alerts</Text>

        <TouchableOpacity onPress={triggerSOS}>
          <Text style={styles.sosBtn}>🚨</Text>
        </TouchableOpacity>
      </View>

      {/* LIVE MAP PREVIEW */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          mapType="satellite"
          initialRegion={{
            latitude: 13.4549,
            longitude: -16.579,
            latitudeDelta: 1.2,
            longitudeDelta: 1.2,
          }}
        >
          <Marker
            coordinate={{ latitude: 13.4549, longitude: -16.579 }}
            title="Banjul"
          />

          <Marker
            coordinate={{ latitude: 13.438, longitude: -16.678 }}
            title="Active Incident"
            pinColor="red"
          />
        </MapView>

        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>🔴 LIVE ALERTS</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {["All", "Nearby", "Following"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={
                activeTab === tab ? styles.activeTabText : styles.tabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ALERT LIST */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {alerts.map((alert) => (
          <View key={alert.id} style={styles.alertWrapper}>
            <AlertCard
              emoji={alert.emoji}
              title={alert.title}
              location={alert.location}
              time={alert.time}
            />

            <View
              style={[
                styles.severity,
                alert.severity === "critical" && {
                  backgroundColor: "#EF4444",
                },
                alert.severity === "high" && {
                  backgroundColor: "#F59E0B",
                },
                alert.severity === "medium" && {
                  backgroundColor: "#3B82F6",
                },
              ]}
            >
              <Text style={styles.severityText}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#001F3F",
    paddingTop: 70,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backArrow: {
    fontSize: 28,
    color: "#fff",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  sosBtn: {
    fontSize: 24,
    color: "#fff",
  },

  mapContainer: {
    height: 180,
    margin: 15,
    borderRadius: 16,
    overflow: "hidden",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  liveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  liveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },

  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#001F3F",
  },

  tabText: {
    color: "#6B7280",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },

  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },

  alertWrapper: {
    marginBottom: 12,
  },

  severity: {
    alignSelf: "flex-start",
    marginTop: -10,
    marginLeft: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },

  severityText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});