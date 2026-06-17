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
import * as Location from "expo-location";

import IncidentCard from "../components/IncidentCard";
import { submitIncidentReport } from "../services/incidentService";
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
  };

  const selectLocation = (item: Suggestion) => {
    setSearchText(item.name);
    setFormData({ ...formData, location: item.name });
    setShowSuggestions(false);
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

  // 🚨 SUBMIT REPORT
  const submitReport = async () => {
    if (!formData.location) {
      Alert.alert("Error", "Please select a location");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await getCurrentUserId();
      let latitude: number | undefined;
      let longitude: number | undefined;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        }
      } catch {
        // GPS optional
      }

      await submitIncidentReport({
        userId,
        type: selectedCategory?.title || "Other",
        description: description.trim() || `${selectedCategory?.title} reported in ${formData.location}`,
        location: formData.location,
        latitude,
        longitude,
        photoUri: selectedImage,
      });

      Alert.alert(
        "Report Sent 🚨",
        "Your report was submitted. Police and the community have been notified."
      );

      setModalVisible(false);
      navigation.navigate("MainTabs", { screen: "AlertsTab" });
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
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Report {selectedCategory?.title}
            </Text>

            {/* IMAGE */}
            <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.img} />
              ) : (
                <Text>📸 Upload Photo</Text>
              )}
            </TouchableOpacity>

            {/* SEARCH */}
            <TextInput
              placeholder="Search location in The Gambia"
              value={searchText}
              onChangeText={handleSearch}
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

            <TextInput
              placeholder="Describe what happened (optional)"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { minHeight: 70 }]}
              multiline
            />

            {/* STATUS */}
            <View style={styles.status}>
              <Text>🟢 Police + Community alerted</Text>
            </View>

            {/* WHATSAPP */}
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={shareToWhatsApp}
            >
              <Text style={styles.whatsappText}>📲 Share on WhatsApp</Text>
            </TouchableOpacity>

            {/* SUBMIT */}
            <TouchableOpacity style={styles.btn} onPress={submitReport} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "700" }}>
                  Submit Report
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "white",
    width: "90%",
    padding: 20,
    borderRadius: 20,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

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

  status: {
    backgroundColor: "#DCFCE7",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },

  btn: {
    backgroundColor: "#EF4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  whatsappBtn: {
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  whatsappText: {
    color: "white",
    fontWeight: "700",
  },
});