import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../theme/colors";

export default function StatusCard() {
  return (
    <View style={styles.card}>
      <View style={styles.dot} />

      <View>
        <Text style={styles.status}>
          SAFE
        </Text>

        <Text style={styles.text}>
          You are currently safe
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    marginRight: 15,
  },

  status: {
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 22,
  },

  text: {
    marginTop: 3,
    color: "#6B7280",
  },
});