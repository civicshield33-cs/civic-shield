import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function AlertCard({
  emoji,
  title,
  location,
  time,
}: any) {
  return (
    <View style={styles.card}>

      <Text style={styles.icon}>
        {emoji}
      </Text>

      <View>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text>
          {location}
        </Text>

        <Text style={styles.time}>
          {time}
        </Text>
      </View>

    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "white",
      borderRadius: 15,
      padding: 18,
      flexDirection: "row",
      marginBottom: 15,
    },

    icon: {
      fontSize: 34,
      marginRight: 15,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
    },

    time: {
      color: "#6B7280",
      marginTop: 5,
    },
  });