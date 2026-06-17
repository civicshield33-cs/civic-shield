import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { getFirebaseAuth, getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { saveUserProfileToFirestore } from "./userProfileService";
import {
  AppUser,
  getStoredUser,
  login as localLogin,
  normalizePhone,
  saveUser,
} from "../utils/auth";

function phoneToEmail(phone: string) {
  const digits = normalizePhone(phone).replace(/\D/g, "");
  return `${digits}@civicshield.gm`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

export async function loginAccount(phone: string, password: string) {
  const localResult = await localLogin(phone, password);
  if (!localResult.ok) return localResult;

  if (!isFirebaseConfigured()) {
    return localResult;
  }

  const auth = getFirebaseAuth();
  if (!auth) return localResult;

  const candidates = [
    resolveAuthEmail(localResult.user),
    phoneToEmail(phone),
  ].filter((email, index, list) => list.indexOf(email) === index);

  for (const authEmail of candidates) {
    try {
      await signInWithEmailAndPassword(auth, authEmail, password);

      const updatedUser: AppUser = {
        ...localResult.user,
        authEmail,
        uid: auth.currentUser?.uid || localResult.user.uid,
      };

      await saveUser(updatedUser);
      await syncUserProfileAfterLogin(updatedUser);

      return { ok: true as const, user: updatedUser };
    } catch {
      // try next candidate
    }
  }

  await signOut(auth).catch(() => undefined);
  return localResult;
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
}
