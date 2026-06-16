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
import { login } from "../utils/auth";

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert("Missing Phone Number", "Please enter your phone number.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Missing Password", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const result = await login(phone, password);

      if (!result.ok) {
        Alert.alert("Login Failed", result.message);
        return;
      }

      navigation.replace("Home");
    } catch {
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Sign in with the phone number and password you used to register.
        </Text>

        <AppInput
          label="Phone Number"
          placeholder="+220 7907926"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <AppInput
          label="Password"
          placeholder="Enter your password"
          secure
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={loading ? "Signing In..." : "Login"}
          onPress={handleLogin}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#001F3F",
    paddingTop: 70,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backArrow: {
    fontSize: 28,
    color: "#FFFFFF",
    marginRight: 12,
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },

  registerContainer: {
    marginTop: 30,
    alignItems: "center",
  },

  registerText: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 12,
  },

  registerButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#001F3F",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  registerButtonText: {
    color: "#001F3F",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonContainer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
});
