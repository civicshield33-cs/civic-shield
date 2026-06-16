import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

interface Props {
  text: string;
  checked?: boolean;   // Optional: default is checked
}

export default function StatusRow({ text, checked = true }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          {checked ? "✓" : "○"}
        </Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 2,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
  },
  icon: {
    color: "#4ADE80",        // Bright green checkmark (matches design)
    fontSize: 26,
    fontWeight: "bold",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    flex: 1,
  },
});