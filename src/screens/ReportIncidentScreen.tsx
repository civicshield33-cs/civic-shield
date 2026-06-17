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
  Image,
  ActivityIndicator,
  FlatList,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import IncidentCard from "../components/IncidentCard";
import LocationPinMap from "../components/LocationPinMap";
import {
  DEFAULT_MAP_CENTER,
  formatPinLabel,
  getTownCenter,
  MapCoordinate,
  resolveReportCoordinates,
} from "../data/gambiaLocations";
import {
  submitIncidentReport,
  submitMissingPersonReport,
} from "../services/incidentService";
import { getCurrentUserId } from "../services/authService";
import { APP_URL } from "../config/app";

type Suggestion = {
  name: string;
  region: string;
  score?: number;
};

export default function ReportIncidentScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [description, setDescription] = useState("");
  const [mapCenter, setMapCenter] = useState<MapCoordinate>(DEFAULT_MAP_CENTER);
  const [centerRevision, setCenterRevision] = useState(0);
  const [pin, setPin] = useState<MapCoordinate | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    location: "",
    lastSeen: "",
  });

  const categories = [
    { icon: "🔥", title: "Fire", color: "#EF4444" },
    { icon: "🚗", title: "Accident", color: "#F59E0B" },
    { icon: "🕵️", title: "Crime", color: "#8B5CF6" },
    { icon: "🌊", title: "Flood", color: "#3B82F6" },
    { icon: "👤", title: "Missing Person", color: "#EC4899" },
    { icon: "⋯", title: "Other", color: "#6B7280" },
  ];

  // 🇬🇲 FULL GAMBIA LOCATIONS (EXPANDED)
  const GAMBIA_LOCATIONS: Suggestion[] = [
    { name: "Banjul", region: "Capital" },
    { name: "Kanifing", region: "Urban Area" },
    { name: "Serrekunda", region: "Kanifing" },
    { name: "Brikama", region: "West Coast" },
    { name: "Bakau", region: "Kanifing" },
    { name: "Sukuta", region: "West Coast" },
    { name: "Kotu", region: "Kanifing" },
    { name: "Kololi", region: "Kanifing" },
    { name: "Westfield", region: "Kanifing" },
    { name: "Latri Kunda", region: "Kanifing" },
    { name: "Tallinding", region: "Kanifing" },

    // West Coast villages
    { name: "Gunjur", region: "West Coast" },
    { name: "Sanyang", region: "West Coast" },
    { name: "Tanji", region: "West Coast" },
    { name: "Kartong", region: "West Coast" },
    { name: "Brufut", region: "West Coast" },
    { name: "Tujereng", region: "West Coast" },
    { name: "Jambanjelly", region: "West Coast" },

    // Lower River
    { name: "Soma", region: "Lower River" },
    { name: "Mansa Konko", region: "Lower River" },
    { name: "Jarra Soma", region: "Lower River" },

    // Central River
    { name: "Janjanbureh", region: "Central River" },
    { name: "Bansang", region: "Central River" },
    { name: "Kuntaur", region: "Central River" },

    // Upper River
    { name: "Basse", region: "Upper River" },
    { name: "Fatoto", region: "Upper River" },
    { name: "Sabi", region: "Upper River" },
    { name: "Koina", region: "Upper River" },

    // North Bank
    { name: "Farafenni", region: "North Bank" },
    { name: "Kerewan", region: "North Bank" },
    { name: "Kaur", region: "North Bank" },
    { name: "Essau", region: "North Bank" },
  ];

  // 🧠 FUZZY MATCH FUNCTION
  const getSimilarity = (a: string, b: string) => {
    let matches = 0;
    const minLen = Math.min(a.length, b.length);

    for (let i = 0; i < minLen; i++) {
      if (a[i] === b[i]) matches++;
    }

    return (matches / Math.max(a.length, b.length)) * 30;
  };

  const applyLocation = (item: Suggestion) => {
    setSearchText(item.name);
    setFormData((prev) => ({ ...prev, location: item.name }));
    setMapCenter(getTownCenter(item.name));
    setCenterRevision((value) => value + 1);
    setPin(null);
    setShowSuggestions(false);
  };

  // 🔍 SMART SEARCH (UPGRADED)
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = text.toLowerCase().trim();

    const scored = GAMBIA_LOCATIONS.map((item) => {
      const name = item.name.toLowerCase();

      let score = 0;

      if (name === query) score += 100;
      if (name.startsWith(query)) score += 80;
      if (name.includes(query)) score += 50;

      score += getSimilarity(name, query);

      return { ...item, score };
    });

    const filtered = scored
      .filter((item) => (item.score ?? 0) > 20)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 10);

    setSuggestions(filtered);
    setShowSuggestions(true);

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

  // 📸 IMAGE PICKER
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openReportForm = (category: any) => {
    setSelectedCategory(category);
    setModalVisible(true);
    setFormData({ fullName: "", age: "", location: "", lastSeen: "" });
    setDescription("");
    setSearchText("");
    setSelectedImage(null);
    setMapCenter(DEFAULT_MAP_CENTER);
    setCenterRevision(0);
    setPin(null);
  };

  // 📲 WHATSAPP SHARE
  const shareToWhatsApp = () => {
    if (!formData.location) {
      Alert.alert("Error", "Please select a location first");
      return;
    }

    const message =
      `🚨 *CIVIC ALERT*\n\n` +
      `Type: ${selectedCategory?.title}\n` +
      `Location: ${formData.location}\n` +
      (description ? `Details: ${description}\n` : "") +
      `Status: Active\n\n` +
      `View alerts:\n${APP_URL}`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL("whatsapp://send").then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("WhatsApp not installed");
      }
    });
  };

  const isMissingPerson = selectedCategory?.title === "Missing Person";
  const isCrime = selectedCategory?.title === "Crime";

  // 🚨 SUBMIT REPORT
  const submitReport = async () => {
    if (!formData.location) {
      Alert.alert("Error", "Please select a location");
      return;
    }

    if (isCrime && !pin) {
      Alert.alert("Error", "Please pin your exact spot on the map");
      return;
    }

    if (isMissingPerson && !formData.fullName.trim()) {
      Alert.alert("Error", "Please enter the person's full name");
      return;
    }

    if (isMissingPerson && !formData.lastSeen.trim()) {
      Alert.alert("Error", "Please enter when they were last seen");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await getCurrentUserId();
      const coords = resolveReportCoordinates(
        formData.location,
        pin?.latitude,
        pin?.longitude
      );

      let savedTo: "cloud" | "local" = "local";
      let uploadFailed = false;

      if (isMissingPerson) {
        const result = await submitMissingPersonReport({
          userId,
          fullName: formData.fullName.trim(),
          age: formData.age.trim() || undefined,
          lastSeen: formData.lastSeen.trim(),
          location: formData.location,
          latitude: coords.latitude,
          longitude: coords.longitude,
          photoUri: selectedImage || undefined,
        });
        savedTo = result.savedTo;
        uploadFailed = Boolean(result.uploadFailed);
      } else {
        const result = await submitIncidentReport({
          userId,
          type: selectedCategory?.title || "Other",
          description:
            description.trim() ||
            `${selectedCategory?.title} reported in ${formData.location}`,
          location: formData.location,
          latitude: coords.latitude,
          longitude: coords.longitude,
          photoUri: selectedImage || undefined,
        });
        savedTo = result.savedTo;
        uploadFailed = Boolean(result.uploadFailed);
      }

      if (uploadFailed) {
        Alert.alert(
          "Upload Failed",
          "We could not upload your report after 3 attempts. It was removed from this device.\n\nPlease check your connection and try again."
        );
        return;
      }

      Alert.alert(
        "Report Sent",
        savedTo === "cloud"
          ? "🟢 Police + Community alerted.\n\nYour report is now visible in Community."
          : "Your report is saved on this device. We'll keep retrying to upload it to the cloud."
      );

      setModalVisible(false);
      navigation.navigate("MainTabs", { screen: "CommunityTab" });
    } catch {
      Alert.alert("Error", "Could not submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>What happened?</Text>

        <View style={styles.grid}>
          {categories.map((cat, i) => (
            <IncidentCard
              key={i}
              emoji={cat.icon}
              title={cat.title}
              color={cat.color + "20"}
              onPress={() => openReportForm(cat)}
            />
          ))}
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modal}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Report {selectedCategory?.title}
            </Text>
            <Text style={styles.modalSubtitle}>
              Police and the community are notified when you submit.
            </Text>

            {/* IMAGE */}
            <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.img} />
              ) : (
                <Text>📸 Upload Photo (optional)</Text>
              )}
            </TouchableOpacity>

            {isMissingPerson ? (
              <>
                <TextInput
                  placeholder="Full name"
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  placeholder="Age (optional)"
                  value={formData.age}
                  onChangeText={(text) =>
                    setFormData({ ...formData, age: text })
                  }
                  style={styles.input}
                  keyboardType="number-pad"
                />
                <TextInput
                  placeholder="Last seen (e.g. Today 3pm at market)"
                  value={formData.lastSeen}
                  onChangeText={(text) =>
                    setFormData({ ...formData, lastSeen: text })
                  }
                  style={styles.input}
                />
              </>
            ) : null}

            {/* SEARCH */}
            <TextInput
              placeholder="Search location in The Gambia"
              value={searchText}
              onChangeText={handleSearch}
              onSubmitEditing={confirmSearch}
              returnKeyType="search"
              style={styles.input}
            />

            {/* SUGGESTIONS */}
            {showSuggestions && (
              <FlatList
                data={suggestions}
                keyExtractor={(i) => i.name}
                style={styles.suggestions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectLocation(item)}
                    style={styles.suggestionItem}
                  >
                    <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>
                      {item.region} Region
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <Text style={styles.sectionTitle}>Pin your exact spot</Text>
            <Text style={styles.sectionHint}>
              Tap or drag on the map — your pin is what we save
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
                {isCrime
                  ? "Tap the map to place your pin — required before you can submit."
                  : "Tap the map to place your pin (optional)."}
              </Text>
            )}

            <TextInput
              placeholder="Describe what happened (optional)"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { minHeight: 70 }]}
              multiline
            />

            {/* ACTIONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={shareToWhatsApp}
              >
                <Text style={styles.whatsappText}>📲 WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btn}
                onPress={submitReport}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>
                Cancel
              </Text>
            </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#001F3F",
    paddingTop: 70,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  backArrow: { color: "white", fontSize: 28, marginRight: 10 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "600" },

  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },

  modalBox: {
    backgroundColor: "white",
    width: "90%",
    maxWidth: 420,
    padding: 20,
    borderRadius: 20,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },

  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001F3F",
    marginBottom: 4,
  },

  sectionHint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 10,
  },

  pinSetHint: {
    fontSize: 13,
    color: "#059669",
    marginBottom: 6,
  },

  pinRequiredHint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 10,
  },

  clearPinText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },

  imageBox: {
    height: 120,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  img: { width: "100%", height: "100%", borderRadius: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  suggestions: {
    backgroundColor: "white",
    maxHeight: 180,
  },

  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  btn: {
    flex: 1,
    backgroundColor: "#EF4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },

  submitText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  whatsappBtn: {
    flex: 1,
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },

  whatsappText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});