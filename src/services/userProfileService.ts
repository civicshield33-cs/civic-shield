import { doc, setDoc } from "firebase/firestore";

import { getFirestoreDb } from "./firebase";
import { AppUser } from "../utils/auth";

export type UserProfile = {
  fullName: string;
  phone: string;
  email: string;
  authEmail: string;
  nationalId: string;
  createdAt: string;
  uid: string;
  updatedAt: string;
};

export function buildUserProfile(user: AppUser, uid: string): UserProfile {
  return {
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    authEmail: user.authEmail || user.email,
    nationalId: user.nationalId || "",
    createdAt: user.createdAt,
    uid,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveUserProfileToFirestore(user: AppUser, uid: string) {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not available.");
  }

  const profile = buildUserProfile(user, uid);
  await setDoc(doc(db, "users", uid), profile, { merge: true });
  return profile;
}
