import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function AlertCard({
  emoji,
  title,
  location,
  time,
  description,
  onPress,
}: {
  emoji: string;
  title: string;
  location: string;
  time: string;
  description?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >

      <Text style={styles.icon}>
        {emoji}
      </Text>

      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text>
          {location}
        </Text>

        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}

        <Text style={styles.time}>
          {time}
        </Text>
      </View>

    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor: "white",
      borderRadius: 15,
      padding: 18,
      flexDirection: "row",
      marginBottom: 15,
    },

    icon: {
      fontSize: 34,
      marginRight: 15,
    },

    content: {
      flex: 1,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
    },

    description: {
      color: "#475569",
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
    },

    time: {
      color: "#6B7280",
      marginTop: 5,
    },
  });