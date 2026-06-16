import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import WelcomeScreen from "../screens/WelcomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ContactsScreen from "../screens/ContactsScreen";
import HomeScreen from "../screens/HomeScreen";
import CommunityAlertsScreen from "../screens/CommunityAlertsScreen";
import SafeWalkScreen from "../screens/SafeWalkScreen";
import SettingsScreen from "../screens/SettingsScreen";
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

// Report Screens
import FireReportScreen from "../screens/FireReportScreen";
import FloodReportScreen from "../screens/FloodReportScreen";
import CrimeReportScreen from "../screens/CrimeReportScreen";
import AccidentReportScreen from "../screens/AccidentReportScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />

        {/* Main User App */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CommunityAlerts" component={CommunityAlertsScreen} />
        <Stack.Screen name="SafeWalk" component={SafeWalkScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* Emergency Flow */}
        <Stack.Screen name="HoldSOS" component={HoldSOSScreen} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />

        {/* Reports */}
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

        {/* Admin Dashboard */}
        <Stack.Screen 
          name="CommandCenterDashboard" 
          component={CommandCenterDashboard}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}