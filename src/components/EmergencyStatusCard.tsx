import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../theme/colors";

export type EmergencyStatusLevel = "safe" | "setup" | "emergency";

type Props = {
  level: EmergencyStatusLevel;
  contactCount?: number;
  onPressSetup?: () => void;
  onPressEmergency?: () => void;
};

const CONFIG = {
  safe: {
    title: "SAFE",
    badge: "✓",
    subtext: (count: number) =>
      `${count} emergency contact${count === 1 ? "" : "s"} active`,
    card: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
    icon: "shield-checkmark" as const,
    iconColor: "#059669",
    titleColor: "#047857",
  },
  setup: {
    title: "Setup required",
    badge: "",
    subtext: () => "Add emergency contacts to enable SOS",
    card: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
    icon: "warning" as const,
    iconColor: "#D97706",
    titleColor: COLORS.text,
  },
  emergency: {
    title: "EMERGENCY ACTIVE",
    badge: "",
    subtext: () => "Help is on the way — tap for details",
    card: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
    icon: "alert-circle" as const,
    iconColor: "#DC2626",
    titleColor: "#B91C1C",
  },
};

export default function EmergencyStatusCard({
  level,
  contactCount = 0,
  onPressSetup,
  onPressEmergency,
}: Props) {
  const config = CONFIG[level];
  const pressable = level === "setup" || level === "emergency";
  const onPress =
    level === "emergency" ? onPressEmergency : level === "setup" ? onPressSetup : undefined;

  const content = (
    <>
      <View style={styles.statusIconWrap}>
        <Ionicons name={config.icon} size={22} color={config.iconColor} />
      </View>

      <View style={styles.statusTextWrap}>
        <View style={styles.titleRow}>
          <Text style={[styles.statusTitle, { color: config.titleColor }]}>
            {config.title}
          </Text>
          {config.badge ? (
            <Text style={[styles.safeBadge, { color: config.titleColor }]}>
              {config.badge}
            </Text>
          ) : null}
        </View>
        <Text style={styles.statusSubtext}>{config.subtext(contactCount)}</Text>
      </View>

      {pressable ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={level === "emergency" ? "#DC2626" : "#B45309"}
        />
      ) : null}
    </>
  );

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.statusCard, config.card]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.statusCard, config.card]}>{content}</View>;
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },

  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  statusTextWrap: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  safeBadge: {
    fontSize: 18,
    fontWeight: "800",
  },

  statusSubtext: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
});
