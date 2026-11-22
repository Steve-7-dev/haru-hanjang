/** Shared client-side input rules for the local MVP. */

export const MIN_PASSWORD_LEN = 8;
export const MAX_PASSWORD_LEN = 128;
export const MIN_USERNAME_LEN = 3;
export const MAX_USERNAME_LEN = 30;
export const MAX_DISPLAY_NAME_LEN = 50;
export const MAX_BIO_LEN = 150;
export const MAX_CAPTION_LEN = 2200;
export const MAX_COMMENT_LEN = 500;
export const MAX_MESSAGE_LEN = 1000;
export const MAX_GROUP_TITLE_LEN = 40;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const e = normalizeEmail(email);
  return e.length <= 254 && EMAIL_RE.test(e);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
}

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LEN) {
    return `비밀번호는 ${MIN_PASSWORD_LEN}자 이상이어야 해요.`;
  }
  if (password.length > MAX_PASSWORD_LEN) {
    return `비밀번호는 ${MAX_PASSWORD_LEN}자 이하여야 해요.`;
  }
  return null;
}

export function validateUsername(username: string): string | null {
  const u = normalizeUsername(username);
  if (u.length < MIN_USERNAME_LEN) return `유저네임은 ${MIN_USERNAME_LEN}자 이상이어야 해요.`;
  if (u.length > MAX_USERNAME_LEN) return `유저네임은 ${MAX_USERNAME_LEN}자 이하여야 해요.`;
  return null;
}

export function clampText(text: string, max: number): string {
  return text.trim().slice(0, max);
}
