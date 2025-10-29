import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';

const K_USERS   = 'app:users';
const K_SESSION = 'auth:token';

const toHex = (bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
const hasRandom = Random && typeof Random.getRandomBytesAsync === 'function';

async function genSalt(bytes = 16) {
  if (hasRandom) {
    const arr = await Random.getRandomBytesAsync(bytes);
    return toHex(arr);
  }
  // Dev-only fallback if expo-random not ready
  const seed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}:${Math.random()}:${Math.random()}`
  );
  return seed.slice(0, bytes * 2);
}

async function hashPassword(password, salt) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

async function loadUsers() {
  const raw = await AsyncStorage.getItem(K_USERS);
  return raw ? JSON.parse(raw) : [];
}
async function saveUsers(users) {
  await AsyncStorage.setItem(K_USERS, JSON.stringify(users));
}

export async function findUserByEmail(email) {
  const users = await loadUsers();
  const e = String(email || '').trim().toLowerCase();
  return users.find(u => u.email === e) || null;
}

export async function createUser(email, password) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return { error: 'Email required' };
  if (!password || password.length < 6) return { error: 'Password too short' };

  const exists = await findUserByEmail(e);
  if (exists) return { error: 'Email already exists' }; // ✅ unique email

  const salt = await genSalt(16);
  const hash = await hashPassword(password, salt);
  const id = hasRandom ? toHex(await Random.getRandomBytesAsync(8)) : String(Date.now());

  const user = { id, email: e, hash, salt, createdAt: new Date().toISOString() };
  const users = await loadUsers();
  await saveUsers([user, ...users]);
  return { user };
}

export async function verifyLogin(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return { error: 'Invalid credentials' };
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.hash) return { error: 'Invalid credentials' };
  return { user };
}

export async function setSession(userId) {
  await AsyncStorage.setItem(K_SESSION, String(userId));
}
export async function clearSession() {
  await AsyncStorage.removeItem(K_SESSION);
}
export { K_SESSION as K_TOKEN };
