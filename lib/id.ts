export function createId(prefix = ''): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${rand}` : rand;
}

/** Lightweight non-crypto hash for local MVP email passwords. */
export function hashPassword(password: string): string {
  let h = 2166136261;
  const s = `haru:${password}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `h1_${(h >>> 0).toString(16)}`;
}
