import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";

import { COLORS } from "../theme/colors";

interface Props {
  onPress: () => void;
}

export default function SOSButton({ onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.outer}>
        <View style={styles.middle}>
          <View style={styles.inner}>
            <Text style={styles.sos}>SOS</Text>
            <Text style={styles.tap}>Tap & Hold</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },

  middle: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: "#FCA5A5",
    justifyContent: "center",
    alignItems: "center",
  },

  inner: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  sos: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 32,
    letterSpacing: 1,
  },

  tap: {
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
});
