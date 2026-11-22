import { cookies } from 'next/headers';

import { hashPassword, newId } from '@/lib/server/crypto';
import { sql } from '@/lib/server/db';
import {
  createSession,
  publicUser,
  sessionCookieOptions,
} from '@/lib/server/session';
import {
  clampText,
  isValidEmail,
  MAX_DISPLAY_NAME_LEN,
  normalizeEmail,
  normalizeUsername,
  validatePassword,
  validateUsername,
} from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: {
    email?: string;
    password?: string;
    username?: string;
    displayName?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '잘못된 요청이에요.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? '');
  const password = body.password ?? '';
  const usernameRaw = body.username ?? '';
  const displayNameRaw = body.displayName ?? '';

  if (!isValidEmail(email)) {
    return Response.json({ error: '올바른 이메일을 입력해 주세요.' }, { status: 400 });
  }
  const pwdErr = validatePassword(password);
  if (pwdErr) return Response.json({ error: pwdErr }, { status: 400 });
  const uErr = validateUsername(usernameRaw);
  if (uErr) return Response.json({ error: uErr }, { status: 400 });
  const username = normalizeUsername(usernameRaw);
  const displayName = clampText(displayNameRaw || username, MAX_DISPLAY_NAME_LEN) || username;

  const existingEmail = await sql(`SELECT 1 FROM users WHERE email = $1 LIMIT 1`, [email]);
  if (existingEmail.length) {
    return Response.json({ error: '이미 가입된 이메일이에요.' }, { status: 409 });
  }
  const existingUser = await sql(`SELECT 1 FROM users WHERE username = $1 LIMIT 1`, [username]);
  if (existingUser.length) {
    return Response.json({ error: '이미 쓰는 유저네임이에요.' }, { status: 409 });
  }

  const id = newId('u');
  const passwordHash = await hashPassword(password);
  await sql(
    `INSERT INTO users (id, email, username, display_name, password_hash)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, email, username, displayName, passwordHash],
  );

  const token = await createSession(id);
  const jar = await cookies();
  const cookie = sessionCookieOptions(token);
  jar.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });

  const user = {
    id,
    email,
    username,
    displayName,
    bio: '',
    isPrivate: false,
    createdAt: new Date().toISOString(),
  };

  return Response.json(
    { user: publicUser(user) },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
