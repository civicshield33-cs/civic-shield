import React from "react";
import { View, Text, StyleSheet } from "react-native";

type MapProps = {
  style?: object;
  children?: React.ReactNode;
  initialRegion?: object;
  region?: object;
};

export default function MapView({ style, children }: MapProps) {
  return (
    <View style={[styles.map, style]}>
      <Text style={styles.label}>Map preview (web)</Text>
      {children}
    </View>
  );
}

export function Marker() {
  return null;
}

export function Polyline() {
  return null;
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: "#e8edf2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  label: {
    color: "#5c6b7a",
    fontSize: 14,
  },
});
