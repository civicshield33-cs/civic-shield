import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../theme/colors";

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  HomeTab: { active: "home", inactive: "home-outline" },
  CommunityTab: { active: "people", inactive: "people-outline" },
  SafeWalkTab: { active: "walk", inactive: "walk-outline" },
  SettingsTab: { active: "settings", inactive: "settings-outline" },
};

export default function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        if (options.tabBarButton != null) {
          return null;
        }

        const label =
          options.tabBarLabel !== undefined
            ? String(options.tabBarLabel)
            : options.title ?? route.name;

        const isFocused = state.index === index;
        const icons = TAB_ICONS[route.name] ?? TAB_ICONS.HomeTab;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.navItem}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconWrap, isFocused && styles.navIconWrapActive]}>
              <Ionicons
                name={isFocused ? icons.active : icons.inactive}
                size={20}
                color={isFocused ? COLORS.buttonBlue : "#94A3B8"}
              />
            </View>
            <Text style={[styles.navText, isFocused && styles.navTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },

  navItem: {
    alignItems: "center",
    minWidth: 64,
  },

  navIconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  navIconWrapActive: {
    backgroundColor: "#EFF6FF",
  },

  navText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },

  navTextActive: {
    color: COLORS.buttonBlue,
    fontWeight: "700",
  },
});
