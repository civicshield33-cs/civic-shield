import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

export default function WelcomeScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions();

  const titleSize = width > 400 ? 44 : width > 360 ? 40 : 36;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1519501025264-65ba15a82390",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        {/* CONTENT WRAPPER */}
        <View style={styles.content}>
          {/* LOGO */}
          <View style={styles.logoContainer}>
            <View style={styles.shieldContainer}>
              <Text style={styles.shield}>🛡️</Text>
            </View>
          </View>

          {/* TEXT */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { fontSize: titleSize }]}>
              CIVIC SHIELD
            </Text>

            <Text style={styles.subtitle}>
              Protecting Communities{"\n"}Across The Gambia
            </Text>
          </View>
        </View>

        {/* BUTTON */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

/* =========================
STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 31, 63, 0.85)",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  logoContainer: {
    marginBottom: 25,
  },

  shieldContainer: {
    width: 140,
    height: 140,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },

  shield: {
    fontSize: 80,
  },

  textContainer: {
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1.5,
  },

  subtitle: {
    color: "#E0E7FF",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    marginTop: 12,
  },

  bottomContainer: {
    paddingBottom: 60,
    alignItems: "center",
  },

  getStartedButton: {
    backgroundColor: "#EF4444",
    width: "85%",
    maxWidth: 340,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  loginText: {
    color: "#E0E7FF",
    fontSize: 14,
  },

  loginBold: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
});