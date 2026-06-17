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
import { registerAccount } from "../services/authService";
import { showAlert } from "../utils/alert";
import { COLORS } from "../theme/colors";

type FieldErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

function validateForm(
  fullName: string,
  email: string,
  phone: string,
  password: string
): FieldErrors {
  const errors: FieldErrors = {};

  if (!fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!password.trim()) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
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

  const handleRegister = async () => {
    const errors = validateForm(fullName, email, phone, password);
    setFieldErrors(errors);
    setFormError("");

    if (Object.keys(errors).length > 0) {
      setFormError("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        password,
        createdAt: new Date().toISOString(),
      });

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      if (result.warning) {
        showAlert("Account created", result.warning);
      } else if (result.cloudSaved === false && !result.warning) {
        showAlert(
          "Account created",
          "Signed in locally. Cloud profile sync failed — sign out and sign in again, or check Firebase rules."
        );
      }

      navigation.replace("MainTabs");
    } catch {
      showAlert("Error", "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Join Civic Shield to protect your community
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
              label="Full Name"
              placeholder="e.g. Bakary Malang"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearFieldError("fullName");
              }}
              required
              error={fieldErrors.fullName}
            />

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
              hint="Used for your Firebase account and recovery"
            />

            <AppInput
              label="Phone Number"
              placeholder="+220 7907926"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                clearFieldError("phone");
              }}
              required
              error={fieldErrors.phone}
              hint="Use the number you'll sign in with"
            />

            <AppInput
              label="National ID"
              placeholder="Enter your National ID"
              value={nationalId}
              onChangeText={setNationalId}
              optional
            />

            <AppInput
              label="Password"
              placeholder="Create a strong password"
              secure
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError("password");
              }}
              required
              error={fieldErrors.password}
              hint="Minimum 6 characters"
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={loading ? "Setting up your account..." : "Join Civic Shield"}
            onPress={handleRegister}
            disabled={loading}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Sign in</Text>
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

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },

  loginText: {
    fontSize: 15,
    color: "#64748B",
  },

  loginLink: {
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
