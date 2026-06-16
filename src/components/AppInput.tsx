import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";

import { COLORS } from "../theme/colors";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
};

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType = "default",
  required = false,
  optional = false,
  error,
  hint,
}: Props) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.required}>*</Text> : null}
        {optional ? <Text style={styles.optional}>Optional</Text> : null}
      </View>

      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  required: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "700",
  },

  optional: {
    marginLeft: "auto",
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    color: COLORS.text,
  },

  inputFocused: {
    borderColor: COLORS.buttonBlue,
    backgroundColor: "#F8FAFF",
  },

  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: "#FEF2F2",
  },

  error: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: "500",
  },

  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
});
