import { Platform } from "react-native";
import { getStoredUser } from "../utils/auth";
import {
  loadUserProfileFromFirestore,
  saveUserProfileToFirestore,
} from "./userProfileService";
import { FIREBASE_PUBLIC_CONFIG } from "../config/firebase.public";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import { signOut } from "firebase/auth";

/**
 * Clears orphaned Firebase web sessions that cause accounts:lookup 400 errors
 * when IndexedDB has an invalid/expired token but no local app user.
 */
export async function clearFirebaseWebPersistence() {
  if (Platform.OS !== "web" || typeof indexedDB === "undefined") return;

  const apiKey =
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ||
    FIREBASE_PUBLIC_CONFIG.apiKey;

  const dbNames = [
    "firebaseLocalStorageDb",
    `firebase:authUser:${apiKey}:[DEFAULT]`,
  ];

  await Promise.all(
    dbNames.map(
      (name) =>
        new Promise<void>((resolve) => {
          try {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
            req.onblocked = () => resolve();
          } catch {
            resolve();
          }
        })
    )
  );
}

export async function clearStaleFirebaseWebSession() {
  if (Platform.OS !== "web" || typeof indexedDB === "undefined") return;

  const localUser = await getStoredUser();
  if (localUser) return;

  await clearFirebaseWebPersistence();
}

export async function syncFirebaseAuthSession() {
  if (!isFirebaseConfigured()) return;

  await clearStaleFirebaseWebSession();

  const auth = getFirebaseAuth();
  if (!auth) return;

  const localUser = await getStoredUser();

  try {
    await auth.authStateReady();
  } catch {
    await signOut(auth).catch(() => undefined);
    return;
  }

  const firebaseUser = auth.currentUser;

  // Firebase session exists but app has no local account — sign out stale session
  if (firebaseUser && !localUser) {
    await signOut(auth).catch(() => undefined);
    return;
  }

  // Validate token when both sessions exist (ignore transient network errors)
  if (firebaseUser && localUser) {
    try {
      await firebaseUser.getIdToken(false);
    } catch (error: any) {
      const code = error?.code || "";
      if (
        code === "auth/user-token-expired" ||
        code === "auth/invalid-user-token" ||
        code === "auth/user-disabled"
      ) {
        await signOut(auth).catch(() => undefined);
      }
    }
  }
}

export async function syncMissingUserProfile() {
  if (!isFirebaseConfigured()) return;

  const localUser = await getStoredUser();
  if (!localUser?.uid) return;

  const auth = getFirebaseAuth();
  if (!auth) return;

  try {
    await auth.authStateReady();
  } catch {
    return;
  }

  if (!auth.currentUser?.uid) return;

  try {
    const existing = await loadUserProfileFromFirestore(auth.currentUser.uid);
    if (!existing) {
      await saveUserProfileToFirestore(
        { ...localUser, uid: auth.currentUser.uid },
        auth.currentUser.uid
      );
    }
  } catch {
    // Non-blocking — will retry on next app open.
  }
}
