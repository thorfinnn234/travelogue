// app.config.js
import "dotenv/config";

export default ({ config }) => ({
  ...config,
  name: "Travelogue",
  slug: "travelogue",
  android: { package: "com.habee.travelogue", versionCode: 1 },
  extra: {
    // Map EAS secrets or .env into extra:
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    // (also keep your EAS projectId here)
    eas: { projectId: "27d49451-16b2-4884-920c-03f674d1ad02" },
  },
});
