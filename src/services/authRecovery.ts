import { Platform } from "react-native";
import { getStoredUser } from "../utils/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import { signOut } from "firebase/auth";

/**
 * Clears orphaned Firebase web sessions that cause accounts:lookup 400 errors
 * when IndexedDB has an invalid/expired token but no local app user.
 */
export async function clearFirebaseWebPersistence() {
  if (Platform.OS !== "web" || typeof indexedDB === "undefined") return;

  const dbNames = [
    "firebaseLocalStorageDb",
    `firebase:authUser:${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}:[DEFAULT]`,
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

  // Validate token when both sessions exist
  if (firebaseUser && localUser) {
    try {
      await firebaseUser.getIdToken();
    } catch {
      await signOut(auth).catch(() => undefined);
    }
  }
}
