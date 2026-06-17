import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { AppUser, getStoredUser } from "../utils/auth";

export function useUserProfile() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const stored = await getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const firstName = user?.fullName?.trim().split(" ")[0] || "there";

  return {
    user,
    firstName,
    loading,
    refresh,
  };
}
