import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/leaflet-pin.css";

import { MapCoordinate } from "../data/gambiaLocations";

type Props = {
  center: MapCoordinate;
  pin: MapCoordinate | null;
  onPinChange: (pin: MapCoordinate | null) => void;
  height?: number;
  centerRevision?: number;
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

function placeMarker(
  map: L.Map,
  markerRef: React.MutableRefObject<L.Marker | null>,
  coord: MapCoordinate,
  onPinChange: (pin: MapCoordinate) => void
) {
  if (!markerRef.current) {
    markerRef.current = L.marker([coord.latitude, coord.longitude], {
      icon: PIN_ICON,
      draggable: true,
    }).addTo(map);

    markerRef.current.on("dragend", () => {
      const pos = markerRef.current!.getLatLng();
      onPinChange({ latitude: pos.lat, longitude: pos.lng });
    });
  } else {
    markerRef.current.setLatLng([coord.latitude, coord.longitude]);
  }
}

export default function LocationPinMap({
  center,
  pin,
  onPinChange,
  height = 220,
  centerRevision = 0,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPinChangeRef = useRef(onPinChange);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 250);
    return () => clearTimeout(timer);
  }, []);

  onPinChangeRef.current = onPinChange;

  useEffect(() => {
    if (!visible) return;

    const host = hostRef.current;
    if (!host || mapRef.current) return;

    const map = L.map(host, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      maxBounds: GAMBIA_BOUNDS,
      maxBoundsViscosity: 1,
    }).setView([center.latitude, center.longitude], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const emitPin = (lat: number, lng: number) => {
      placeMarker(map, markerRef, { latitude: lat, longitude: lng }, (next) =>
        onPinChangeRef.current(next)
      );
      onPinChangeRef.current({ latitude: lat, longitude: lng });
    };

    const onMapEvent = (event: L.LeafletMouseEvent) => {
      emitPin(event.latlng.lat, event.latlng.lng);
    };

    map.on("click", onMapEvent);
    map.on("tap", onMapEvent as L.LeafletEventHandlerFn);

    mapRef.current = map;
    setMapReady(true);

    const refresh = () => map.invalidateSize();
    setTimeout(refresh, 150);
    setTimeout(refresh, 400);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapReady(false);
    };
  }, [visible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (pin) {
      placeMarker(map, markerRef, pin, onPinChangeRef.current);
      map.flyTo([pin.latitude, pin.longitude], Math.max(map.getZoom(), 15), {
        duration: 0.45,
      });
      return;
    }

    markerRef.current?.remove();
    markerRef.current = null;
    map.flyTo([center.latitude, center.longitude], 14, { duration: 0.45 });
    setTimeout(() => map.invalidateSize(), 0);
  }, [
    center.latitude,
    center.longitude,
    pin?.latitude,
    pin?.longitude,
    mapReady,
    centerRevision,
  ]);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      onPinChange({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={[styles.wrap, { height }]}>
      {!visible ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#001F3F" />
          <Text style={styles.loadingText}>Loading map…</Text>
        </View>
      ) : (
      <div
        ref={hostRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
          touchAction: "none",
        }}
      />
      )}

      <TouchableOpacity
        style={styles.locateBtn}
        onPress={useMyLocation}
        accessibilityLabel="Use my location"
      >
        {locating ? (
          <ActivityIndicator size="small" color="#001F3F" />
        ) : (
          <Text style={styles.locateIcon}>⊕</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },
  locateBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  locateIcon: {
    fontSize: 22,
    color: "#001F3F",
    fontWeight: "700",
    marginTop: -2,
  },
});
