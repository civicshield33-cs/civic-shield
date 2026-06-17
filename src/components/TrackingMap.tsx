import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { DEFAULT_MAP_CENTER } from "../data/gambiaLocations";
import { GeoPoint } from "../types/emergency";

type Props = {
  trail: GeoPoint[];
  current: GeoPoint | null;
  mapType: "hybrid" | "standard";
  mapRef?: React.RefObject<MapView | null>;
};

export default function TrackingMap({
  trail,
  current,
  mapType,
  mapRef,
}: Props) {
  const region = current
    ? {
        latitude: current.latitude,
        longitude: current.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : {
        latitude: DEFAULT_MAP_CENTER.latitude,
        longitude: DEFAULT_MAP_CENTER.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType={mapType}
      initialRegion={region}
      showsUserLocation
    >
      {trail.length > 1 ? (
        <Polyline
          coordinates={trail.map((point) => ({
            latitude: point.latitude,
            longitude: point.longitude,
          }))}
          strokeColor="#2563EB"
          strokeWidth={5}
        />
      ) : null}

      {current ? (
        <Marker
          coordinate={{
            latitude: current.latitude,
            longitude: current.longitude,
          }}
          title="You"
          description="Live location"
          pinColor="#DC2626"
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
