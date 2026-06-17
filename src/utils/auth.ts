import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_KEY = "APP_USER";

export type AppUser = {
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  password: string;
  createdAt: string;
  uid?: string;
  /** Email used for Firebase Auth sign-in */
  authEmail?: string;
};

export function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function userMatchesIdentifier(user: AppUser, identifier: string) {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    const email = normalizeEmail(trimmed);
    return (
      normalizeEmail(user.email) === email ||
      (user.authEmail ? normalizeEmail(user.authEmail) === email : false)
    );
  }

  return normalizePhone(user.phone) === normalizePhone(trimmed);
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

export async function clearStoredUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function login(
  identifier: string,
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

  if (!userMatchesIdentifier(user, identifier)) {
    return { ok: false, message: "Account not found." };
  }

  if (user.password !== password) {
    return { ok: false, message: "Incorrect password." };
  }

  return { ok: true, user };
}
