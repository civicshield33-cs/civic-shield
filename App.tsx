import "react-native-gesture-handler";
import React, { useEffect } from "react";

import AppNavigator from "./src/navigation/AppNavigator";
import { useContactStore } from "./src/store/contactStore";

export default function App() {
  const loadContacts = useContactStore((state) => state.loadContacts);

  useEffect(() => {
    // 🔥 ensures all screens have latest emergency contacts immediately
    loadContacts();
  }, []);

  return <AppNavigator />;
}