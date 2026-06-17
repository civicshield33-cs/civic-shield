import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";

import { MapCoordinate } from "../data/gambiaLocations";

type Props = {
  center: MapCoordinate;
  pin: MapCoordinate | null;
  onPinChange: (pin: MapCoordinate | null) => void;
  height?: number;
  centerRevision?: number;
};

function toRegion(coord: MapCoordinate, delta = 0.05): Region {
  return {
    latitude: coord.latitude,
    longitude: coord.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export default function LocationPinMap({
  center,
  pin,
  onPinChange,
  height = 220,
  centerRevision = 0,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 250);
    return () => clearTimeout(timer);
  }, []);

  const refreshMap = (coord: MapCoordinate, delta?: number) => {
    mapRef.current?.animateToRegion(toRegion(coord, delta), 0);
  };

  useEffect(() => {
    if (!layoutReady || !visible) return;

    const timers = [
      setTimeout(() => refreshMap(pin ?? center, pin ? 0.02 : 0.05), 50),
      setTimeout(() => refreshMap(pin ?? center, pin ? 0.02 : 0.05), 300),
    ];

    return () => timers.forEach(clearTimeout);
  }, [
    layoutReady,
    visible,
    center.latitude,
    center.longitude,
    pin?.latitude,
    pin?.longitude,
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
    <View
      style={[styles.wrap, { height }]}
      onLayout={() => {
        if (!layoutReady) setLayoutReady(true);
      }}
    >
      {!visible ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#001F3F" />
          <Text style={styles.loadingText}>Loading map…</Text>
        </View>
      ) : (
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={toRegion(center)}
        onPress={(event) => onPinChange(event.nativeEvent.coordinate)}
        onMapReady={() => refreshMap(pin ?? center, pin ? 0.02 : 0.05)}
        mapType="standard"
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        loadingEnabled
      >
        {pin ? (
          <Marker
            coordinate={pin}
            draggable
            onDragEnd={(event) => onPinChange(event.nativeEvent.coordinate)}
          />
        ) : null}
      </MapView>
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
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
    backgroundColor: "#F1F5F9",
    ...Platform.select({
      android: { collapsable: false },
    }),
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
