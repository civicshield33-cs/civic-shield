import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Switch,
} from "react-native";

export default function FloodReportScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    severity: "",
    shareMother: true,
    shareBrother: true,
  });

  const openReportForm = () => {
    setFormData({
      location: "",
      description: "",
      severity: "",
      shareMother: true,
      shareBrother: true,
    });
    setModalVisible(true);
  };

  const submitReport = () => {
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please describe the flood situation");
      return;
    }

    Alert.alert(
      "Success",
      "Your Flood report has been submitted successfully.",
      [{ text: "OK", onPress: () => setModalVisible(false) }]
    );
  };

  const closeModal = () => setModalVisible(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flood Report</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.reportButton} onPress={openReportForm}>
          <Text style={styles.reportButtonText}>+ Report Flood Incident</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent Flood Reports</Text>

        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Banjul Low Lying Areas</Text>
          <Text style={styles.recentInfo}>1 hour ago • Moderate</Text>
        </View>

        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Westfield Community</Text>
          <Text style={styles.recentInfo}>Yesterday • Severe</Text>
        </View>
      </ScrollView>

      {/* Report Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Flood</Text>

            <TouchableOpacity style={styles.uploadArea}>
              <Text style={styles.uploadIcon}>📸</Text>
              <Text style={styles.uploadText}>Upload Photos / Evidence (optional)</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Affected Location"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Severity (Mild / Moderate / Severe)"
              value={formData.severity}
              onChangeText={(text) => setFormData({ ...formData, severity: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the situation..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={5}
            />

            <Text style={styles.shareTitle}>Share With</Text>
            <View style={styles.shareRow}>
              <Text style={styles.shareLabel}>Mother</Text>
              <Switch
                value={formData.shareMother}
                onValueChange={(val) => setFormData({ ...formData, shareMother: val })}
              />
            </View>
            <View style={styles.shareRow}>
              <Text style={styles.shareLabel}>Brother</Text>
              <Switch
                value={formData.shareBrother}
                onValueChange={(val) => setFormData({ ...formData, shareBrother: val })}
              />
            </View>

            {/* Cancel & Submit Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelModalButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.publishButton} onPress={submitReport}>
                <Text style={styles.publishButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },

  reportButton: {
    backgroundColor: "#001F3F",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },

  recentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  recentTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  recentInfo: { fontSize: 14, color: "#6B7280", marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#001F3F",
    marginBottom: 20,
    textAlign: "center",
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 16,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadIcon: { fontSize: 40, marginBottom: 8 },
  uploadText: { fontSize: 16, color: "#6B7280" },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  textArea: { height: 130, textAlignVertical: "top" },

  shareTitle: { fontSize: 17, fontWeight: "600", marginTop: 10, marginBottom: 12 },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  shareLabel: { fontSize: 16, color: "#1F2937" },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  publishButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 18,
    fontWeight: "600",
  },
});