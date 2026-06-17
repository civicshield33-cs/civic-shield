import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { getFirebaseAuth, getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { clearFirebaseWebPersistence } from "./authRecovery";
import {
  loadUserProfileFromFirestore,
  saveUserProfileToFirestore,
} from "./userProfileService";
import {
  AppUser,
  clearStoredUser,
  getStoredUser,
  login as localLogin,
  normalizeEmail,
  normalizePhone,
  saveUser,
} from "../utils/auth";

function phoneToEmail(phone: string) {
  const digits = normalizePhone(phone).replace(/\D/g, "");
  return `${digits}@civicshield.gm`;
}

export function resolveAuthEmail(user: Pick<AppUser, "email" | "phone" | "authEmail">) {
  if (user.authEmail?.trim()) return normalizeEmail(user.authEmail);
  if (user.email?.trim()) return normalizeEmail(user.email);
  return phoneToEmail(user.phone);
}

function mapFirebaseError(error: any): string {
  const code = error?.code || "";
  if (code === "auth/email-already-in-use") {
    return "This email is already registered. Please sign in instead.";
  }
  if (code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }
  if (code === "auth/weak-password") {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (code === "permission-denied") {
    return "Cloud database blocked the save. Deploy Firestore rules (see firestore.rules).";
  }
  return error?.message || "Could not create cloud account.";
}

function mapLoginFirebaseError(error: any): string {
  const code = error?.code || "";
  if (code === "auth/user-not-found") {
    return "No account found with this email and password.";
  }
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Incorrect email or password.";
  }
  if (code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please try again later.";
  }
  return "Sign in failed. Check your email and password.";
}

export type RegisterResult =
  | { ok: true; user: AppUser; warning?: string }
  | { ok: false; message: string };

export async function registerAccount(user: AppUser): Promise<RegisterResult> {
  const authEmail = resolveAuthEmail(user);
  const userRecord: AppUser = {
    ...user,
    email: user.email?.trim() ? normalizeEmail(user.email) : authEmail,
    authEmail,
  };

  if (!isFirebaseConfigured()) {
    await saveUser(userRecord);
    return { ok: true, user: userRecord };
  }

  const auth = getFirebaseAuth();
  const db = getFirestoreDb();
  if (!auth || !db) {
    await saveUser(userRecord);
    return { ok: true, user: userRecord };
  }

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      authEmail,
      user.password
    );

    await updateProfile(credential.user, {
      displayName: user.fullName,
    });

    const savedUser: AppUser = {
      ...userRecord,
      uid: credential.user.uid,
    };

    // Always save locally first so Settings/Home work even if Firestore fails
    await saveUser(savedUser);

    try {
      await saveUserProfileToFirestore(savedUser, credential.user.uid);
      return { ok: true, user: savedUser };
    } catch (firestoreError: any) {
      return {
        ok: true,
        user: savedUser,
        warning:
          firestoreError?.code === "permission-denied"
            ? "Account created. Profile not saved to cloud yet — publish Firestore rules in Firebase Console."
            : "Account created locally. Cloud profile sync failed — try signing in again.",
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      message: mapFirebaseError(error),
    };
  }
}

export async function syncUserProfileAfterLogin(user: AppUser) {
  if (!isFirebaseConfigured()) return;

  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid || user.uid;
  if (!auth || !uid) return;

  try {
    await saveUserProfileToFirestore({ ...user, uid }, uid);
    if (!user.uid) {
      await saveUser({ ...user, uid });
    }
  } catch {
    // Non-blocking — local profile still works
  }
}

export async function loginAccount(identifier: string, password: string) {
  const trimmed = identifier.trim();
  const isEmail = trimmed.includes("@");

  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (auth) {
      const stored = await getStoredUser();
      const candidates = isEmail
        ? [normalizeEmail(trimmed)]
        : [
            stored ? resolveAuthEmail(stored) : "",
            phoneToEmail(trimmed),
          ].filter(Boolean);

      const authEmails = [...new Set(candidates)];
      let lastError: any = null;

      for (const authEmail of authEmails) {
        try {
          await signInWithEmailAndPassword(auth, authEmail, password);
          const uid = auth.currentUser?.uid;
          if (!uid) {
            return { ok: false as const, message: "Sign in failed. Please try again." };
          }

          const profile = await loadUserProfileFromFirestore(uid);

          const user: AppUser = profile
            ? {
                fullName: profile.fullName,
                phone: profile.phone,
                email: profile.email,
                nationalId: profile.nationalId,
                password,
                createdAt: profile.createdAt,
                uid,
                authEmail: profile.authEmail || authEmail,
              }
            : stored
              ? {
                  ...stored,
                  uid,
                  authEmail,
                }
              : {
                  fullName: auth.currentUser?.displayName || "User",
                  phone: isEmail ? "" : trimmed,
                  email: isEmail ? normalizeEmail(trimmed) : authEmail,
                  nationalId: "",
                  password,
                  createdAt: new Date().toISOString(),
                  uid,
                  authEmail,
                };

          await saveUser(user);
          await syncUserProfileAfterLogin(user);

          return { ok: true as const, user };
        } catch (error: any) {
          lastError = error;
          const code = error?.code || "";
          if (
            code === "auth/wrong-password" ||
            code === "auth/invalid-credential"
          ) {
            return { ok: false as const, message: mapLoginFirebaseError(error) };
          }
        }
      }

      if (lastError?.code === "auth/user-not-found" && isEmail) {
        return { ok: false as const, message: mapLoginFirebaseError(lastError) };
      }

      await signOut(auth).catch(() => undefined);
    }
  }

  return localLogin(trimmed, password);
}

export async function getCurrentUserId() {
  const user = await getStoredUser();
  if (!user) return "guest";

  const auth = getFirebaseAuth();
  if (auth?.currentUser?.uid) return auth.currentUser.uid;

  if (user.uid) return user.uid;

  return normalizePhone(user.phone).replace(/\D/g, "") || "local-user";
}

export async function logoutAccount() {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth).catch(() => undefined);
  await clearStoredUser();
  await clearFirebaseWebPersistence();
}
