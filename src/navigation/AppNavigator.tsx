import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "./MainTabNavigator";
import SafetyTriggerProvider from "../components/SafetyTriggerProvider";
import WelcomeScreen from "../screens/WelcomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import ContactsScreen from "../screens/ContactsScreen";
import CommandCenterDashboard from "../screens/CommandCenterDashboard";
import HoldSOSScreen from "../screens/HoldSOSScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import TrackingScreen from "../screens/TrackingScreen";
import ReportIncidentScreen from "../screens/ReportIncidentScreen";
import MissingPersonScreen from "../screens/MissingPersonScreen";
import OverviewScreen from "../screens/OverviewScreen";
import LiveMapScreen from "../screens/LiveMapScreen";
import IncidentFeedScreen from "../screens/IncidentFeedScreen";
import UnitsStatusScreen from "../screens/UnitsStatusScreen";
import FireReportScreen from "../screens/FireReportScreen";
import FloodReportScreen from "../screens/FloodReportScreen";
import CrimeReportScreen from "../screens/CrimeReportScreen";
import AccidentReportScreen from "../screens/AccidentReportScreen";
import OperatorLoginScreen from "../screens/OperatorLoginScreen";
import IncidentDetailScreen from "../screens/IncidentDetailScreen";
import TouristSafetyScreen from "../screens/TouristSafetyScreen";
import FloodAlertsScreen from "../screens/FloodAlertsScreen";
import EmergencyPhrasesScreen from "../screens/EmergencyPhrasesScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import { isOnboardingComplete } from "../services/gambiaService";
import { useSettingsStore } from "../store/settingsStore";

const Stack = createNativeStackNavigator();

function AppStack() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    isOnboardingComplete().then((done) => {
      setInitialRoute(done ? "Welcome" : "Onboarding");
    });
  }, [loadSettings]);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="HoldSOS" component={HoldSOSScreen} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} />
      <Stack.Screen name="MissingPerson" component={MissingPersonScreen} />
      <Stack.Screen name="FireReport" component={FireReportScreen} />
      <Stack.Screen name="FloodReport" component={FloodReportScreen} />
      <Stack.Screen name="CrimeReport" component={CrimeReportScreen} />
      <Stack.Screen name="AccidentReport" component={AccidentReportScreen} />
      <Stack.Screen name="Overview" component={OverviewScreen} />
      <Stack.Screen name="LiveMap" component={LiveMapScreen} />
      <Stack.Screen name="IncidentFeed" component={IncidentFeedScreen} />
      <Stack.Screen name="UnitsStatus" component={UnitsStatusScreen} />
      <Stack.Screen name="OperatorLogin" component={OperatorLoginScreen} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
      <Stack.Screen name="TouristSafety" component={TouristSafetyScreen} />
      <Stack.Screen name="FloodAlerts" component={FloodAlertsScreen} />
      <Stack.Screen name="EmergencyPhrases" component={EmergencyPhrasesScreen} />
      <Stack.Screen
        name="CommandCenterDashboard"
        component={CommandCenterDashboard}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <SafetyTriggerProvider>
        <AppStack />
      </SafetyTriggerProvider>
    </NavigationContainer>
  );
}
