import 'dotenv/config';
import fs from 'fs';

// Load app.json so we can keep the existing config and only add `extra` values.
const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const expo = appJson.expo || {};

// Read SUPABASE values from environment or .env (dotenv already loaded)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

expo.extra = Object.assign({}, expo.extra || {}, {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
});

export default {
  expo,
};
