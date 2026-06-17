import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { OPERATOR_PIN } from "../types/operator";

const SESSION_KEY = "OPERATOR_SESSION";

export async function isOperatorLoggedIn() {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  return Boolean(session);
}

export async function logoutOperator() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export default function OperatorLoginScreen({ navigation }: any) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    if (pin.trim() === OPERATOR_PIN) {
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ operatorId: "operator-1", loggedInAt: new Date().toISOString() })
      );
      navigation.replace("CommandCenterDashboard");
    } else {
      Alert.alert("Access denied", "Invalid operator PIN.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.card}>
        <Text style={styles.shield}>🛡️</Text>
        <Text style={styles.title}>Command Center</Text>
        <Text style={styles.subtitle}>Government operator access</Text>

        <TextInput
          style={styles.input}
          placeholder="Operator PIN"
          secureTextEntry
          keyboardType="number-pad"
          value={pin}
          onChangeText={setPin}
          maxLength={8}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading || !pin}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Enter Command Center"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back to app</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001F3F",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  shield: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 24 },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#001F3F",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  back: { color: "#64748B", fontSize: 14 },
});
