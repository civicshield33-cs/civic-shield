import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "APP_SETTINGS";
const CONTACT_KEY = "EMERGENCY_CONTACTS";

export default function SettingsScreen({ navigation }: any) {
  const [powerSOS, setPowerSOS] = useState(true);
  const [shakeSOS, setShakeSOS] = useState(true);
  const [sosDelay, setSosDelay] = useState(5);
  const [language, setLanguage] = useState("English");

  const [modalVisible, setModalVisible] = useState(false);
  const [trustedCount, setTrustedCount] = useState(0);

  const languages = [
    "English",
    "Mandinka",
    "Wolof",
    "Fula",
    "Jola",
    "Serahule",
    "Serer",
    "Manjago",
    "Balanta",
    "Karoninka",
  ];

  // =========================
  // LOAD SETTINGS
  // =========================
  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setPowerSOS(data.powerSOS ?? true);
      setShakeSOS(data.shakeSOS ?? true);
      setLanguage(data.language ?? "English");
      setSosDelay(data.sosDelay ?? 5);
    }
  };

  // =========================
  // SAVE SETTINGS (AUTO SYNC)
  // =========================
  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ powerSOS, shakeSOS, language, sosDelay })
    );
  }, [powerSOS, shakeSOS, language, sosDelay]);

  // =========================
  // LOAD CONTACT COUNT (LIVE SYNC)
  // =========================
  const loadContacts = async () => {
    const saved = await AsyncStorage.getItem(CONTACT_KEY);
    if (saved) {
      const list = JSON.parse(saved);
      setTrustedCount(list.length);
    } else {
      setTrustedCount(0);
    }
  };

  // refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
      loadContacts();

      const interval = setInterval(() => {
        loadContacts();
      }, 1500);

      return () => clearInterval(interval);
    }, [])
  );

  // =========================
  // LANGUAGE CHANGE
  // =========================
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setModalVisible(false);
  };

  // =========================
  // TEST SOS
  // =========================
  const testSOS = () => {
    Alert.alert(
      "🧪 TEST MODE",
      "This is a simulation. No real emergency alert sent."
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* EMERGENCY PHRASE */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            Alert.alert("Emergency Phrase", "Current: HELP ME NOW")
          }
        >
          <View>
            <Text style={styles.settingTitle}>Emergency Phrase</Text>
            <Text style={styles.settingSubtitle}>HELP ME NOW</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* POWER SOS */}
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Power Button SOS</Text>
            <Text style={styles.settingSubtitle}>
              {powerSOS ? "Enabled" : "Disabled"}
            </Text>
          </View>
          <Switch value={powerSOS} onValueChange={setPowerSOS} />
        </View>

        {/* SHAKE SOS */}
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Shake Detection</Text>
            <Text style={styles.settingSubtitle}>
              {shakeSOS ? "Enabled" : "Disabled"}
            </Text>
          </View>
          <Switch value={shakeSOS} onValueChange={setShakeSOS} />
        </View>

        {/* SOS DELAY */}
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>SOS Delay</Text>
            <Text style={styles.settingSubtitle}>
              {sosDelay} seconds before alert
            </Text>
          </View>

          <View style={styles.delayBox}>
            <TouchableOpacity onPress={() => setSosDelay((p) => Math.max(0, p - 1))}>
              <Text style={styles.delayBtn}>-</Text>
            </TouchableOpacity>

            <Text style={styles.delayValue}>{sosDelay}</Text>

            <TouchableOpacity onPress={() => setSosDelay((p) => p + 1)}>
              <Text style={styles.delayBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TRUSTED CONTACTS */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate("Contacts")}
        >
          <View>
            <Text style={styles.settingTitle}>Trusted Contacts</Text>
            <Text style={styles.settingSubtitle}>
              {trustedCount} contacts active
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* LANGUAGE */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setModalVisible(true)}
        >
          <View>
            <Text style={styles.settingTitle}>Language</Text>
            <Text style={styles.settingSubtitle}>{language}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* TEST BUTTON */}
        <TouchableOpacity style={styles.testButton} onPress={testSOS}>
          <Text style={styles.testText}>🧪 Test SOS (Safe Mode)</Text>
        </TouchableOpacity>

        {/* ADMIN */}
        <View style={styles.adminSection}>
          <Text style={styles.adminHeader}>Command Center</Text>

          <TouchableOpacity
            style={styles.commandCenterButton}
            onPress={() => navigation.navigate("CommandCenterDashboard")}
          >
            <Text style={styles.commandCenterIcon}>🛡️</Text>
            <Text style={styles.commandCenterText}>
              Open Command Center
            </Text>
            <Text style={styles.commandCenterArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* LANGUAGE MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>

            <FlatList
              data={languages}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={() => handleLanguageChange(item)}
                >
                  <Text style={styles.languageText}>{item}</Text>
                  {language === item && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================
STYLES
========================= */
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

  backArrow: { fontSize: 28, color: "#fff", marginRight: 10 },

  headerTitle: { fontSize: 22, color: "#fff", fontWeight: "700" },

  scrollContent: { padding: 20 },

  settingRow: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  settingTitle: { fontSize: 16, fontWeight: "600" },

  settingSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 3 },

  arrow: { fontSize: 22, color: "#999" },

  delayBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  delayBtn: {
    fontSize: 22,
    paddingHorizontal: 10,
    color: "#001F3F",
  },

  delayValue: {
    fontSize: 16,
    fontWeight: "700",
  },

  testButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  testText: { color: "#fff", fontWeight: "700" },

  adminSection: { marginTop: 30 },

  adminHeader: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

  commandCenterButton: {
    backgroundColor: "#001F3F",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  commandCenterIcon: { fontSize: 26, marginRight: 10 },

  commandCenterText: { flex: 1, color: "#fff", fontWeight: "700" },

  commandCenterArrow: { color: "#fff", fontSize: 20 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },

  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  languageText: { fontSize: 16 },

  checkmark: { color: "#10B981", fontSize: 18 },

  closeButton: {
    marginTop: 10,
    backgroundColor: "#001F3F",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});