import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import AppInput from "../components/AppInput";
import PrimaryButton from "../components/PrimaryButton";
import { loginAccount } from "../services/authService";
import { showAlert } from "../utils/alert";
import { COLORS } from "../theme/colors";

type FieldErrors = {
  email?: string;
  password?: string;
};

function validateForm(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password.trim()) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError("");
  };

  const handleLogin = async () => {
    const errors = validateForm(email, password);
    setFieldErrors(errors);
    setFormError("");

    if (Object.keys(errors).length > 0) {
      setFormError("Please fix the highlighted fields to continue.");
      return;
    }

    try {
      setLoading(true);
      const result = await loginAccount(email, password);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      navigation.replace("MainTabs");
    } catch {
      showAlert("Error", "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Login</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to continue to Civic Shield
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your details</Text>
            <Text style={styles.requiredLegend}>
              Fields marked with <Text style={styles.requiredStar}>*</Text> are
              required
            </Text>

            {formError ? (
              <View style={styles.formErrorBanner}>
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            ) : null}

            <AppInput
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearFieldError("email");
              }}
              required
              error={fieldErrors.email}
            />

            <AppInput
              label="Password"
              placeholder="Enter your password"
              secure
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError("password");
              }}
              required
              error={fieldErrors.password}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={loading ? "Signing in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  flex: {
    flex: 1,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  headerTextWrap: {
    gap: 6,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 22,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  requiredLegend: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 18,
    lineHeight: 20,
  },

  requiredStar: {
    color: COLORS.danger,
    fontWeight: "700",
  },

  formErrorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  formErrorText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },

  registerText: {
    fontSize: 15,
    color: "#64748B",
  },

  registerLink: {
    fontSize: 15,
    color: COLORS.buttonBlue,
    fontWeight: "700",
  },

  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#F1F5F9",
  },
});
