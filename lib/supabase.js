// lib/supabase.js

// 1) MUST be first in RN
try { require("react-native-url-polyfill/auto"); } catch (_) {}

// 2) Imports
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
// Optional: persist auth sessions reliably on RN
import AsyncStorage from "@react-native-async-storage/async-storage";

// 3) Read config from Expo extra (works in dev + EAS builds)
const extra =
  (Constants?.expoConfig?.extra) ??
  (Constants?.manifest?.extra) ??
  {};

// Accept BOTH naming styles (UPPERCASE & camelCase)
let SUPABASE_URL = extra.SUPABASE_URL || extra.supabaseUrl || process.env.SUPABASE_URL;
let SUPABASE_ANON_KEY = extra.SUPABASE_ANON_KEY || extra.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;

// Normalize URL (remove trailing slash)
if (typeof SUPABASE_URL === "string") {
  SUPABASE_URL = SUPABASE_URL.replace(/\/+$/, "");
}

// 4) Helpers
const isValidUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

// 5) Create client (or a guarded mock if misconfigured)
let supabase;

if (!isValidUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY) {
  console.error(
    "[supabase] Invalid or missing SUPABASE_URL / SUPABASE_ANON_KEY.\n" +
      "Set them in app.config.js (extra) or .env mapped into extra.\n" +
      'Example extra: { "SUPABASE_URL": "https://<project>.supabase.co", "SUPABASE_ANON_KEY": "<anon-key>" }'
  );
  const thrower = () => {
    throw new Error(
      "Supabase not configured: set SUPABASE_URL and SUPABASE_ANON_KEY in app config."
    );
  };
  supabase = { auth: { signUp: thrower, signInWithPassword: thrower, signOut: thrower } };
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: AsyncStorage, // ensure sessions persist on device
    },
  });
}

// 6) Debug: log what we actually resolved at runtime (masked)
try {
  const maskedUrl = SUPABASE_URL
    ? SUPABASE_URL.replace(/(^https?:\/\/)[^./]+/i, "$1***")
    : SUPABASE_URL;
  console.log("[supabase] URL:", maskedUrl || "<missing>");
  console.log("[supabase] KEY present:", !!SUPABASE_ANON_KEY);
} catch {}

// 7) Simple reachability probe
export async function testConnection(timeoutMs = 8000) {
  if (!isValidUrl(SUPABASE_URL)) throw new Error("Invalid SUPABASE_URL");
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const id = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetch(SUPABASE_URL, { method: "GET", signal: ctrl?.signal });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    throw new Error(err?.message || "Network request failed");
  } finally {
    if (id) clearTimeout(id);
  }
}

export { supabase };
export default supabase;
