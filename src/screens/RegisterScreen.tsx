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
import { saveUser } from "../utils/auth";

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Missing Phone Number", "Please enter your phone number.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Missing Password", "Please create a password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const userData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        password,
        createdAt: new Date().toISOString(),
      };

      await saveUser(userData);

      Alert.alert(
        "Success",
        "Account created successfully",
        [
          {
            text: "Continue",
            onPress: () => navigation.replace("Contacts"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#001F3F"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Create Account
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <AppInput
          label="Phone Number"
          placeholder="+220 7907926"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <AppInput
          label="National ID"
          placeholder="Enter your National ID"
          value={nationalId}
          onChangeText={setNationalId}
        />

        <AppInput
          label="Password"
          placeholder="Create a strong password"
          secure
          value={password}
          onChangeText={setPassword}
        />

        {/* LOGIN SECTION */}
        <View style={styles.loginContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() =>
              navigation.navigate("Login")
            }
          >
            <Text style={styles.loginButtonText}>
              Login to Your Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* REGISTER BUTTON */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={
            loading
              ? "Creating Account..."
              : "Continue"
          }
          onPress={handleRegister}
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

  loginContainer: {
    marginTop: 30,
    alignItems: "center",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  dividerText: {
    marginHorizontal: 12,
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },

  loginText: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 12,
  },

  loginButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#001F3F",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  loginButtonText: {
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