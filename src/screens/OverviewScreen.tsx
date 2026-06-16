import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

export default function OverviewScreen({ navigation }: any) {
  const [mapType, setMapType] = useState<"hybrid" | "satellite">("hybrid");

  const [activeIncidents, setActiveIncidents] = useState(12);
  const [critical, setCritical] = useState(4);
  const [high] = useState(5);
  const [resolvedToday, setResolvedToday] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7)
        setActiveIncidents((p) => Math.min(18, p + 1));

      if (Math.random() > 0.75)
        setCritical((p) => Math.min(7, p + 1));

      if (Math.random() > 0.8)
        setResolvedToday((p) => p + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Overview</Text>

        {/* STATS */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeIncidents}</Text>
            <Text style={styles.statLabel}>Active Incidents</Text>
          </View>

          <View style={[styles.statCard, styles.criticalCard]}>
            <Text style={[styles.statNumber, { color: "white" }]}>
              {critical}
            </Text>
            <Text style={[styles.statLabel, { color: "white" }]}>
              Critical
            </Text>
          </View>

          <View style={[styles.statCard, styles.highCard]}>
            <Text style={[styles.statNumber, { color: "white" }]}>
              {high}
            </Text>
            <Text style={[styles.statLabel, { color: "white" }]}>
              High
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{resolvedToday}</Text>
            <Text style={styles.statLabel}>Resolved Today</Text>
          </View>
        </View>

        {/* MAP */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Live Map</Text>

          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() => navigation.navigate("LiveMap")}
            activeOpacity={0.9}
          >
            <MapView
              style={styles.map}
              mapType={mapType}
              initialRegion={{
                latitude: 13.4549,
                longitude: -16.579,
                latitudeDelta: 1.2,
                longitudeDelta: 1.2,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{ latitude: 13.4549, longitude: -16.579 }}
                title="Banjul"
              />

              <Marker
                coordinate={{ latitude: 13.438, longitude: -16.678 }}
                title="Active Incident"
              >
                <View style={styles.incidentMarker}>
                  <Text style={styles.incidentText}>🚨</Text>
                </View>
              </Marker>
            </MapView>

            {/* MAP TYPE SWITCH */}
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

            <View style={styles.mapOverlay}>
              <Text style={styles.mapSubTitle}>
                Tap to open full interactive map
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* INCIDENTS */}
        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>

          <View style={styles.feedCard}>
            <Text style={styles.feedIcon}>🚨</Text>

            <View style={styles.feedInfo}>
              <Text style={styles.feedTitle}>Armed Robbery</Text>
              <Text style={styles.feedLocation}>
                Serrekunda, West Coast Region
              </Text>
              <Text style={styles.feedTime}>2 mins ago • CRITICAL</Text>
            </View>
          </View>
        </View>

        {/* UNITS */}
        <View style={styles.unitsSection}>
          <Text style={styles.sectionTitle}>Units Status</Text>

          <View style={styles.unitCard}>
            <View style={styles.unitLeft}>
              <Text style={styles.unitIcon}>👮‍♂️</Text>
              <Text style={styles.unitName}>Police Units</Text>
            </View>
            <Text style={styles.unitCount}>8 Active</Text>
          </View>

          <View style={styles.unitCard}>
            <View style={styles.unitLeft}>
              <Text style={styles.unitIcon}>🚑</Text>
              <Text style={styles.unitName}>Ambulance Units</Text>
            </View>
            <Text style={styles.unitCount}>5 Active</Text>
          </View>

          <View style={styles.unitCard}>
            <View style={styles.unitLeft}>
              <Text style={styles.unitIcon}>🚒</Text>
              <Text style={styles.unitName}>Fire Units</Text>
            </View>
            <Text style={styles.unitCount}>3 Active</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 13,
    marginTop: 30,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 25,
  },

  statCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    flex: 1,
    minWidth: 140,
    elevation: 5,
  },

  criticalCard: {
    backgroundColor: "#EF4444",
  },

  highCard: {
    backgroundColor: "#F59E0B",
  },

  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
  },

  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1F2937",
  },

  mapSection: {
    marginBottom: 25,
  },

  mapContainer: {
    borderRadius: 16,
    overflow: "hidden",
    height: 240,
  },

  map: {
    height: "100%",
    width: "100%",
  },

  mapSwitch: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },

  switchText: {
    color: "#fff",
    marginHorizontal: 6,
    fontSize: 12,
  },

  activeSwitch: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  mapOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 10,
    borderRadius: 10,
  },

  mapSubTitle: {
    fontSize: 13,
    color: "#6B7280",
  },

  incidentMarker: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 20,
  },

  feedSection: {
    marginBottom: 25,
  },

  feedCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    elevation: 4,
  },

  feedIcon: {
    fontSize: 40,
    marginRight: 16,
  },

  feedInfo: {
    flex: 1,
  },

  feedTitle: {
    fontSize: 17,
    fontWeight: "600",
  },

  feedLocation: {
    color: "#6B7280",
    marginVertical: 4,
  },

  feedTime: {
    color: "#EF4444",
    fontWeight: "500",
  },

  unitsSection: {
    marginBottom: 30,
  },

  unitCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    elevation: 4,
  },

  unitLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  unitIcon: {
    fontSize: 32,
    marginRight: 14,
  },

  unitName: {
    fontSize: 17,
    fontWeight: "600",
  },

  unitCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
});