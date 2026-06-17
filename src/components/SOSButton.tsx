import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Vibration,
} from "react-native";

import { COLORS } from "../theme/colors";

type Props = {
  onActivate: () => void;
  holdSeconds?: number;
  size?: number;
};

export default function SOSButton({
  onActivate,
  holdSeconds = 3,
  size = 200,
}: Props) {
  const [holding, setHolding] = useState(false);
  const [countdown, setCountdown] = useState(holdSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (holding) return;

    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.65,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    scaleLoop.start();
    glowLoop.start();

    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [holding, pulse, glow]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startHold = () => {
    setHolding(true);
    setCountdown(holdSeconds);
    Vibration.vibrate(50);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          setHolding(false);
          Vibration.vibrate([120, 80, 200]);
          onActivate();
          return holdSeconds;
        }
        Vibration.vibrate(30);
        return prev - 1;
      });
    }, 1000);
  };

  const cancelHold = () => {
    if (!holding) return;
    setHolding(false);
    clearTimer();
    setCountdown(holdSeconds);
  };

  const ringSize = size + 28;

  return (
    <View
      style={[styles.wrap, { width: ringSize, height: ringSize }]}
      accessibilityRole="button"
      accessibilityLabel={`Emergency SOS. Tap and hold for ${holdSeconds} seconds to activate.`}
      accessibilityHint="Release before the countdown ends to cancel."
    >
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            opacity: glow,
            transform: [{ scale: pulse }],
          },
        ]}
      />

      <Pressable
        onPressIn={startHold}
        onPressOut={cancelHold}
        style={({ pressed }) => [
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          holding && styles.buttonHolding,
          pressed && !holding && styles.buttonPressed,
        ]}
      >
        <View
          style={[
            styles.buttonCore,
            {
              width: size - 16,
              height: size - 16,
              borderRadius: (size - 16) / 2,
            },
          ]}
        >
          {holding ? (
            <>
              <Text style={[styles.countdown, { fontSize: size * 0.34 }]}>
                {countdown}
              </Text>
              <Text style={styles.holdingText}>Keep holding</Text>
            </>
          ) : (
            <>
              <Text style={[styles.sos, { fontSize: size * 0.19 }]}>SOS</Text>
              <Text style={styles.holdHint}>Tap & Hold</Text>
            </>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  pulseRing: {
    position: "absolute",
    backgroundColor: "#FCA5A5",
  },

  button: {
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },

  buttonHolding: {
    backgroundColor: "#FECACA",
    transform: [{ scale: 1.04 }],
  },

  buttonCore: {
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  sos: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: 2,
  },

  holdHint: {
    color: "rgba(255,255,255,0.95)",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  countdown: {
    color: "#FFFFFF",
    fontWeight: "900",
    lineHeight: undefined,
  },

  holdingText: {
    color: "rgba(255,255,255,0.95)",
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
  },
});
