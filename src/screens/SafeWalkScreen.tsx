import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
} from "react-native";

import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

import { useContactStore } from "../store/contactStore";
import { useUserProfile } from "../hooks/useUserProfile";
import { getCurrentUserId } from "../services/authService";
import {
  appendSafeWalkLocation,
  buildSafeWalkShareMessage,
  completeSafeWalk,
  startSafeWalk,
  triggerSafeWalkSos,
} from "../services/safeWalkService";
import { GeoPoint } from "../types/emergency";

export default function SafeWalkScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const contacts = useContactStore((state) => state.contacts);
  const loadContacts = useContactStore((state) => state.loadContacts);
  const { user } = useUserProfile();

  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [destination, setDestination] = useState("");

  const [userLocation, setUserLocation] = useState({
    latitude: 13.4549,
    longitude: -16.579,
  });

  const [path, setPath] = useState<{ latitude: number; longitude: number }[]>(
    []
  );

  const [region, setRegion] = useState({
    latitude: 13.4549,
    longitude: -16.579,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location is required for Safe Walk");
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

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const toGeoPoint = (latitude: number, longitude: number): GeoPoint => ({
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  });

  const startJourney = async () => {
    if (tracking) return;

    const userId = await getCurrentUserId();
    const journey = await startSafeWalk({
      userId,
      userName: user?.fullName || "Civic Shield User",
      destination: destination.trim() || undefined,
      startLocation: toGeoPoint(userLocation.latitude, userLocation.longitude),
    });

    setJourneyId(journey.id);
    setTracking(true);
    setPath([{ latitude: userLocation.latitude, longitude: userLocation.longitude }]);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 4000,
        distanceInterval: 8,
      },
      async (loc) => {
        const { latitude, longitude } = loc.coords;
        const point = { latitude, longitude };

        setUserLocation(point);
        setPath((prev) => [...prev, point]);

        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        if (journey.id) {
          await appendSafeWalkLocation(journey.id, toGeoPoint(latitude, longitude));
        }
      }
    );
  };

  const endJourney = async () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setTracking(false);

    if (journeyId) {
      await completeSafeWalk(journeyId);
    }

    Alert.alert("Journey complete", "You have arrived safely.");
    setJourneyId(null);
  };

  const shareLiveLocation = async () => {
    if (!journeyId) {
      Alert.alert("Start journey first", "Tap Start Journey to share your live location.");
      return;
    }

    const message = buildSafeWalkShareMessage(
      journeyId,
      user?.fullName || "Civic Shield User"
    );

    await Share.share({ message });
  };

  const triggerSOS = async () => {
    if (contacts.length === 0) {
      Alert.alert("No Contacts", "Please add emergency contacts first");
      return;
    }

    if (journeyId) {
      await triggerSafeWalkSos(journeyId);
    }

    Alert.alert(
      "SOS ACTIVATED",
      `Alert sent. ${contacts.length} contact${contacts.length === 1 ? "" : "s"} notified.`
    );
    navigation.navigate("HoldSOS");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

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
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            showsUserLocation
            showsCompass
            mapType="standard"
          >
            <Marker coordinate={userLocation} title="You" />

            {path.length > 1 ? (
              <Polyline
                coordinates={path}
                strokeColor="#10B981"
                strokeWidth={4}
              />
            ) : null}
          </MapView>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            {tracking ? "Live Tracking Active" : "Ready to walk"}
          </Text>
          <Text style={styles.infoSub}>
            {tracking
              ? `Sharing with ${contacts.length} emergency contact${contacts.length === 1 ? "" : "s"}`
              : "Start a journey and share your live route with trusted contacts"}
          </Text>
        </View>

        <View style={styles.destinationBox}>
          <Text style={styles.sectionTitle}>Destination (optional)</Text>
          <TextInput
            style={styles.destinationInput}
            placeholder="e.g. Home, Serrekunda"
            value={destination}
            onChangeText={setDestination}
            editable={!tracking}
          />
        </View>

        <Text style={styles.sectionTitle}>Emergency Contacts</Text>

        {contacts.length === 0 ? (
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>No contacts added yet</Text>
          </View>
        ) : (
          contacts.map((c) => (
            <View key={c.id} style={styles.contactCard}>
              <Text style={styles.contactText}>{c.name}</Text>
              <Text style={styles.phoneText}>{c.phone}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {!tracking ? (
          <TouchableOpacity style={styles.startBtn} onPress={startJourney}>
            <Text style={styles.startText}>Start Journey</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.endBtn} onPress={endJourney}>
            <Text style={styles.startText}>I've Arrived Safely</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.sosBtn} onPress={triggerSOS}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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

  infoBox: {
    margin: 15,
    marginTop: 0,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 14,
  },

  infoTitle: { fontSize: 16, fontWeight: "700" },
  infoSub: { color: "#6B7280", marginTop: 4, lineHeight: 20 },

  destinationBox: {
    marginHorizontal: 15,
    marginBottom: 8,
  },

  destinationInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    fontSize: 15,
    marginTop: 8,
  },

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

  endBtn: {
    backgroundColor: "#0B2A6F",
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
