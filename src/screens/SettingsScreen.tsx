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
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useUserProfile } from "../hooks/useUserProfile";
import { useSettingsStore } from "../store/settingsStore";
import { useContactStore } from "../store/contactStore";
import ConfirmModal from "../components/ConfirmModal";
import { getPendingQueueCount, syncOfflineQueue } from "../services/offlineQueueService";
import { logoutAccount } from "../services/authService";
import { resetToWelcome } from "../utils/navigation";

export default function SettingsScreen({ navigation }: any) {
  const { user, firstName } = useUserProfile();
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const contacts = useContactStore((s) => s.contacts);
  const loadContacts = useContactStore((s) => s.loadContacts);

  const [modalVisible, setModalVisible] = useState(false);
  const [phraseModal, setPhraseModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [phraseDraft, setPhraseDraft] = useState(settings.voicePhrase);
  const [pinDraft, setPinDraft] = useState(settings.silentPin);
  const [pendingQueue, setPendingQueue] = useState(0);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
      loadContacts();
      getPendingQueueCount().then(setPendingQueue);
      syncOfflineQueue().then((r) => {
        if (r.synced > 0) {
          Alert.alert("Synced", `${r.synced} offline SOS alert(s) uploaded.`);
        }
      });
    }, [loadSettings, loadContacts])
  );

  useEffect(() => {
    setPhraseDraft(settings.voicePhrase);
    setPinDraft(settings.silentPin);
  }, [settings.voicePhrase, settings.silentPin]);

  const testSOS = () => {
    Alert.alert("TEST MODE", "Simulation only — no real alert sent.");
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    await logoutAccount();
    setLogoutModalVisible(false);
    resetToWelcome(navigation);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.fullName || "Civic Shield User"}
            </Text>
            <Text style={styles.profilePhone}>
              {user?.email || user?.phone || "No contact on file"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Silent & voice activation</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setPinModal(true)}
        >
          <View>
            <Text style={styles.settingTitle}>Secret PIN (silent SOS)</Text>
            <Text style={styles.settingSubtitle}>
              {settings.silentPin ? "PIN configured" : "Not set — tap to configure"}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setPhraseModal(true)}
        >
          <View>
            <Text style={styles.settingTitle}>Emergency voice phrase</Text>
            <Text style={styles.settingSubtitle}>
              "{settings.voicePhrase}" (+ Help Me Now, Red Alert)
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Shake to trigger SOS</Text>
            <Text style={styles.settingSubtitle}>3 shakes within 2 seconds</Text>
          </View>
          <Switch
            value={settings.shakeEnabled}
            onValueChange={(v) => updateSettings({ shakeEnabled: v })}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Voice phrase listening</Text>
            <Text style={styles.settingSubtitle}>Web browser microphone</Text>
          </View>
          <Switch
            value={settings.voiceEnabled}
            onValueChange={(v) => updateSettings({ voiceEnabled: v })}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Hidden emergency button</Text>
            <Text style={styles.settingSubtitle}>Disguised weather widget on Home</Text>
          </View>
          <Switch
            value={settings.hiddenButtonEnabled}
            onValueChange={(v) => updateSettings({ hiddenButtonEnabled: v })}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Silent mode</Text>
            <Text style={styles.settingSubtitle}>No flash / discreet screen</Text>
          </View>
          <Switch
            value={settings.silentMode}
            onValueChange={(v) => updateSettings({ silentMode: v })}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Women's Safety Mode</Text>
            <Text style={styles.settingSubtitle}>Silent SOS + evidence recording</Text>
          </View>
          <Switch
            value={settings.womensSafetyMode}
            onValueChange={(v) =>
              updateSettings({ womensSafetyMode: v, silentMode: v ? true : settings.silentMode })
            }
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Power button SOS</Text>
            <Text style={styles.settingSubtitle}>Native only — not available on web</Text>
          </View>
          <Switch
            value={settings.powerButtonEnabled}
            onValueChange={(v) => updateSettings({ powerButtonEnabled: v })}
          />
        </View>

        <Text style={styles.sectionLabel}>Gambia features</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate("FloodAlerts")}
        >
          <View>
            <Text style={styles.settingTitle}>Flood & disaster alerts</Text>
            <Text style={styles.settingSubtitle}>Regional rainy-season warnings</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate("TouristSafety")}
        >
          <View>
            <Text style={styles.settingTitle}>Tourist Safety Mode</Text>
            <Text style={styles.settingSubtitle}>
              {settings.touristMode ? "Active" : "Register hotel & embassy"}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate("EmergencyPhrases")}
        >
          <View>
            <Text style={styles.settingTitle}>Emergency phrases</Text>
            <Text style={styles.settingSubtitle}>Wolof, Mandinka, French</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Low-bandwidth mode</Text>
            <Text style={styles.settingSubtitle}>Reduce map/image data usage</Text>
          </View>
          <Switch
            value={settings.lowBandwidthMode}
            onValueChange={(v) => updateSettings({ lowBandwidthMode: v })}
          />
        </View>

        {pendingQueue > 0 ? (
          <View style={styles.queueBanner}>
            <Text style={styles.queueText}>
              {pendingQueue} offline SOS queued — will sync when online
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>General</Text>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>SOS cancel delay</Text>
            <Text style={styles.settingSubtitle}>{settings.sosDelay} seconds</Text>
          </View>
          <View style={styles.delayBox}>
            <TouchableOpacity
              onPress={() =>
                updateSettings({ sosDelay: Math.max(0, settings.sosDelay - 1) })
              }
            >
              <Text style={styles.delayBtn}>-</Text>
            </TouchableOpacity>
            <Text style={styles.delayValue}>{settings.sosDelay}</Text>
            <TouchableOpacity
              onPress={() => updateSettings({ sosDelay: settings.sosDelay + 1 })}
            >
              <Text style={styles.delayBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate("Contacts")}
        >
          <View>
            <Text style={styles.settingTitle}>Trusted contacts</Text>
            <Text style={styles.settingSubtitle}>
              {contacts.length} contacts active
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setModalVisible(true)}
        >
          <View>
            <Text style={styles.settingTitle}>Language</Text>
            <Text style={styles.settingSubtitle}>{settings.language}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testSOS}>
          <Text style={styles.testText}>Test SOS (safe mode)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.onboardBtn}
          onPress={() => navigation.navigate("Onboarding")}
        >
          <Text style={styles.onboardText}>Replay safety onboarding</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* <View style={styles.adminSection}>
          <Text style={styles.adminHeader}>Command Center</Text>
          <TouchableOpacity
            style={styles.commandCenterButton}
            onPress={() => navigation.navigate("OperatorLogin")}
          >
            <Text style={styles.commandCenterIcon}>🛡️</Text>
            <Text style={styles.commandCenterText}>Government operator login</Text>
            <Text style={styles.commandCenterArrow}>›</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>

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
                  onPress={() => {
                    updateSettings({ language: item });
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.languageText}>{item}</Text>
                  {settings.language === item ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : null}
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

      <Modal visible={phraseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom voice phrase</Text>
            <TextInput
              style={styles.textInput}
              value={phraseDraft}
              onChangeText={setPhraseDraft}
              placeholder="e.g. red alert"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                updateSettings({ voicePhrase: phraseDraft.trim() || "help me now" });
                setPhraseModal(false);
              }}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={pinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Secret PIN (4–6 digits)</Text>
            <TextInput
              style={styles.textInput}
              value={pinDraft}
              onChangeText={setPinDraft}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              placeholder="Enter PIN"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                updateSettings({ silentPin: pinDraft.trim() });
                setPinModal(false);
              }}
            >
              <Text style={{ color: "#fff" }}>Save PIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={logoutModalVisible}
        title="Log out"
        message="Are you sure you want to sign out of Civic Shield?"
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
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
  backArrow: { fontSize: 28, color: "#fff", marginRight: 10 },
  headerTitle: { fontSize: 22, color: "#fff", fontWeight: "700" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: { fontSize: 22, fontWeight: "800", color: "#0B2A6F" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 2 },
  profilePhone: { fontSize: 14, color: "#64748B" },
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
  settingSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 3, maxWidth: 260 },
  arrow: { fontSize: 22, color: "#999" },
  delayBox: { flexDirection: "row", alignItems: "center" },
  delayBtn: { fontSize: 22, paddingHorizontal: 10, color: "#001F3F" },
  delayValue: { fontSize: 16, fontWeight: "700" },
  testButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  testText: { color: "#fff", fontWeight: "700" },
  onboardBtn: {
    marginTop: 12,
    padding: 14,
    alignItems: "center",
  },
  onboardText: { color: "#2563EB", fontWeight: "600" },
  logoutButton: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "#DC2626", fontWeight: "700", fontSize: 16 },
  queueBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  queueText: { color: "#92400E", fontSize: 13, fontWeight: "600" },
  adminSection: { marginTop: 24 },
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
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  textInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
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
