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

function hasBundledFirebaseConfig() {
  const configPath = path.join(process.cwd(), "src/config/firebase.public.ts");
  if (!fs.existsSync(configPath)) return false;

  const content = fs.readFileSync(configPath, "utf8");
  const hasApiKey = /apiKey:\s*["'][^"']+["']/.test(content);
  const hasProjectId = /projectId:\s*["'][^"']+["']/.test(content);
  return hasApiKey && hasProjectId;
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
  if (hasBundledFirebaseConfig()) {
    console.warn(
      "\n[Civic Shield] Firebase env vars not set for this build.\n" +
        "Using bundled config from src/config/firebase.public.ts.\n" +
        "Optional: add EXPO_PUBLIC_FIREBASE_* in Cloudflare Pages to override.\n"
    );
  } else {
    console.error(
      "\n[Civic Shield] Firebase env vars missing for web build:\n" +
        missing.map((key) => `  - ${key}`).join("\n") +
        "\n\nAdd them in Cloudflare Pages → Settings → Environment variables (Production),\n" +
        "or commit src/config/firebase.public.ts. See .env.example for names.\n"
    );

    if (process.env.CI || process.env.CF_PAGES === "1") {
      process.exit(1);
    }
  }
}
