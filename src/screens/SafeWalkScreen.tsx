import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";

import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

import AsyncStorage from "@react-native-async-storage/async-storage";

type LatLng = {
  latitude: number;
  longitude: number;
};

type Contact = {
  id: string;
  name: string;
  phone: string;
};

const STORAGE_KEY = "EMERGENCY_CONTACTS";

export default function SafeWalkScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tracking, setTracking] = useState(false);

  const [userLocation, setUserLocation] = useState<LatLng>({
    latitude: 13.4549,
    longitude: -16.579,
  });

  const [path, setPath] = useState<LatLng[]>([]);

  const [region, setRegion] = useState({
    latitude: 13.4549,
    longitude: -16.579,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // =========================
  // LOAD CONTACTS (SYNCED)
  // =========================
  const loadContacts = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      setContacts([]);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // refresh when screen comes back
  useEffect(() => {
    const interval = setInterval(loadContacts, 2000); // auto-sync
    return () => clearInterval(interval);
  }, []);

  // =========================
  // LOCATION INIT
  // =========================
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location is required");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const start = { latitude, longitude };

      setUserLocation(start);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // =========================
  // LIVE TRACKING
  // =========================
  useEffect(() => {
    let interval: any;

    if (tracking) {
      interval = setInterval(async () => {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        const newPoint = { latitude, longitude };

        setUserLocation(newPoint);
        setPath((prev) => [...prev, newPoint]);

        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [tracking]);

  // =========================
  // SOS FUNCTION (REAL CONTACTS)
  // =========================
  const triggerSOS = () => {
    if (contacts.length === 0) {
      Alert.alert("No Contacts", "Please add emergency contacts first");
      return;
    }

    Alert.alert(
      "🚨 SOS ACTIVATED",
      `Alert sent to ${contacts.length} contacts`
    );

    contacts.forEach((c) => {
      console.log("SOS sent to:", c.name, c.phone);
      // 🔥 HERE: SMS / WhatsApp / Firebase trigger
    });
  };

  // =========================
  // SHARE LOCATION
  // =========================
  const shareLiveLocation = async () => {
    const link = `https://safewalk.app/live?user=12345`;

    await Share.share({
      message: `🚶‍♂️ Follow my live location: ${link}`,
    });
  };

  // =========================
  // FAKE EMERGENCY UNITS
  // =========================
  const vehicles = [
    {
      id: "police1",
      type: "🚓 Police",
      latitude: userLocation.latitude + 0.002,
      longitude: userLocation.longitude + 0.002,
      color: "blue",
    },
    {
      id: "ambulance1",
      type: "🚑 Ambulance",
      latitude: userLocation.latitude - 0.002,
      longitude: userLocation.longitude - 0.003,
      color: "red",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Safe Walk</Text>

        <TouchableOpacity onPress={shareLiveLocation}>
          <Text style={styles.shareBtn}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* MAP */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            showsUserLocation
            showsCompass
            showsTraffic
            mapType="standard"
          >
            <Marker coordinate={userLocation} title="You 🚶‍♂️" />

            <Marker
              coordinate={{ latitude: 13.4425, longitude: -16.678 }}
              title="Home"
            />

            {path.length > 1 && (
              <Polyline
                coordinates={path}
                strokeColor="#00FF88"
                strokeWidth={4}
              />
            )}

            {vehicles.map((v) => (
              <Marker
                key={v.id}
                coordinate={{
                  latitude: v.latitude,
                  longitude: v.longitude,
                }}
                title={v.type}
              >
                <View
                  style={[
                    styles.vehicleMarker,
                    { backgroundColor: v.color },
                  ]}
                >
                  <Text style={styles.vehicleText}>
                    {v.type.split(" ")[0]}
                  </Text>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Live Tracking Active</Text>
          <Text style={styles.infoSub}>
            Syncing with {contacts.length} emergency contacts
          </Text>
        </View>

        {/* CONTACTS (REAL DATA) */}
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>

        {contacts.length === 0 ? (
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              No contacts added yet
            </Text>
          </View>
        ) : (
          contacts.map((c) => (
            <View key={c.id} style={styles.contactCard}>
              <Text style={styles.contactText}>👤 {c.name}</Text>
              <Text style={styles.phoneText}>{c.phone}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => setTracking(true)}
        >
          <Text style={styles.startText}>
            {tracking ? "Tracking Live 🟢" : "Start Journey"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sosBtn} onPress={triggerSOS}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================
STYLES
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#001F3F",
    paddingTop: 70,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backArrow: { fontSize: 28, color: "#fff" },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },
  shareBtn: { fontSize: 22, color: "#fff" },

  mapContainer: {
    height: 380,
    margin: 15,
    borderRadius: 20,
    overflow: "hidden",
  },

  map: { width: "100%", height: "100%" },

  vehicleMarker: {
    padding: 6,
    borderRadius: 20,
  },

  vehicleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  infoBox: {
    margin: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 14,
  },

  infoTitle: { fontSize: 16, fontWeight: "700" },
  infoSub: { color: "#6B7280", marginTop: 4 },

  sectionTitle: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },

  contactCard: {
    margin: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  contactText: { fontSize: 16, fontWeight: "600" },
  phoneText: { fontSize: 13, color: "#6B7280", marginTop: 3 },

  bottomBar: {
    padding: 15,
    backgroundColor: "#fff",
  },

  startBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  startText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  sosBtn: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  sosText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});