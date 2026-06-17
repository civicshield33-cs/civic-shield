import fs from "node:fs";
import path from "node:path";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const required = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
];

const missing = required.filter((key) => {
  const value = process.env[key]?.trim();
  return !value || value === "YOUR_KEY";
});

if (missing.length > 0) {
  console.error(
    "\n[Civic Shield] Firebase env vars missing for web build:\n" +
      missing.map((key) => `  - ${key}`).join("\n") +
      "\n\nAdd them in Cloudflare Pages → Settings → Environment variables (Production),\n" +
      "then trigger a new deployment. See .env.example for names.\n"
  );

  if (process.env.CI || process.env.CF_PAGES === "1") {
    process.exit(1);
  }
}
