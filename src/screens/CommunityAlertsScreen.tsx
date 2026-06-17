import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import CommunityAlertsMap from "../components/CommunityAlertsMap";
import AlertCard from "../components/AlertCard";
import {
  fetchCommunityAlerts,
  subscribeCommunityAlerts,
  subscribeReportSyncFailures,
} from "../services/incidentService";
import { CommunityAlert } from "../types/emergency";

function alertEmoji(type: CommunityAlert["type"], title = "") {
  if (title.toLowerCase().includes("missing")) return "👤";
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

  useEffect(() => {
    return subscribeReportSyncFailures((failures) => {
      const titles = failures.map((item) => item.title).join(", ");
      Alert.alert(
        "Upload Failed",
        `Could not upload after 3 attempts: ${titles}.\n\nThe report was removed from this device. Please try again when you're back online.`
      );
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCommunityAlerts().then(setAlerts);
    }, [])
  );

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <View style={styles.headerSpacer} />

        <Text style={styles.headerTitle}>Community</Text>

        <TouchableOpacity onPress={() => navigation.navigate("HoldSOS")}>
          <Text style={styles.sosBtn}>🚨</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <CommunityAlertsMap alerts={filteredAlerts} style={styles.map} />

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
            <AlertCard
              key={alert.id}
              emoji={alertEmoji(alert.type, alert.title)}
              title={alert.title}
              location={alert.location}
              time={timeAgo(alert.createdAt)}
              description={alert.description}
              onPress={() =>
                navigation.navigate("CommunityAlertDetail", { alert })
              }
            />
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

  headerSpacer: {
    width: 28,
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
});
