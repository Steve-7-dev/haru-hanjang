import { sql } from '@/lib/server/db';
import { formatKstDateTime, formatKstDayHeader, kstDayKey } from '@/lib/server/kst';
import { publicUser, requireUser } from '@/lib/server/session';
import {
  clampText,
  MAX_BIO_LEN,
  MAX_DISPLAY_NAME_LEN,
  normalizeUsername,
  validateUsername,
} from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const me = await requireUser();
  if (me instanceof Response) return me;

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor'); // day_key exclusive upper bound for next page
  const limitRaw = Number(url.searchParams.get('limit') ?? PAGE_SIZE);
  const limit = Math.min(Math.max(1, Number.isFinite(limitRaw) ? limitRaw : PAGE_SIZE), 30);

  const dayKey = kstDayKey();
  const params: unknown[] = [me.id];
  let where = `author_id = $1`;
  if (cursor) {
    params.push(cursor);
    where += ` AND day_key < $${params.length}`;
  }
  params.push(limit + 1);

  const posts = await sql<{
    id: string;
    author_id: string;
    day_key: string;
    media_id: string;
    caption: string;
    created_at: string;
    updated_at: string;
    confirmed_at: string | null;
  }>(
    `SELECT id, author_id, day_key, media_id, caption,
            created_at::text, updated_at::text, confirmed_at::text AS confirmed_at
     FROM posts
     WHERE ${where}
     ORDER BY day_key DESC
     LIMIT $${params.length}`,
    params,
  );

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? page[page.length - 1]?.day_key ?? null : null;

  const countRows = await sql<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM posts WHERE author_id = $1`,
    [me.id],
  );
  const todayRows = await sql<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM posts WHERE author_id = $1 AND day_key = $2`,
    [me.id, dayKey],
  );

  return Response.json(
    {
      user: publicUser(me),
      todayDayKey: dayKey,
      hasTodayPost: Number(todayRows[0]?.c ?? 0) > 0,
      totalCount: Number(countRows[0]?.c ?? 0),
      nextCursor,
      posts: page.map((p) => ({
        id: p.id,
        authorId: p.author_id,
        dayKey: p.day_key,
        dayLabel: formatKstDayHeader(p.day_key),
        imageUri: `/api/media/${p.media_id}`,
        caption: p.caption,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        confirmedAt: p.confirmed_at,
        confirmed: Boolean(p.confirmed_at),
        createdAtLabel: formatKstDateTime(p.created_at),
      })),
    },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}

export async function PATCH(request: Request) {
  const me = await requireUser();
  if (me instanceof Response) return me;

  let body: { displayName?: string; bio?: string; username?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '잘못된 요청이에요.' }, { status: 400 });
  }

  let displayName = me.displayName;
  let bio = me.bio;
  let username = me.username;

  if (body.displayName != null) {
    displayName = clampText(body.displayName, MAX_DISPLAY_NAME_LEN) || me.username;
  }
  if (body.bio != null) {
    bio = clampText(body.bio, MAX_BIO_LEN);
  }
  if (body.username != null) {
    const uErr = validateUsername(body.username);
    if (uErr) return Response.json({ error: uErr }, { status: 400 });
    username = normalizeUsername(body.username);
    const clash = await sql(
      `SELECT 1 FROM users WHERE username = $1 AND id <> $2 LIMIT 1`,
      [username, me.id],
    );
    if (clash.length) {
      return Response.json({ error: '이미 쓰는 유저네임이에요.' }, { status: 409 });
    }
  }

  await sql(
    `UPDATE users SET display_name = $1, bio = $2, username = $3 WHERE id = $4`,
    [displayName, bio, username, me.id],
  );

  return Response.json(
    {
      user: publicUser({
        ...me,
        displayName,
        bio,
        username,
      }),
    },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
