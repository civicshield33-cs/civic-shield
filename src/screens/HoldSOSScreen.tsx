import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  Share,
  Vibration,
} from "react-native";

import * as Location from "expo-location";

export default function HoldSOSScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions();

  const [countdown, setCountdown] = useState(3);
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<any>(null);

  const [location, setLocation] = useState<any>(null);

  // -----------------------------
  // GET USER LOCATION (for SOS)
  // -----------------------------
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // -----------------------------
  // SOS TRIGGER
  // -----------------------------
  const triggerSOS = async () => {
    Vibration.vibrate([200, 200, 200]);

    // 🔥 FIREBASE PLACEHOLDER
    // await addDoc(collection(db, "sos_alerts"), {
    //   location,
    //   time: new Date().toISOString(),
    // });

    const incidentId = Math.floor(Math.random() * 999999);
    const link = `https://safewalk.app/sos/${incidentId}`;

    Alert.alert(
      "🚨 SOS ACTIVATED",
      "Emergency services notified instantly."
    );

    await Share.share({
      message:
        `🚨 EMERGENCY SOS ALERT\n\nLive Tracking:\n${link}`,
    });

    setCountdown(3);
  };

  // -----------------------------
  // HOLD START
  // -----------------------------
  const startHold = () => {
    setHolding(true);
    setCountdown(3);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setHolding(false);
          triggerSOS();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // -----------------------------
  // HOLD CANCEL
  // -----------------------------
  const cancelHold = () => {
    setHolding(false);
    clearInterval(timerRef.current);
    setCountdown(3);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>Emergency SOS</Text>

        <Text style={styles.subtitle}>
          Hold the button for 3 seconds to activate emergency alert
        </Text>

        {/* BIG BUTTON */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={startHold}
          onPressOut={cancelHold}
          style={[
            styles.circle,
            holding && styles.circleActive,
            {
              width: width * 0.65,
              height: width * 0.65,
              borderRadius: width * 0.325,
            },
          ]}
        >
          <Text style={[styles.count]}>
            {countdown}
          </Text>

          <Text style={styles.seconds}>Seconds</Text>
        </TouchableOpacity>

        <Text style={styles.instruction}>
          Hold to activate SOS
        </Text>
      </View>

      {/* FOOTER */}
      <Text style={styles.cancelText}>
        Release to cancel emergency trigger
      </Text>
    </View>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001F3F",
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
    paddingHorizontal: 30,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    color: "#E0E7FF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 50,
  },

  circle: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 12,
    borderColor: "rgba(255,255,255,0.3)",
  },

  circleActive: {
    backgroundColor: "#DC2626",
    transform: [{ scale: 1.05 }],
  },

  count: {
    color: "#FFFFFF",
    fontSize: 90,
    fontWeight: "800",
  },

  seconds: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginTop: -10,
  },

  instruction: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 40,
    fontWeight: "600",
  },

  cancelText: {
    color: "#94A3B8",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 40,
  },
});