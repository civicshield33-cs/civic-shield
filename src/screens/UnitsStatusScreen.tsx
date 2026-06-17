import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { getResponseUnits } from "../services/commandCenterService";
import { ResponseUnit } from "../types/operator";

const UNIT_META: Record<
  ResponseUnit["type"],
  { icon: string; color: string; label: string }
> = {
  police: { icon: "👮‍♂️", color: "#10B981", label: "Police Units" },
  ambulance: { icon: "🚑", color: "#3B82F6", label: "Ambulance Units" },
  fire: { icon: "🚒", color: "#EF4444", label: "Fire Units" },
  rapid: { icon: "⚡", color: "#8B5CF6", label: "Rapid Response" },
};

export default function UnitsStatusScreen({ navigation }: any) {
  const [units, setUnits] = useState<ResponseUnit[]>([]);

  useEffect(() => {
    getResponseUnits().then(setUnits);
    const interval = setInterval(() => getResponseUnits().then(setUnits), 4000);
    return () => clearInterval(interval);
  }, []);

  const grouped = Object.keys(UNIT_META).map((type) => {
    const list = units.filter((u) => u.type === type);
    const meta = UNIT_META[type as ResponseUnit["type"]];
    const responding = list.filter((u) => u.status === "responding").length;
    return {
      ...meta,
      count: list.length,
      responding,
      available: list.filter((u) => u.status === "available").length,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Units Status</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          {units.filter((u) => u.status === "available").length} units available
        </Text>

        {grouped.map((unit) => (
          <View key={unit.label} style={styles.unitCard}>
            <View style={styles.unitLeft}>
              <Text style={styles.unitIcon}>{unit.icon}</Text>
              <View>
                <Text style={styles.unitName}>{unit.label}</Text>
                <Text style={styles.unitStatus}>
                  {unit.available} available • {unit.responding} responding
                </Text>
              </View>
            </View>
            <Text style={[styles.unitCount, { color: unit.color }]}>
              {unit.count}
            </Text>
          </View>
        ))}

        <Text style={styles.listTitle}>Individual units</Text>
        {units.map((unit) => (
          <View key={unit.id} style={styles.unitRow}>
            <Text style={styles.unitRowName}>{unit.name}</Text>
            <Text
              style={[
                styles.unitRowStatus,
                {
                  color:
                    unit.status === "available"
                      ? "#10B981"
                      : unit.status === "responding"
                        ? "#F59E0B"
                        : "#94A3B8",
                },
              ]}
            >
              {unit.status}
              {unit.etaMinutes ? ` • ETA ${unit.etaMinutes}m` : ""}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.backButtonBottom}
          onPress={() => navigation.navigate("CommandCenterDashboard")}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { paddingRight: 15 },
  backArrow: { fontSize: 28, color: "#FFFFFF", fontWeight: "bold" },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "#FFFFFF" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: 16, color: "#6B7280", marginBottom: 20 },
  unitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
  },
  unitLeft: { flexDirection: "row", alignItems: "center" },
  unitIcon: { fontSize: 32, marginRight: 14 },
  unitName: { fontSize: 17, fontWeight: "600", color: "#1F2937" },
  unitStatus: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  unitCount: { fontSize: 28, fontWeight: "bold" },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
    color: "#0F172A",
  },
  unitRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitRowName: { fontWeight: "600", color: "#1F2937" },
  unitRowStatus: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  backButtonBottom: { marginTop: 24, paddingVertical: 14, alignItems: "center" },
  backButtonText: { color: "#6B7280", fontSize: 16, fontWeight: "600" },
});
