import { newId } from '@/lib/server/crypto';
import { sql } from '@/lib/server/db';
import { kstDayKey } from '@/lib/server/kst';
import { requireUser } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Local E2E only. Disabled unless E2E_SEED=1.
 * Inserts a few past-day posts so lookback can exercise multi-slide Ken Burns.
 */
export async function POST(request: Request) {
  if (process.env.E2E_SEED !== '1') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const me = await requireUser();
  if (me instanceof Response) return me;

  let body: { days?: number } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const days = Math.min(Math.max(Number(body.days) || 3, 1), 7);

  const today = kstDayKey();
  const [y, m, d] = today.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

  // 1x1 PNG
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );

  const captions = [
    '오늘은 회의만 세 번 했다',
    '점심은 김밥으로 버텼다',
    '저녁 하늘이 예뻤다',
    '조용한 오후였다',
    '잠깐 산책했다',
    '커피 한 잔의 여유',
    '하루의 끝',
  ];

  const created: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(base);
    day.setUTCDate(base.getUTCDate() - i);
    const dayKey = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`;
    const mediaId = newId('m');
    const postId = newId('p');
    const caption = captions[(days - 1 - i) % captions.length] ?? '';
    const now = new Date().toISOString();

    await sql(`DELETE FROM posts WHERE author_id = $1 AND day_key = $2`, [me.id, dayKey]);
    await sql(
      `INSERT INTO media (id, owner_id, content_type, bytes) VALUES ($1, $2, $3, $4)`,
      [mediaId, me.id, 'image/png', png],
    );
    await sql(
      `INSERT INTO posts (id, author_id, day_key, media_id, caption, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [postId, me.id, dayKey, mediaId, caption, now, now],
    );
    created.push(dayKey);
  }

  return Response.json(
    { ok: true, days: created },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
