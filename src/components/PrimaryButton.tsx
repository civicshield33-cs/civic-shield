import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../theme/colors";

interface Props {
  title: string;
  onPress: () => void;
}

export default function PrimaryButton({
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.buttonBlue,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
});