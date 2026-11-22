import { sql } from '@/lib/server/db';
import { kstDayKey } from '@/lib/server/kst';
import { requireUser } from '@/lib/server/session';
import { getTodayLock, getTodayPost, mapTodayPost } from '@/lib/server/today';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const me = await requireUser();
  if (me instanceof Response) return me;

  const dayKey = kstDayKey();
  const existingLock = await getTodayLock(me.id, dayKey);
  if (existingLock) {
    return Response.json({ error: '이미 오늘 사진을 확정했어요.' }, { status: 409 });
  }

  const post = await getTodayPost(me.id, dayKey);
  if (!post) {
    return Response.json({ error: '확정할 오늘 사진이 없어요.' }, { status: 404 });
  }
  if (post.confirmed_at) {
    return Response.json({ error: '이미 확정된 사진이에요.' }, { status: 409 });
  }

  const now = new Date().toISOString();
  await sql(
    `UPDATE posts SET confirmed_at = $1, updated_at = $1
     WHERE id = $2 AND author_id = $3 AND confirmed_at IS NULL`,
    [now, post.id, me.id],
  );
  await sql(
    `INSERT INTO daily_shot_locks (user_id, day_key, confirmed_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, day_key) DO NOTHING`,
    [me.id, dayKey, now],
  );

  const updated = await getTodayPost(me.id, dayKey);
  return Response.json(
    {
      post: updated ? mapTodayPost(updated) : null,
      locked: true,
      confirmedAt: now,
    },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
