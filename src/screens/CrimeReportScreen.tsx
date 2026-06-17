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
  ActivityIndicator,
  FlatList,
} from "react-native";

import LocationPinMap from "../components/LocationPinMap";
import {
  DEFAULT_MAP_CENTER,
  formatPinLabel,
  getTownCenter,
  MapCoordinate,
} from "../data/gambiaLocations";
import { submitIncidentReport } from "../services/incidentService";
import { getCurrentUserId } from "../services/authService";

type Suggestion = {
  name: string;
  region: string;
};

const GAMBIA_LOCATIONS: Suggestion[] = [
  { name: "Banjul", region: "Capital" },
  { name: "Kanifing", region: "Urban Area" },
  { name: "Serrekunda", region: "Kanifing" },
  { name: "Brikama", region: "West Coast" },
  { name: "Bakau", region: "Kanifing" },
  { name: "Westfield", region: "Kanifing" },
  { name: "Kololi", region: "Kanifing" },
  { name: "Farafenni", region: "North Bank" },
  { name: "Basse", region: "Upper River" },
];

export default function CrimeReportScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapCoordinate>(DEFAULT_MAP_CENTER);
  const [centerRevision, setCenterRevision] = useState(0);
  const [pin, setPin] = useState<MapCoordinate | null>(null);
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    time: "",
    shareMother: true,
    shareBrother: true,
  });

  const applyLocation = (item: Suggestion) => {
    setSearchText(item.name);
    setFormData((prev) => ({ ...prev, location: item.name }));
    setMapCenter(getTownCenter(item.name));
    setCenterRevision((value) => value + 1);
    setPin(null);
    setShowSuggestions(false);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = text.toLowerCase().trim();
    const filtered = GAMBIA_LOCATIONS.filter((item) =>
      item.name.toLowerCase().includes(query)
    ).slice(0, 8);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);

    const exact = GAMBIA_LOCATIONS.find(
      (item) => item.name.toLowerCase() === query
    );
    if (exact) {
      setFormData((prev) => ({ ...prev, location: exact.name }));
      setMapCenter(getTownCenter(exact.name));
      setCenterRevision((value) => value + 1);
      setPin(null);
    }
  };

  const confirmSearch = () => {
    const query = searchText.toLowerCase().trim();
    if (!query) return;

    const exact = GAMBIA_LOCATIONS.find(
      (item) => item.name.toLowerCase() === query
    );
    if (exact) {
      applyLocation(exact);
      return;
    }

    if (suggestions[0]) {
      applyLocation(suggestions[0]);
    }
  };

  const selectLocation = (item: Suggestion) => {
    applyLocation(item);
  };

  const openReportForm = () => {
    setFormData({
      location: "",
      description: "",
      time: "",
      shareMother: true,
      shareBrother: true,
    });
    setSearchText("");
    setSuggestions([]);
    setShowSuggestions(false);
    setMapCenter(DEFAULT_MAP_CENTER);
    setCenterRevision(0);
    setPin(null);
    setModalVisible(true);
  };

  const submitReport = async () => {
    if (!formData.location.trim()) {
      Alert.alert("Error", "Please select your area first");
      return;
    }

    if (!pin) {
      Alert.alert("Error", "Please pin your exact spot on the map");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Error", "Please describe the incident");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await getCurrentUserId();
      const details = [
        formData.description.trim(),
        formData.time.trim() ? `Time: ${formData.time.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const result = await submitIncidentReport({
        userId,
        type: "Crime",
        description: details,
        location: formData.location.trim(),
        latitude: pin.latitude,
        longitude: pin.longitude,
      });

      if (result.uploadFailed) {
        Alert.alert(
          "Upload Failed",
          "We could not upload your report after 3 attempts. It was removed from this device.\n\nPlease check your connection and try again."
        );
        return;
      }

      Alert.alert(
        "Report Submitted",
        result.savedTo === "cloud"
          ? "Your crime report is now visible in Community."
          : "Your report is saved on this device. We'll keep retrying to upload it to the cloud.",
        [
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false);
              navigation.navigate("MainTabs", { screen: "CommunityTab" });
            },
          },
        ]
      );
    } catch {
      Alert.alert("Error", "Could not submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crime Report</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.reportButton} onPress={openReportForm}>
          <Text style={styles.reportButtonText}>+ Create New Crime Report</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent Crime Reports</Text>

        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Theft at Serrekunda Market</Text>
          <Text style={styles.recentInfo}>2 hours ago • West Coast Region</Text>
        </View>

        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Assault near Banjul Highway</Text>
          <Text style={styles.recentInfo}>Yesterday • Reported by Community</Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Report Crime</Text>

              <Text style={styles.stepLabel}>Your area</Text>
              <Text style={styles.stepHint}>
                Centers the map — your pin below is what we save
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Search location in The Gambia"
                value={searchText}
                onChangeText={handleSearch}
                onSubmitEditing={confirmSearch}
                returnKeyType="search"
              />

              {showSuggestions ? (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.name}
                  style={styles.suggestions}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => selectLocation(item)}
                      style={styles.suggestionItem}
                    >
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionRegion}>
                        {item.region} Region
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : null}

              <Text style={styles.stepLabel}>Pin your exact spot</Text>
              <Text style={styles.stepHint}>
                Tap or drag on the map to mark where it happened
              </Text>

              <LocationPinMap
                center={mapCenter}
                pin={pin}
                onPinChange={setPin}
                centerRevision={centerRevision}
              />

              {pin ? (
                <>
                  <Text style={styles.pinSetHint}>{formatPinLabel(pin)}</Text>
                  <TouchableOpacity onPress={() => setPin(null)}>
                    <Text style={styles.clearPinText}>Clear pin</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.pinRequiredHint}>
                  Tap the map to place your pin — required before you can submit.
                </Text>
              )}

              <TouchableOpacity style={styles.uploadArea}>
                <Text style={styles.uploadIcon}>📸</Text>
                <Text style={styles.uploadText}>Upload Photo / Evidence (optional)</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Date & Time of Incident"
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the crime in detail..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={5}
              />

              <Text style={styles.shareTitle}>Share With</Text>
              <View style={styles.shareRow}>
                <Text style={styles.shareLabel}>Mother</Text>
                <Switch
                  value={formData.shareMother}
                  onValueChange={(val) =>
                    setFormData({ ...formData, shareMother: val })
                  }
                />
              </View>
              <View style={styles.shareRow}>
                <Text style={styles.shareLabel}>Brother</Text>
                <Switch
                  value={formData.shareBrother}
                  onValueChange={(val) =>
                    setFormData({ ...formData, shareBrother: val })
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.publishButton}
                onPress={submitReport}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.publishButtonText}>Submit Crime Report</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  recentInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#001F3F",
    marginBottom: 16,
    textAlign: "center",
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001F3F",
    marginBottom: 4,
  },
  stepHint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 10,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 16,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
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

  suggestions: {
    maxHeight: 160,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  suggestionName: { fontWeight: "600", color: "#1F2937" },
  suggestionRegion: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  pinSetHint: {
    fontSize: 13,
    color: "#059669",
    marginBottom: 6,
  },
  pinRequiredHint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
  },
  clearPinText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  shareTitle: { fontSize: 17, fontWeight: "600", marginTop: 4, marginBottom: 12 },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  shareLabel: { fontSize: 16, color: "#1F2937" },

  publishButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: { color: "#6B7280", fontSize: 16 },
});
