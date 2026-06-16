import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../theme/colors";

interface Props {
  icon: string;
  title: string;
  onPress: () => void;
}

export default function FeatureCard({
  icon,
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.icon}>
        {icon}
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    height: 110,
    backgroundColor: "white",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  icon: {
    fontSize: 34,
  },

  title: {
    marginTop: 8,
    fontWeight: "700",
    color: COLORS.primary,
  },
});