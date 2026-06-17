import { signInAnonymously } from "firebase/auth";

import { getStoredUser } from "../utils/auth";
import { getFirebaseAuth } from "./firebase";

/** Firebase Auth uid when a session is active; null otherwise. */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  try {
    await auth.authStateReady();
  } catch {
    return null;
  }

  return auth.currentUser?.uid ?? null;
}

/**
 * Returns a Firebase Auth uid for Firestore writes.
 * Waits for persisted sessions to restore before falling back to anonymous auth.
 */
export async function ensureFirebaseAuth(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  try {
    await auth.authStateReady();
  } catch {
    return null;
  }

  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }

  const stored = await getStoredUser();
  if (stored?.uid || stored?.authEmail || stored?.email) {
    // Signed-in user but Firebase session not restored — don't replace with anonymous.
    return null;
  }

  try {
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  } catch {
    return null;
  }
}
