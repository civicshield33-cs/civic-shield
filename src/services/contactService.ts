import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EmergencyContact } from "../types/emergency";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { getCurrentUserId } from "./authService";

const STORAGE_KEY = "EMERGENCY_CONTACTS";

export async function getLocalContacts(): Promise<EmergencyContact[]> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export async function saveLocalContacts(contacts: EmergencyContact[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

async function getUserStorageId() {
  const userId = await getCurrentUserId();
  return userId === "guest" ? null : userId;
}

export async function syncContactsToCloud(contacts: EmergencyContact[]) {
  await saveLocalContacts(contacts);

  if (!isFirebaseConfigured()) return;

  const db = getFirestoreDb();
  const userId = await getUserStorageId();
  if (!db || !userId) return;

  const existing = await getDocs(collection(db, "users", userId, "contacts"));
  await Promise.all(
    existing.docs.map((snap) =>
      deleteDoc(doc(db, "users", userId, "contacts", snap.id))
    )
  );

  await Promise.all(
    contacts.map((contact) =>
      setDoc(doc(db, "users", userId, "contacts", contact.id), contact)
    )
  );
}

export async function loadContactsFromCloud(): Promise<EmergencyContact[]> {
  const local = await getLocalContacts();
  if (!isFirebaseConfigured()) return local;

  const db = getFirestoreDb();
  const userId = await getUserStorageId();
  if (!db || !userId) return local;

  const snap = await getDocs(collection(db, "users", userId, "contacts"));
  if (snap.empty) return local;

  const contacts = snap.docs.map((d) => d.data() as EmergencyContact);
  await saveLocalContacts(contacts);
  return contacts;
}
