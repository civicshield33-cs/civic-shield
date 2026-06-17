import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/leaflet-pin.css";

import { DEFAULT_MAP_CENTER } from "../data/gambiaLocations";
import { GeoPoint } from "../types/emergency";

type Props = {
  trail: GeoPoint[];
  current: GeoPoint | null;
  mapType?: "hybrid" | "standard";
};

const SOS_PIN_ICON = L.divIcon({
  className: "civic-sos-marker",
  html: '<div class="civic-sos-pulse"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function TrackingMap({ trail, current }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const host = hostRef.current;
    if (!host || mapRef.current) return;

    const map = L.map(host, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    }).setView(
      [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 400);

    return () => {
      map.remove();
      mapRef.current = null;
      trailRef.current = null;
      markerRef.current = null;
    };
  }, [visible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const points = trail.map(
      (point) => [point.latitude, point.longitude] as L.LatLngTuple
    );

    if (trailRef.current) {
      trailRef.current.setLatLngs(points);
    } else if (points.length > 1) {
      trailRef.current = L.polyline(points, {
        color: "#2563EB",
        weight: 5,
        opacity: 0.9,
      }).addTo(map);
    }

    if (current) {
      const latLng: L.LatLngTuple = [current.latitude, current.longitude];
      if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
      } else {
        markerRef.current = L.marker(latLng, { icon: SOS_PIN_ICON }).addTo(map);
      }

      if (points.length > 1) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds.pad(0.15), { maxZoom: 16 });
      } else {
        map.setView(latLng, 15);
      }
    }

    setTimeout(() => map.invalidateSize(), 0);
  }, [trail, current]);

  return (
    <View style={styles.wrap}>
      {!visible ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#B91C1C" size="large" />
        </View>
      ) : (
        <div ref={hostRef} style={{ width: "100%", height: "100%" }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
    backgroundColor: "#1E293B",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
