import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import SOSButton from "../components/SOSButton";
import EmergencyStatusCard, {
  EmergencyStatusLevel,
} from "../components/EmergencyStatusCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserProfile } from "../hooks/useUserProfile";
import { useSOSStore } from "../store/sosStore";
import { useSettingsStore } from "../store/settingsStore";
import { prepareSilentSOS } from "../utils/silentSOS";
import { COLORS } from "../theme/colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

const STORAGE_KEY = "EMERGENCY_CONTACTS";

type Contact = {
  id: string;
  name: string;
  phone: string;
};

type QuickAction = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  route: string;
  badge?: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    key: "contacts",
    title: "My Contacts",
    icon: "people",
    color: "#2563EB",
    bg: "#EFF6FF",
    route: "Contacts",
  },
  {
    key: "location",
    title: "Live Location",
    icon: "location",
    color: "#059669",
    bg: "#ECFDF5",
    route: "Tracking",
  },
  {
    key: "reports",
    title: "Incident Report",
    icon: "document-text",
    color: "#7C3AED",
    bg: "#F5F3FF",
    route: "ReportIncident",
  },
  {
    key: "alerts",
    title: "Safety Alerts",
    icon: "notifications",
    color: "#DC2626",
    bg: "#FEF2F2",
    route: "AlertsTab",
  },
];

export default function HomeScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [pinModal, setPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { firstName } = useUserProfile();
  const sosActive = useSOSStore((state) => state.active);
  const settings = useSettingsStore((s) => s.settings);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      setContacts(saved ? JSON.parse(saved) : []);
    } catch {
      setContacts([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
      loadSettings();
    }, [loadSettings])
  );

  useEffect(() => {
    const interval = setInterval(loadContacts, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerSilentSOS = useCallback(() => {
    const { screen, params } = prepareSilentSOS({
      silent: settings.silentMode || settings.womensSafetyMode,
      skipHold: true,
    });
    navigation.navigate(screen, params);
  }, [navigation, settings.silentMode, settings.womensSafetyMode]);

  const handleHiddenTap = () => {
    if (!settings.hiddenButtonEnabled) return;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setTapCount(0);
      triggerSilentSOS();
      return;
    }
    tapTimer.current = setTimeout(() => setTapCount(0), 2000);
  };

  const verifyPin = () => {
    if (settings.silentPin && pinInput === settings.silentPin) {
      setPinModal(false);
      setPinInput("");
      triggerSilentSOS();
    } else {
      Alert.alert("Invalid PIN", "Try again or set your PIN in Settings.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const isReady = contacts.length > 0;

  const statusLevel: EmergencyStatusLevel = sosActive
    ? "emergency"
    : isReady
      ? "safe"
      : "setup";

  const quickActions = QUICK_ACTIONS.map((action) =>
    action.key === "contacts"
      ? { ...action, badge: String(contacts.length) }
      : action
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleHiddenTap} activeOpacity={0.9}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{firstName}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate("AlertsTab")}
            onLongPress={() => setPinModal(true)}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.statusSectionLabel}>Emergency Status</Text>

        <EmergencyStatusCard
          level={statusLevel}
          contactCount={contacts.length}
          onPressSetup={() => navigation.navigate("Contacts")}
          onPressEmergency={() => navigation.navigate("Emergency")}
        />

        <View style={styles.sosSection}>
          <Text style={styles.sosLabel}>Emergency</Text>
          <SOSButton onPress={() => navigation.navigate("HoldSOS")} />
          <Text style={styles.sosHint}>Press and hold in an emergency</Text>

          {settings.hiddenButtonEnabled ? (
            <TouchableOpacity
              style={styles.disguisedBtn}
              onPress={triggerSilentSOS}
            >
              <Text style={styles.disguisedText}>☁️ Weather — Banjul 28°C</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(action.route)}
            >
              <View
                style={[styles.actionIconWrap, { backgroundColor: action.bg }]}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>

              <Text style={styles.actionTitle}>{action.title}</Text>

              {action.badge !== undefined ? (
                <Text style={styles.actionBadge}>{action.badge} saved</Text>
              ) : (
                <Text style={styles.actionBadgeMuted}>Open</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={pinModal} transparent animationType="fade">
        <View style={styles.pinOverlay}>
          <View style={styles.pinBox}>
            <Text style={styles.pinTitle}>Silent SOS PIN</Text>
            <TextInput
              style={styles.pinInput}
              secureTextEntry
              keyboardType="number-pad"
              value={pinInput}
              onChangeText={setPinInput}
              maxLength={6}
              placeholder="Enter PIN"
            />
            <TouchableOpacity style={styles.pinBtn} onPress={verifyPin}>
              <Text style={styles.pinBtnText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPinModal(false)}>
              <Text style={styles.pinCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  greeting: {
    fontSize: 15,
    color: "#CBD5E1",
    marginBottom: 4,
    textTransform: "capitalize",
  },

  name: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  statusSectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  sosSection: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 32,
  },

  sosLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 18,
  },

  sosHint: {
    marginTop: 14,
    fontSize: 13,
    color: "#64748B",
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },

  actionBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.buttonBlue,
  },

  actionBadgeMuted: {
    fontSize: 12,
    color: "#94A3B8",
  },

  disguisedBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
  },

  disguisedText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  pinOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  pinBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  pinTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  pinInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  pinBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  pinBtnText: { color: "#fff", fontWeight: "700" },
  pinCancel: { color: "#64748B" },
});
