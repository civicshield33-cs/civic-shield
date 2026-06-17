import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

import { EMERGENCY_PHRASES } from "../services/gambiaService";

export default function EmergencyPhrasesScreen({ navigation }: any) {
  const [language, setLanguage] = useState<string>("All");

  const languages = useMemo(
    () => ["All", ...Array.from(new Set(EMERGENCY_PHRASES.map((p) => p.language)))],
    []
  );

  const phrases = useMemo(() => {
    if (language === "All") return EMERGENCY_PHRASES;
    return EMERGENCY_PHRASES.filter((p) => p.language === language);
  }, [language]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Phrases</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.tab, language === lang && styles.tabActive]}
            onPress={() => setLanguage(lang)}
          >
            <Text
              style={[styles.tabText, language === lang && styles.tabTextActive]}
            >
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Show these phrases to someone nearby or emergency responders if you need
          help in The Gambia.
        </Text>

        {phrases.map((phrase) => (
          <View key={phrase.id} style={styles.card}>
            <Text style={styles.category}>{phrase.category.toUpperCase()}</Text>
            <Text style={styles.english}>{phrase.english}</Text>
            <Text style={styles.translation}>{phrase.translation}</Text>
            <Text style={styles.lang}>{phrase.language}</Text>
          </View>
        ))}
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
  tabs: { paddingHorizontal: 12, paddingVertical: 12, maxHeight: 56 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#001F3F" },
  tabText: { color: "#475569", fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 14, color: "#64748B", lineHeight: 21, marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  english: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  translation: { fontSize: 18, color: "#1E40AF", fontWeight: "600", marginBottom: 4 },
  lang: { fontSize: 12, color: "#94A3B8" },
});
