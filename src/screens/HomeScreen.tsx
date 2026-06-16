import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";

import SOSButton from "../components/SOSButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const STORAGE_KEY = "EMERGENCY_CONTACTS";

type Contact = {
  id: string;
  name: string;
  phone: string;
};

export default function HomeScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  // =========================
  // LOAD CONTACTS (LIVE SYNC)
  // =========================
  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      setContacts(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.log("Error loading contacts:", e);
    }
  };

  useEffect(() => {
    loadContacts();

    const interval = setInterval(() => {
      loadContacts();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // GREETING
  // =========================
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const isReady = contacts.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>John</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SAFETY CARD */}
        <View
          style={[
            styles.safeCard,
            { backgroundColor: isReady ? "#10B981" : "#F59E0B" },
          ]}
        >
          <View style={styles.safeHeader}>
            <Text style={styles.safeText}>
              {isReady ? "You are protected" : "Setup required"}
            </Text>

            <Text style={styles.checkIcon}>
              {isReady ? "🛡️" : "⚠️"}
            </Text>
          </View>

          <Text style={styles.safeSubtext}>
            {isReady
              ? `${contacts.length} emergency contacts active`
              : "Add emergency contacts to enable SOS"}
          </Text>
        </View>

        {/* SOS BUTTON */}
        <View style={styles.sosContainer}>
          <SOSButton
            onPress={() => navigation.navigate("HoldSOS")}
            style={styles.sosButtonStyle}
          />
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("Contacts")}
          >
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>
              Contacts ({contacts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("ReportIncident")}
          >
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureTitle}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("CommunityAlerts")}
          >
            <Text style={styles.featureIcon}>🚨</Text>
            <Text style={styles.featureTitle}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("SafeWalk")}
          >
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureTitle}>Safe Walk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("CommunityAlerts")}
        >
          <Text style={styles.navIcon}>🔔</Text>
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("SafeWalk")}
        >
          <Text style={styles.navIcon}>🚶</Text>
          <Text style={styles.navText}>Safe Walk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* =========================
STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#001F3F",
    paddingTop: 80,
    paddingBottom: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  greeting: {
    fontSize: 18,
    color: "#E0E7FF",
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  bellIcon: {
    fontSize: 26,
    color: "#FFFFFF",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  safeCard: {
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },

  safeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  safeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  checkIcon: {
    fontSize: 22,
  },

  safeSubtext: {
    color: "#fff",
    marginTop: 4,
    fontSize: 13,
  },

  sosContainer: {
    alignItems: "center",
    marginVertical: 20,
  },

  sosButtonStyle: {
    width: 100,
    height: 100,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  featureCard: {
    width: (width - 50) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },

  featureIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  navItem: {
    alignItems: "center",
  },

  navIcon: {
    fontSize: 22,
  },

  navText: {
    fontSize: 12,
    color: "#6B7280",
  },

  navTextActive: {
    fontSize: 12,
    color: "#001F3F",
    fontWeight: "700",
  },
});