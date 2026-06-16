import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

export default function UnitsStatusScreen({ navigation }: any) {
  const units = [
    {
      name: "Police Units",
      count: 8,
      status: "Active",
      color: "#10B981",
      icon: "👮‍♂️",
    },
    {
      name: "Ambulance Units",
      count: 5,
      status: "Active",
      color: "#3B82F6",
      icon: "🚑",
    },
    {
      name: "Fire Units",
      count: 3,
      status: "Active",
      color: "#EF4444",
      icon: "🚒",
    },
    {
      name: "Rapid Response",
      count: 4,
      status: "On Duty",
      color: "#8B5CF6",
      icon: "⚡",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Units Status</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>All units are operational</Text>

        {units.map((unit, index) => (
          <View key={index} style={styles.unitCard}>
            <View style={styles.unitLeft}>
              <Text style={styles.unitIcon}>{unit.icon}</Text>
              <View>
                <Text style={styles.unitName}>{unit.name}</Text>
                <Text style={styles.unitStatus}>{unit.status}</Text>
              </View>
            </View>

            <View style={styles.unitRight}>
              <Text style={[styles.unitCount, { color: unit.color }]}>
                {unit.count}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: unit.color }]} />
            </View>
          </View>
        ))}

        {/* Dispatch Button */}
        <TouchableOpacity style={styles.dispatchButton}>
          <Text style={styles.dispatchText}>🚨 Dispatch New Units</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButtonBottom}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { 
    paddingRight: 15 
  },
  backArrow: { 
    fontSize: 28, 
    color: "#FFFFFF", 
    fontWeight: "bold" 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "600", 
    color: "#FFFFFF" 
  },

  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#6B7280", 
    marginBottom: 20 
  },

  unitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  unitLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  unitIcon: { 
    fontSize: 36, 
    marginRight: 16 
  },
  unitName: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#1F2937" 
  },
  unitStatus: { 
    fontSize: 14, 
    color: "#10B981", 
    fontWeight: "500" 
  },
  unitRight: {
    alignItems: "center",
  },
  unitCount: { 
    fontSize: 32, 
    fontWeight: "bold" 
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },

  dispatchButton: {
    backgroundColor: "#001F3F",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  dispatchText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  backButtonBottom: {
    marginTop: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  backButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
});