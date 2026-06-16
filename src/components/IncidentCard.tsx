import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

interface Props {
  emoji: string;
  title: string;
  onPress: () => void;
  color?: string;
}

export default function IncidentCard({
  emoji,
  title,
  onPress,
  color = "#EFF6FF",
}: Props) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: color,
          width: isSmallScreen ? "47%" : "47%",
          height: isSmallScreen ? 115 : 130,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.icon}>{emoji}</Text>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a0b0c",
    textAlign: "center",
    paddingHorizontal: 8,
  },
});