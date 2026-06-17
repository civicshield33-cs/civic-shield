import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { subscribeSosIncident } from "../services/sosService";
import { subscribeSafeWalk } from "../services/safeWalkService";
import { SosIncident, SafeWalkJourney } from "../types/emergency";

type Props = {
  trackId?: string | null;
  walkId?: string | null;
};

export default function PublicTrackScreen({ trackId, walkId }: Props) {
  const [sos, setSos] = useState<SosIncident | null>(null);
  const [walk, setWalk] = useState<SafeWalkJourney | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trackId) {
      return subscribeSosIncident(trackId, (incident) => {
        setSos(incident);
        setLoading(false);
      });
    }

    if (walkId) {
      return subscribeSafeWalk(walkId, (journey) => {
        setWalk(journey);
        setLoading(false);
      });
    }

    setLoading(false);
  }, [trackId, walkId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B2A6F" />
        <Text style={styles.loadingText}>Loading live update...</Text>
      </View>
    );
  }

  if (!sos && !walk) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Tracking not found</Text>
        <Text style={styles.subtitle}>
          This link may have expired or the session has ended.
        </Text>
      </View>
    );
  }

  const trail = sos?.locationTrail || walk?.locationTrail || [];
  const latest = trail[trail.length - 1];
  const title = sos
    ? `🚨 ${sos.userName}'s Emergency`
    : `🚶 ${walk?.userName}'s Safe Walk`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Civic Shield Gambia</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {sos
          ? `Status: ${sos.status}`
          : `Status: ${walk?.status}${walk?.destination ? ` • Destination: ${walk.destination}` : ""}`}
      </Text>

      {latest ? (
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: latest.latitude,
              longitude: latest.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {trail.length > 1 ? (
              <Polyline
                coordinates={trail.map((p) => ({
                  latitude: p.latitude,
                  longitude: p.longitude,
                }))}
                strokeColor="#2563EB"
                strokeWidth={4}
              />
            ) : null}
            <Marker
              coordinate={{
                latitude: latest.latitude,
                longitude: latest.longitude,
              }}
              title="Live location"
            />
          </MapView>
        </View>
      ) : (
        <Text style={styles.subtitle}>Waiting for GPS update...</Text>
      )}

      {latest ? (
        <Text style={styles.coords}>
          {latest.latitude.toFixed(5)}, {latest.longitude.toFixed(5)}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingTop: 48 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F1F5F9",
  },
  brand: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 20, lineHeight: 22 },
  loadingText: { marginTop: 12, color: "#64748B" },
  mapWrap: {
    height: 320,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: { flex: 1 },
  coords: { fontSize: 14, color: "#334155", fontWeight: "600" },
});
