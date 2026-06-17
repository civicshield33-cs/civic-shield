import React, { useEffect, useMemo, useState } from "react";
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
import { subscribeCommunityAlerts } from "../services/incidentService";
import { CommunityAlert } from "../types/emergency";

function alertEmoji(type: CommunityAlert["type"]) {
  switch (type) {
    case "fire":
      return "🔥";
    case "accident":
      return "🚗";
    case "crime":
      return "🚔";
    case "flood":
      return "🌊";
    default:
      return "🚨";
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function CommunityAlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    return subscribeCommunityAlerts(setAlerts);
  }, []);

  const filteredAlerts = useMemo(() => {
    if (activeTab === "Nearby") {
      return alerts.filter((a) =>
        ["Banjul", "Kanifing", "Serrekunda", "Westfield"].some((city) =>
          a.location.toLowerCase().includes(city.toLowerCase())
        )
      );
    }
    if (activeTab === "Following") {
      return alerts.filter((a) => a.severity === "critical" || a.severity === "high");
    }
    return alerts;
  }, [activeTab, alerts]);

  const latestMarker = filteredAlerts[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Community Alerts</Text>

        <TouchableOpacity onPress={() => navigation.navigate("HoldSOS")}>
          <Text style={styles.sosBtn}>🚨</Text>
        </TouchableOpacity>
      </View>

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
          {latestMarker ? (
            <Marker
              coordinate={{ latitude: 13.438, longitude: -16.678 }}
              title={latestMarker.title}
              description={latestMarker.location}
              pinColor="red"
            />
          ) : null}
        </MapView>

        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>🔴 LIVE ALERTS</Text>
        </View>
      </View>

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredAlerts.length === 0 ? (
          <Text style={styles.emptyText}>No alerts right now. Stay safe.</Text>
        ) : (
          filteredAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertWrapper}>
              <AlertCard
                emoji={alertEmoji(alert.type)}
                title={alert.title}
                location={alert.location}
                time={timeAgo(alert.createdAt)}
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
          ))
        )}
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

  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    marginTop: 24,
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
