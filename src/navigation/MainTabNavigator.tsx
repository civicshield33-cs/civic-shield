import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "./AppTabBar";
import HomeScreen from "../screens/HomeScreen";
import CommunityAlertsScreen from "../screens/CommunityAlertsScreen";
import SafeWalkScreen from "../screens/SafeWalkScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TrackingScreen from "../screens/TrackingScreen";

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
        name="CommunityTab"
        component={CommunityAlertsScreen}
        options={{ tabBarLabel: "Community" }}
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
      <Tab.Screen
        name="TrackingTab"
        component={TrackingScreen}
        options={{
          tabBarLabel: "Tracking",
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}
