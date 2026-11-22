import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { hashPassword, verifyPassword } from './id';

/** On-device credential digests only — never shipped in seed/source. */
const STORE_KEY = 'haru_cred_digests_v2';

type DigestMap = Record<string, string>; // email -> digest

async function secureStoreReady(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function readLocal(): DigestMap {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DigestMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocal(map: DigestMap): void {
  if (typeof localStorage === 'undefined') {
    throw new Error('Credential storage unavailable');
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(map));
}

async function readMap(): Promise<DigestMap> {
  if (await secureStoreReady()) {
    try {
      const raw = await SecureStore.getItemAsync(STORE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as DigestMap;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return readLocal();
}

async function writeMap(map: DigestMap): Promise<void> {
  const payload = JSON.stringify(map);
  if (await secureStoreReady()) {
    await SecureStore.setItemAsync(STORE_KEY, payload);
    return;
  }
  writeLocal(map);
}

export async function setEmailCredential(email: string, password: string): Promise<void> {
  const map = await readMap();
  map[email] = await hashPassword(password);
  await writeMap(map);
}

export async function verifyEmailCredential(email: string, password: string): Promise<boolean> {
  const map = await readMap();
  const stored = map[email];
  if (!stored) return false;
  return verifyPassword(password, stored);
}

export async function hasEmailCredential(email: string): Promise<boolean> {
  const map = await readMap();
  return Boolean(map[email]);
}

export async function clearAllCredentials(): Promise<void> {
  if (await secureStoreReady()) {
    try {
      await SecureStore.deleteItemAsync(STORE_KEY);
      return;
    } catch {
      /* fall through */
    }
  }
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}
