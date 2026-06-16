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

export default function SOSButton({
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.outer}>
        <View style={styles.middle}>
          <View style={styles.inner}>
            <Text style={styles.sos}>
              SOS
            </Text>

            <Text style={styles.tap}>
              Tap & Hold
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 149,
    height: 149,
    borderRadius: 125,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },

  middle: {
    width: 135,
    height: 135,
    borderRadius: 105,
    backgroundColor: "#FCA5A5",
    justifyContent: "center",
    alignItems: "center",
  },

  inner: {
    width: 120,
    height: 120,
    borderRadius: 85,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },

  sos: {
    color: "white",
    fontWeight: "bold",
    fontSize: 27,
  },

  tap: {
    color: "white",
    marginTop: 10,
    fontSize:11,
  },
});