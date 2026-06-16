import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";

import MapView, { Marker } from "react-native-maps";

export default function TrackingScreen({ navigation }: any) {
  const [mapType, setMapType] = useState<"hybrid" | "satellite">("hybrid");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Live Tracking</Text>

        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: 13.4531,
            longitude: -16.7189,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
          showsCompass
          showsScale
          showsTraffic
          showsMyLocationButton
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pitchEnabled
        >
          {/* USER */}
          <Marker
            coordinate={{
              latitude: 13.4531,
              longitude: -16.7189,
            }}
            title="You"
            description="Current Location"
          >
            <View style={styles.userDot}>
              <Text style={styles.userDotText}>🚶</Text>
            </View>
          </Marker>

          {/* POLICE UNIT */}
          <Marker
            coordinate={{
              latitude: 13.457,
              longitude: -16.714,
            }}
            title="Police Unit P-08"
            description="Responding"
            pinColor="green"
          />

          {/* EMERGENCY */}
          <Marker
            coordinate={{
              latitude: 13.448,
              longitude: -16.722,
            }}
            title="Emergency Alert"
            description="Active Incident"
            pinColor="red"
          />

          {/* AMBULANCE */}
          <Marker
            coordinate={{
              latitude: 13.451,
              longitude: -16.711,
            }}
            title="Ambulance A-12"
            description="En Route"
            pinColor="purple"
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

        {/* LOCATION CARD */}
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <Text style={styles.pinIcon}>📍</Text>

            <View>
              <Text style={styles.locationTitle}>Live GPS Tracking</Text>
              <Text style={styles.locationSubtitle}>
                Kotu, Serrekunda{"\n"}
                West Coast Region, The Gambia
              </Text>
            </View>
          </View>
        </View>

        {/* OVERLAY */}
        <View style={styles.trackingOverlay}>
          <Text style={styles.trackingTitle}>
            🇬🇲 Emergency Tracking Active
          </Text>

          <Text style={styles.trackingSubTitle}>
            Police Unit En Route • ETA 4 mins
          </Text>
        </View>
      </View>

      {/* STATUS PANEL */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>🟢</Text>
          <Text style={styles.statusText}>Police Unit Assigned</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>🟢</Text>
          <Text style={styles.statusText}>Emergency Contacts Alerted</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>🟢</Text>
          <Text style={styles.statusText}>GPS Tracking Active</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>🚓</Text>
          <Text style={styles.statusText}>Estimated Arrival: 4 Minutes</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>🕒</Text>
          <Text style={styles.statusText}>Last Update: 5 Seconds Ago</Text>
        </View>

        <TouchableOpacity style={styles.endButton}>
          <Text style={styles.endButtonText}>End Emergency</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
  },

  backButton: {
    paddingRight: 15,
  },

  backArrow: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  liveBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },

  liveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  mapContainer: {
    flex: 1,
    position: "relative",
  },

  map: {
    flex: 1,
  },

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

  locationInfo: {
    position: "absolute",
    top: 3,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    elevation: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  pinIcon: {
    fontSize: 32,
    marginRight: 14,
  },

  locationTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },

  locationSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },

  trackingOverlay: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,31,63,0.90)",
    padding: 10,
    borderRadius: 14,
  },

  trackingTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  trackingSubTitle: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 4,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    elevation: 15,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  statusIcon: {
    fontSize: 22,
    marginRight: 14,
  },

  statusText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },

  endButton: {
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
  },

  endButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  userDot: {
    backgroundColor: "#2563EB",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },

  userDotText: {
    color: "#fff",
    fontSize: 12,
  },
});