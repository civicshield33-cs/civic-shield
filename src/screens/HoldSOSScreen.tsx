import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
} from "react-native";

import SOSButton from "../components/SOSButton";
import { useSOSStore } from "../store/sosStore";

export default function HoldSOSScreen({ navigation }: any) {
  const { width } = useWindowDimensions();

  const triggerSOS = () => {
    Vibration.vibrate([200, 200, 200]);
    useSOSStore.getState().activate();
    useSOSStore.getState().setCountdown(15);
    navigation.replace("Emergency");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>EMERGENCY</Text>
        <Text style={styles.title}>Send SOS</Text>

        <Text style={styles.subtitle}>
          Tap & hold the button for 3 seconds.{"\n"}Release early to cancel.
        </Text>

        <SOSButton
          size={Math.min(width * 0.68, 280)}
          onActivate={triggerSOS}
        />
      </View>

      <Text style={styles.footer}>Help is dispatched after activation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7F1D1D",
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  backArrow: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  eyebrow: {
    color: "#FECACA",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    color: "#FEE2E2",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 36,
  },

  footer: {
    color: "#FECACA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 24,
  },
});
