import { cookies } from 'next/headers';

import { verifyPassword } from '@/lib/server/crypto';
import { sql } from '@/lib/server/db';
import {
  createSession,
  publicUser,
  sessionCookieOptions,
} from '@/lib/server/session';
import { isValidEmail, normalizeEmail } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '잘못된 요청이에요.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? '');
  const password = body.password ?? '';
  if (!isValidEmail(email) || !password) {
    return Response.json({ error: '이메일 또는 비밀번호가 올바르지 않아요.' }, { status: 401 });
  }

  const rows = await sql<{
    id: string;
    email: string;
    username: string;
    display_name: string;
    bio: string;
    is_private: boolean;
    created_at: string;
    password_hash: string;
  }>(
    `SELECT id, email, username, display_name, bio, is_private, created_at::text, password_hash
     FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );
  const row = rows[0];
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return Response.json({ error: '이메일 또는 비밀번호가 올바르지 않아요.' }, { status: 401 });
  }

  const token = await createSession(row.id);
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
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    isPrivate: row.is_private,
    createdAt: row.created_at,
  };

  return Response.json(
    { user: publicUser(user) },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
