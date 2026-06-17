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

if (Platform.OS === "web") {
  require("./src/styles/ionicons.web.css");
}

function getQueryParam(name: string) {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

export default function App() {
  const [nativeFontsLoaded] = useFonts(
    Platform.OS === "web" ? {} : Ionicons.font
  );
  const [webFontsReady, setWebFontsReady] = useState(Platform.OS !== "web");
  const loadContacts = useContactStore((state) => state.loadContacts);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const [publicTrackId, setPublicTrackId] = useState<string | null>(null);
  const [publicWalkId, setPublicWalkId] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    let cancelled = false;
    const finish = () => {
      if (!cancelled) setWebFontsReady(true);
    };

    Ionicons.loadFont().then(finish).catch(finish);
    const timer = setTimeout(finish, 2500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    loadContacts().catch(() => undefined);
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

  const fontsReady =
    Platform.OS === "web" ? webFontsReady : nativeFontsLoaded;

  if (!fontsReady) {
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
