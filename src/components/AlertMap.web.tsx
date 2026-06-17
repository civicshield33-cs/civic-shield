import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/leaflet-pin.css";

import { MapCoordinate } from "../data/gambiaLocations";

type Props = {
  coordinate: MapCoordinate;
  height?: number;
};

const PIN_ICON = L.divIcon({
  className: "civic-pin-marker",
  html: '<div class="civic-pin"></div>',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

export default function AlertMap({ coordinate, height = 240 }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
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
    }).setView([coordinate.latitude, coordinate.longitude], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    markerRef.current = L.marker([coordinate.latitude, coordinate.longitude], {
      icon: PIN_ICON,
    }).addTo(map);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 400);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [visible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView([coordinate.latitude, coordinate.longitude], 15);
    if (markerRef.current) {
      markerRef.current.setLatLng([coordinate.latitude, coordinate.longitude]);
    }
    setTimeout(() => map.invalidateSize(), 0);
  }, [coordinate.latitude, coordinate.longitude]);

  return (
    <View style={[styles.wrap, { height }]}>
      {!visible ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#001F3F" />
        </View>
      ) : (
        <div
          ref={hostRef}
          style={{ width: "100%", height: "100%", borderRadius: 14 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
