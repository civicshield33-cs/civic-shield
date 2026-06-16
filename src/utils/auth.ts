import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_KEY = "APP_USER";

export type AppUser = {
  fullName: string;
  phone: string;
  nationalId: string;
  password: string;
  createdAt: string;
};

export function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "");
}

export async function getStoredUser(): Promise<AppUser | null> {
  const saved = await AsyncStorage.getItem(USER_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as AppUser;
  } catch {
    return null;
  }
}

export async function saveUser(user: AppUser) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function login(
  phone: string,
  password: string
): Promise<
  { ok: true; user: AppUser } | { ok: false; message: string }
> {
  const user = await getStoredUser();

  if (!user) {
    return {
      ok: false,
      message: "No account found. Please create an account first.",
    };
  }

  if (!user.password) {
    return {
      ok: false,
      message:
        "Your account needs to be set up again. Please create a new account.",
    };
  }

  if (normalizePhone(user.phone) !== normalizePhone(phone)) {
    return { ok: false, message: "Phone number not found." };
  }

  if (user.password !== password) {
    return { ok: false, message: "Incorrect password." };
  }

  return { ok: true, user };
}
