import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";

import AppInput from "../components/AppInput";
import PrimaryButton from "../components/PrimaryButton";
import { saveTouristProfile } from "../services/gambiaService";
import { useSettingsStore } from "../store/settingsStore";

export default function TouristSafetyScreen({ navigation }: any) {
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [hotelName, setHotelName] = useState("");
  const [hotelPhone, setHotelPhone] = useState("");
  const [embassyName, setEmbassyName] = useState("");
  const [embassyPhone, setEmbassyPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!hotelName.trim() || !embassyPhone.trim()) {
      Alert.alert("Required", "Please enter your hotel and embassy contact.");
      return;
    }

    setSaving(true);
    await saveTouristProfile({
      hotelName: hotelName.trim(),
      hotelPhone: hotelPhone.trim(),
      embassyName: embassyName.trim() || "Embassy",
      embassyPhone: embassyPhone.trim(),
      emergencyContact: emergencyContact.trim(),
      registeredAt: new Date().toISOString(),
    });
    await updateSettings({ touristMode: true });
    setSaving(false);

    Alert.alert(
      "Tourist Safety Mode",
      "Your hotel and embassy contacts are saved. They will be included in emergency alerts.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tourist Safety</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Register your stay details so Civic Shield can alert your hotel and
          embassy during an emergency.
        </Text>

        <AppInput
          label="Hotel / Lodge name"
          value={hotelName}
          onChangeText={setHotelName}
          placeholder="e.g. Senegambia Beach Hotel"
          required
        />
        <AppInput
          label="Hotel phone"
          value={hotelPhone}
          onChangeText={setHotelPhone}
          placeholder="+220 ..."
          keyboardType="phone-pad"
        />
        <AppInput
          label="Embassy / consulate"
          value={embassyName}
          onChangeText={setEmbassyName}
          placeholder="e.g. British Embassy"
        />
        <AppInput
          label="Embassy phone"
          value={embassyPhone}
          onChangeText={setEmbassyPhone}
          placeholder="+220 ..."
          keyboardType="phone-pad"
          required
        />
        <AppInput
          label="Personal emergency contact"
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          placeholder="Family or friend abroad"
          keyboardType="phone-pad"
          optional
        />

        <PrimaryButton
          title={saving ? "Saving..." : "Activate Tourist Safety Mode"}
          onPress={handleSave}
          disabled={saving}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backArrow: { fontSize: 28, color: "#fff", marginRight: 12 },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },
  content: { padding: 20, paddingBottom: 40 },
  intro: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 20,
  },
});
