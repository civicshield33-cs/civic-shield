import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OperatorLoginScreen, {
  isOperatorLoggedIn,
} from "../screens/OperatorLoginScreen";
import CommandCenterDashboard from "../screens/CommandCenterDashboard";
import IncidentFeedScreen from "../screens/IncidentFeedScreen";
import LiveMapScreen from "../screens/LiveMapScreen";
import UnitsStatusScreen from "../screens/UnitsStatusScreen";
import IncidentDetailScreen from "../screens/IncidentDetailScreen";
import OverviewScreen from "../screens/OverviewScreen";

const Stack = createNativeStackNavigator();

export default function AdminWebNavigator() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    isOperatorLoggedIn().then((ok) => {
      setLoggedIn(ok);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={loggedIn ? "CommandCenterDashboard" : "OperatorLogin"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="OperatorLogin" component={OperatorLoginScreen} />
        <Stack.Screen
          name="CommandCenterDashboard"
          component={CommandCenterDashboard}
        />
        <Stack.Screen name="IncidentFeed" component={IncidentFeedScreen} />
        <Stack.Screen name="LiveMap" component={LiveMapScreen} />
        <Stack.Screen name="UnitsStatus" component={UnitsStatusScreen} />
        <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
        <Stack.Screen name="Overview" component={OverviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
