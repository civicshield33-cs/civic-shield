/**
 * Firebase — project: civic-shield-1cfc4
 *
 * Config is loaded from environment variables (see .env / Cloudflare Pages).
 * All app code should use src/services/firebase.ts — not this file directly.
 */
export {
  isFirebaseConfigured,
  getFirebaseApp,
  getFirebaseAuth,
  getFirestoreDb,
  getFirebaseStorage,
} from "./src/services/firebase";
