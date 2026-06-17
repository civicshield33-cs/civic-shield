import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/leaflet-pin.css";

import {
  DEFAULT_MAP_CENTER,
  resolveReportCoordinates,
} from "../data/gambiaLocations";
import { CommunityAlert } from "../types/emergency";

type Props = {
  alerts: CommunityAlert[];
  style?: object;
};

const GAMBIA_BOUNDS = L.latLngBounds(
  [13.0, -17.0],
  [14.0, -13.5]
);

const PIN_ICON = L.divIcon({
  className: "civic-pin-marker",
  html: '<div class="civic-pin"></div>',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

export default function CommunityAlertsMap({ alerts, style }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [visible, setVisible] = useState(false);

  const markers = useMemo(
    () =>
      alerts.map((alert) => {
        const coordinate = resolveReportCoordinates(
          alert.location,
          alert.latitude,
          alert.longitude
        );

        return {
          id: alert.id,
          ...coordinate,
          title: alert.title,
          location: alert.location,
        };
      }),
    [alerts]
  );

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
      scrollWheelZoom: false,
      maxBounds: GAMBIA_BOUNDS,
      maxBoundsViscosity: 0.8,
    }).setView(
      [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude],
      8
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 400);

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [visible]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (markers.length === 0) {
      map.setView(
        [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude],
        8
      );
      setTimeout(() => map.invalidateSize(), 0);
      return;
    }

    const bounds = L.latLngBounds(
      markers.map((marker) => [marker.latitude, marker.longitude] as L.LatLngTuple)
    );

    markers.forEach((marker) => {
      L.marker([marker.latitude, marker.longitude], { icon: PIN_ICON })
        .bindTooltip(marker.title, { direction: "top", offset: [0, -28] })
        .addTo(layer);
    });

    if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], 13);
    } else {
      map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
    }

    setTimeout(() => map.invalidateSize(), 0);
  }, [markers]);

  return (
    <View style={[styles.wrap, style]}>
      {!visible ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#001F3F" />
        </View>
      ) : (
        <div
          ref={hostRef}
          style={{ width: "100%", height: "100%", borderRadius: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
