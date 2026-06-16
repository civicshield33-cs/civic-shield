import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import AppInput from "../components/AppInput";
import PrimaryButton from "../components/PrimaryButton";

export default function MissingPersonScreen({ navigation }: any) {
  const { height } = useWindowDimensions();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policeNotified, setPoliceNotified] = useState(false);

  // Image Picker
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "We need access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Police Notification Logic
  const publishAlert = async () => {
    setIsSubmitting(true);

    // Simulate API call to notify police
    await new Promise(resolve => setTimeout(resolve, 1800));

    setPoliceNotified(true);

    Alert.alert(
      "✅ Alert Published",
      "Your missing person report has been submitted successfully.\n\nPolice have been notified and an alert has been broadcasted.",
      [
        { 
          text: "OK", 
          onPress: () => {
            setIsSubmitting(false);
            navigation.navigate("Tracking"); // or "Home"
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Missing Person</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Photo Upload */}
        <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <>
              <View style={styles.plusCircle}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
              <Text style={styles.photoText}>Upload Photo</Text>
              <Text style={styles.photoSubtext}>(Tap to add photo of missing person)</Text>
            </>
          )}
        </TouchableOpacity>

        <AppInput label="Full Name" placeholder="Enter full name" />
        <AppInput label="Age" placeholder="Enter age" keyboardType="numeric" />
        <AppInput label="Last Seen Location" placeholder="Enter last seen location" />
        <AppInput label="Last Seen Date & Time" placeholder="Select date & time" />

        {/* Police Notification Status */}
        <View style={styles.policeStatus}>
          <Text style={styles.statusIcon}>🟢</Text>
          <Text style={styles.statusText}>
            Police will be notified automatically upon publishing
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={isSubmitting ? "Publishing..." : "Publish Alert"}
          onPress={publishAlert}
          disabled={isSubmitting}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "600", 
    color: "#FFFFFF", 
    flex: 1, 
    textAlign: "center" 
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  photoBox: {
    height: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  plusCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#3B82F6",
  },
  plusIcon: { fontSize: 42, color: "#3B82F6", fontWeight: "bold" },
  photoText: { fontSize: 19, fontWeight: "700", color: "#1F2937", marginBottom: 6 },
  photoSubtext: { fontSize: 14.5, color: "#6B7280", textAlign: "center", paddingHorizontal: 30 },
  
  policeStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
  },
  statusIcon: { fontSize: 24, marginRight: 12 },
  statusText: { fontSize: 16, color: "#166534", fontWeight: "500" },

  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 17,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "700",
  },
});