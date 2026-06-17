import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  Auth,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

import { FIREBASE_PUBLIC_CONFIG } from "../config/firebase.public";

type FirebaseEnvConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

function readExtraFirebaseConfig(): FirebaseEnvConfig {
  const extra = Constants.expoConfig?.extra as
    | { firebase?: FirebaseEnvConfig }
    | undefined;
  return extra?.firebase ?? {};
}

function resolveFirebaseConfig(): Required<FirebaseEnvConfig> {
  const extra = readExtraFirebaseConfig();

  return {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ||
      extra.apiKey?.trim() ||
      FIREBASE_PUBLIC_CONFIG.apiKey,
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
      extra.authDomain?.trim() ||
      FIREBASE_PUBLIC_CONFIG.authDomain,
    projectId:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
      extra.projectId?.trim() ||
      FIREBASE_PUBLIC_CONFIG.projectId,
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
      extra.storageBucket?.trim() ||
      FIREBASE_PUBLIC_CONFIG.storageBucket,
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ||
      extra.messagingSenderId?.trim() ||
      FIREBASE_PUBLIC_CONFIG.messagingSenderId,
    appId:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ||
      extra.appId?.trim() ||
      FIREBASE_PUBLIC_CONFIG.appId,
  };
}

const firebaseConfig = resolveFirebaseConfig();
let warnedMissingConfig = false;

function warnMissingFirebaseConfig() {
  if (warnedMissingConfig || isFirebaseConfigured()) return;
  warnedMissingConfig = true;

  if (Platform.OS !== "web" || typeof window === "undefined") return;

  const host = window.location.hostname;
  const isDeployedHost =
    host.endsWith(".pages.dev") || host.includes("civic-shield");

  if (!isDeployedHost) return;

  console.warn(
    "[Civic Shield] Using bundled Firebase config. For custom projects, set EXPO_PUBLIC_FIREBASE_* in Cloudflare Pages."
  );
}

export function getFirebaseConfigIssue(): string | null {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_KEY") {
    return "Missing Firebase API key";
  }
  if (!firebaseConfig.projectId) {
    return "Missing Firebase project ID";
  }
  if (!firebaseConfig.authDomain) {
    return "Missing Firebase auth domain";
  }
  return null;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfigIssue() === null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function createAuth(firebaseApp: FirebaseApp): Auth {
  try {
    if (Platform.OS === "web") {
      return initializeAuth(firebaseApp, {
        persistence: browserLocalPersistence,
      });
    }

    const { getReactNativePersistence } = require("firebase/auth");
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    if (error?.code === "auth/already-initialized") {
      return getAuth(firebaseApp);
    }
    throw error;
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  warnMissingFirebaseConfig();
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) auth = createAuth(firebaseApp);
  return auth;
}

export function getFirestoreDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) db = getFirestore(firebaseApp);
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!storage) storage = getStorage(firebaseApp);
  return storage;
}
