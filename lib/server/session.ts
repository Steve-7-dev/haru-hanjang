import { cookies } from 'next/headers';

import { hashToken, newId, newSessionToken } from './crypto';
import { sql } from './db';

export const SESSION_COOKIE = 'odos_session';
const SESSION_DAYS = 30;

type SessionUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  isPrivate: boolean;
  createdAt: string;
};

export async function createSession(userId: string): Promise<string> {
  const token = newSessionToken();
  const tokenHash = hashToken(token);
  const id = newId('s');
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)`,
    [id, userId, tokenHash, expires.toISOString()],
  );
  return token;
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await sql(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(token)]);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await sql<{
    id: string;
    email: string;
    username: string;
    display_name: string;
    bio: string;
    is_private: boolean;
    created_at: string;
  }>(
    `SELECT u.id, u.email, u.username, u.display_name, u.bio, u.is_private, u.created_at::text
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    isPrivate: row.is_private,
    createdAt: row.created_at,
  };
}

export async function requireUser(): Promise<SessionUser | Response> {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }
  return user;
}

export function publicUser(u: SessionUser) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    bio: u.bio,
    isPrivate: u.isPrivate,
    createdAt: u.createdAt,
    avatarUri: null as string | null,
    authProvider: 'email' as const,
  };
}
