import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "./AppTabBar";
import HomeScreen from "../screens/HomeScreen";
import CommunityAlertsScreen from "../screens/CommunityAlertsScreen";
import SafeWalkScreen from "../screens/SafeWalkScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={CommunityAlertsScreen}
        options={{ tabBarLabel: "Alerts" }}
      />
      <Tab.Screen
        name="SafeWalkTab"
        component={SafeWalkScreen}
        options={{ tabBarLabel: "Safe Walk" }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: "Settings" }}
      />
    </Tab.Navigator>
  );
}
