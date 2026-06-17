import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import { MapCoordinate } from "../data/gambiaLocations";

type Props = {
  coordinate: MapCoordinate;
  height?: number;
};

function toRegion(coord: MapCoordinate, delta = 0.03): Region {
  return {
    latitude: coord.latitude,
    longitude: coord.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export default function AlertMap({ coordinate, height = 240 }: Props) {
  const mapRef = useRef<MapView>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    mapRef.current?.animateToRegion(toRegion(coordinate), 0);
  }, [visible, coordinate.latitude, coordinate.longitude]);

  return (
    <View style={[styles.wrap, { height }]}>
      {!visible ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#001F3F" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={toRegion(coordinate)}
          scrollEnabled
          zoomEnabled
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker coordinate={coordinate} />
        </MapView>
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
  },
});
