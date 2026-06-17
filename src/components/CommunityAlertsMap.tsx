import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

import {
  DEFAULT_MAP_CENTER,
  resolveReportCoordinates,
} from "../data/gambiaLocations";
import { CommunityAlert } from "../types/emergency";

const GAMBIA_REGION = {
  latitude: DEFAULT_MAP_CENTER.latitude,
  longitude: DEFAULT_MAP_CENTER.longitude,
  latitudeDelta: 1.2,
  longitudeDelta: 1.2,
};

type Props = {
  alerts: CommunityAlert[];
  style?: object;
};

function pinColorForSeverity(severity: CommunityAlert["severity"]) {
  switch (severity) {
    case "critical":
      return "red";
    case "high":
      return "orange";
    case "medium":
      return "blue";
    default:
      return "green";
  }
}

export default function CommunityAlertsMap({ alerts, style }: Props) {
  const mapRef = useRef<MapView>(null);

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
          description: alert.location,
          severity: alert.severity,
        };
      }),
    [alerts]
  );

  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return;

    mapRef.current.fitToCoordinates(
      markers.map((marker) => ({
        latitude: marker.latitude,
        longitude: marker.longitude,
      })),
      {
        edgePadding: { top: 30, right: 30, bottom: 30, left: 30 },
        animated: false,
      }
    );
  }, [markers]);

  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      mapType="satellite"
      initialRegion={GAMBIA_REGION}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          description={marker.description}
          pinColor={pinColorForSeverity(marker.severity)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
