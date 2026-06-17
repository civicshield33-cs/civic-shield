import "react-native-gesture-handler";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";

import AppNavigator from "./src/navigation/AppNavigator";
import AdminWebNavigator from "./src/navigation/AdminWebNavigator";
import PublicTrackScreen from "./src/screens/PublicTrackScreen";
import { useContactStore } from "./src/store/contactStore";
import { useSettingsStore } from "./src/store/settingsStore";
import {
  syncFirebaseAuthSession,
  syncMissingUserProfile,
} from "./src/services/authRecovery";

function getQueryParam(name: string) {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

export default function App() {
  const [fontsLoaded] = useFonts(Ionicons.font);
  const loadContacts = useContactStore((state) => state.loadContacts);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const [publicTrackId, setPublicTrackId] = useState<string | null>(null);
  const [publicWalkId, setPublicWalkId] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    loadContacts();
    loadSettings();
    syncFirebaseAuthSession()
      .then(() => syncMissingUserProfile())
      .catch(() => undefined);
  }, [loadContacts, loadSettings]);

  useEffect(() => {
    if (Platform.OS === "web") {
      setPublicTrackId(getQueryParam("track"));
      setPublicWalkId(getQueryParam("walk"));
      setAdminMode(getQueryParam("admin") === "1");
    }
  }, []);

  const isPublicView = useMemo(
    () => Boolean(publicTrackId || publicWalkId),
    [publicTrackId, publicWalkId]
  );

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F1F5F9",
        }}
      >
        <ActivityIndicator size="large" color="#001F3F" />
      </View>
    );
  }

  if (isPublicView) {
    return (
      <PublicTrackScreen trackId={publicTrackId} walkId={publicWalkId} />
    );
  }

  if (adminMode && Platform.OS === "web") {
    return <AdminWebNavigator />;
  }

  return <AppNavigator />;
}
