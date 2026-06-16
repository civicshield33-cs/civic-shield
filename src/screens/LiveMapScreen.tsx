import React, { useState } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";

export default function LiveMapScreen({ navigation }: any) {
  const [mapType, setMapType] = useState<"hybrid" | "satellite">("hybrid");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Live Map</Text>

        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* MAP */}
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
            showsUserLocation
            showsCompass
            showsScale
            showsTraffic
            zoomEnabled
            scrollEnabled
            rotateEnabled
          >
            {/* INCIDENT (MAIN FOCUS) */}
            <Marker coordinate={{ latitude: 13.438, longitude: -16.678 }}>
              <View style={styles.incidentMarker}>
                <Text style={styles.incidentText}>🚨</Text>
              </View>
            </Marker>

            {/* BANJUL */}
            <Marker
              coordinate={{ latitude: 13.4549, longitude: -16.579 }}
              title="Banjul"
              description="Capital City"
            />

            {/* AMBULANCE */}
            <Marker
              coordinate={{ latitude: 13.441, longitude: -16.654 }}
              title="Ambulance Unit A-12"
              description="Responding"
              pinColor="#3B82F6"
            />

            {/* FIRE UNIT */}
            <Marker
              coordinate={{ latitude: 13.482, longitude: -16.631 }}
              title="Fire Unit F-04"
              description="Available"
              pinColor="#F59E0B"
            />

            {/* POLICE */}
            <Marker
              coordinate={{ latitude: 13.463, longitude: -16.605 }}
              title="Police Unit P-08"
              description="Patrolling"
              pinColor="#10B981"
            />
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

          {/* OVERLAY */}
          <View style={styles.mapOverlay}>
            <Text style={styles.mapTitle}>
              🇬🇲 The Gambia - Real Time Tracking
            </Text>
            <Text style={styles.mapSubtitle}>
              All active incidents and emergency units shown live
            </Text>
          </View>
        </View>

        {/* CONTROLS */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>📍 Center Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>🚨 Incidents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>🚑 Units</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>🛰 Live Mode</Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Live Overview</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Active Incidents</Text>
            <Text style={styles.statsValue}>12</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Critical</Text>
            <Text style={[styles.statsValue, { color: "#EF4444" }]}>
              4
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Police Units</Text>
            <Text style={styles.statsValue}>8</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Ambulances</Text>
            <Text style={styles.statsValue}>5</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Fire Units</Text>
            <Text style={styles.statsValue}>3</Text>
          </View>
        </View>

        {/* LEGEND */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.legendText}>Incident</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
            <Text style={styles.legendText}>Ambulance</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={styles.legendText}>Fire Unit</Text>
          </View>

          <View style={[styles.legendRow, { marginBottom: 0 }]}>
            <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.legendText}>Police</Text>
          </View>
        </View>
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

  backArrow: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },

  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },

  liveBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },

  liveText: {
    color: "#fff",
    fontWeight: "700",
  },

  mapContainer: {
    height: 520,
    borderRadius: 20,
    margin: 15,
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
    elevation: 5,
  },

  switchText: {
    fontWeight: "600",
    color: "#6B7280",
  },

  activeSwitch: {
    color: "#001F3F",
  },

  mapOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 10,
    borderRadius: 12,
  },

  mapTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0369A1",
  },

  mapSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  incidentMarker: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },

  incidentText: {
    fontSize: 16,
    color: "#fff",
  },

  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
  },

  controlButton: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    elevation: 3,
  },

  controlText: {
    fontWeight: "600",
    color: "#1F2937",
  },

  statsCard: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 18,
    borderRadius: 16,
    elevation: 4,
  },

  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  statsLabel: {
    color: "#6B7280",
  },

  statsValue: {
    fontWeight: "700",
    color: "#1F2937",
  },

  legend: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 18,
    borderRadius: 16,
    elevation: 4,
  },

  legendTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },

  legendText: {
    fontSize: 14,
    color: "#374151",
  },
});