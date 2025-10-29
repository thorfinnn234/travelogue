// For React Native (Expo) we need a URL polyfill before importing Supabase
// Install: react-native-url-polyfill
try {
	require('react-native-url-polyfill/auto');
} catch (e) {
	// ignore if not available — developer should install the package
}

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Provide your Supabase URL and ANON KEY via environment variables or replace
// the fallbacks below with the real values for development.
// Attempt to read values from multiple places:
// 1) process.env (when using build-time env injection)
// 2) Expo app config extra (app.json / app.config.js -> extra)
const expoExtra = (Constants && (Constants.expoConfig || Constants.manifest) && (Constants.expoConfig || Constants.manifest).extra) || {};
const SUPABASE_URL = process.env.SUPABASE_URL || expoExtra.SUPABASE_URL || 'REPLACE_WITH_YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || expoExtra.SUPABASE_ANON_KEY || 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';

// Validate URL to provide a friendly error message instead of the generic
// "Invalid supabaseUrl" thrown by the client.
const isValidUrl = (u) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'));

let supabase;
if (!isValidUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('REPLACE_WITH_YOUR')) {
	// Export a mock object where common auth methods are functions that throw
	// a clear, actionable error instead of leaving properties undefined.
	console.error('[supabase] Invalid or missing SUPABASE_URL / SUPABASE_ANON_KEY.\n' +
		'Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env, or add them to app.json extra (expo).\n' +
		'Example (app.json):\n' +
		`"extra": { "SUPABASE_URL": "https://<project>.supabase.co", "SUPABASE_ANON_KEY": "<anon-key>" }`
	);

	const thrower = () => { throw new Error('Supabase not configured: set SUPABASE_URL and SUPABASE_ANON_KEY in .env or app.json extra.'); };
	const authMock = {
		signUp: thrower,
		signInWithPassword: thrower,
		signOut: thrower,
		// Add other commonly used methods if needed
	};
	supabase = { auth: authMock };
} else {
	supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

	// Debug: print a short masked URL so developers can see what is being used.
	try {
		console.log('[supabase] configured URL:', SUPABASE_URL && SUPABASE_URL.slice(0, 60) + (SUPABASE_URL.length > 60 ? '...' : ''));
	} catch (e) {
		// ignore
	}

	/**
	 * testConnection: performs a simple fetch to the Supabase URL to verify network reachability.
	 * Returns a small object { ok, status } or throws the underlying network error.
	 */
	export async function testConnection(timeoutMs = 8000) {
		if (!isValidUrl(SUPABASE_URL)) throw new Error('Invalid SUPABASE_URL');

		// Use fetch with a timeout
		const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
		let id;
		if (controller) id = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const res = await fetch(SUPABASE_URL, { method: 'GET', signal: controller ? controller.signal : undefined });
			return { ok: res.ok, status: res.status };
		} catch (err) {
			// Re-throw with a clearer message
			throw new Error(err.message || 'Network request failed');
		} finally {
			if (id) clearTimeout(id);
		}
	}

	export { supabase };
	export default supabase;
