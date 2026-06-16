import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../theme/colors";

interface Props {
  emoji: string;
  name: string;
  phone: string;
}

export default function ContactCard({
  emoji,
  name,
  phone,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.avatar}>
        {emoji}
      </Text>

      <View>
        <Text style={styles.name}>
          {name}
        </Text>

        <Text style={styles.phone}>
          {phone}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    fontSize: 36,
    marginRight: 18,
  },

  name: {
    fontWeight: "700",
    fontSize: 18,
  },

  phone: {
    color: "#6B7280",
    marginTop: 4,
  },
});