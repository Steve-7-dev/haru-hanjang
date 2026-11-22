import { newId } from '@/lib/server/crypto';
import { sql } from '@/lib/server/db';
import { kstDayKey } from '@/lib/server/kst';
import { requireUser } from '@/lib/server/session';
import { getTodayLock, getTodayPost, mapTodayPost } from '@/lib/server/today';
import {
  clampText,
  MAX_CAPTION_LEN,
  MAX_IMAGE_BYTES,
} from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function GET() {
  const me = await requireUser();
  if (me instanceof Response) return me;
  const dayKey = kstDayKey();
  const lock = await getTodayLock(me.id, dayKey);
  const post = await getTodayPost(me.id, dayKey);
  return Response.json(
    {
      dayKey,
      locked: Boolean(lock),
      confirmedAt: lock?.confirmed_at ?? post?.confirmed_at ?? null,
      post: post ? mapTodayPost(post) : null,
      canUpload: !lock && !post?.confirmed_at,
      canEdit: Boolean(post) && !post?.confirmed_at && !lock,
      canConfirm: Boolean(post) && !post?.confirmed_at && !lock,
      canDelete: Boolean(post),
    },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}

export async function POST(request: Request) {
  const me = await requireUser();
  if (me instanceof Response) return me;

  const dayKey = kstDayKey();
  const lock = await getTodayLock(me.id, dayKey);
  if (lock) {
    return Response.json(
      { error: '오늘 사진을 이미 확정했어요. 삭제 후에도 다시 올릴 수 없어요.' },
      { status: 403 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: '잘못된 요청이에요.' }, { status: 400 });
  }

  const file = form.get('image');
  const caption = clampText(String(form.get('caption') ?? ''), MAX_CAPTION_LEN);
  const hasFile = file instanceof File;

  const existing = await getTodayPost(me.id, dayKey);
  if (existing?.confirmed_at) {
    return Response.json(
      { error: '확정된 사진은 수정할 수 없어요.' },
      { status: 403 },
    );
  }

  const now = new Date().toISOString();

  if (existing && !hasFile) {
    await sql(
      `UPDATE posts SET caption = $1, updated_at = $2
       WHERE id = $3 AND author_id = $4 AND confirmed_at IS NULL`,
      [caption, now, existing.id, me.id],
    );
    const still = await getTodayPost(me.id, dayKey);
    if (!still) {
      return Response.json({ error: '확정된 사진은 수정할 수 없어요.' }, { status: 403 });
    }
    return Response.json(
      { post: mapTodayPost(still) },
      { headers: { 'cache-control': 'private, no-store' } },
    );
  }

  if (!(file instanceof File)) {
    return Response.json({ error: '사진을 선택해 주세요.' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return Response.json({ error: '지원하지 않는 이미지예요.' }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: '이미지 크기는 4MB 이하여야 해요.' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mediaId = newId('m');

  if (existing) {
    const postId = existing.id;
    const oldMedia = existing.media_id;
    await sql(
      `INSERT INTO media (id, owner_id, content_type, bytes) VALUES ($1, $2, $3, $4)`,
      [mediaId, me.id, file.type, bytes],
    );
    await sql(
      `UPDATE posts SET media_id = $1, caption = $2, updated_at = $3
       WHERE id = $4 AND author_id = $5 AND confirmed_at IS NULL`,
      [mediaId, caption, now, postId, me.id],
    );
    const still = await getTodayPost(me.id, dayKey);
    if (!still || still.media_id !== mediaId) {
      await sql(`DELETE FROM media WHERE id = $1 AND owner_id = $2`, [mediaId, me.id]);
      return Response.json({ error: '확정된 사진은 수정할 수 없어요.' }, { status: 403 });
    }
    await sql(`DELETE FROM media WHERE id = $1 AND owner_id = $2`, [oldMedia, me.id]);
    return Response.json(
      { post: mapTodayPost(still) },
      { headers: { 'cache-control': 'private, no-store' } },
    );
  }

  const postId = newId('p');
  await sql(
    `INSERT INTO media (id, owner_id, content_type, bytes) VALUES ($1, $2, $3, $4)`,
    [mediaId, me.id, file.type, bytes],
  );
  await sql(
    `INSERT INTO posts (id, author_id, day_key, media_id, caption, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [postId, me.id, dayKey, mediaId, caption, now, now],
  );

  const created = await getTodayPost(me.id, dayKey);
  return Response.json(
    { post: created ? mapTodayPost(created) : null },
    { status: 201, headers: { 'cache-control': 'private, no-store' } },
  );
}

export async function DELETE() {
  const me = await requireUser();
  if (me instanceof Response) return me;
  const dayKey = kstDayKey();
  const rows = await sql<{ id: string; media_id: string; confirmed_at: string | null }>(
    `SELECT id, media_id, confirmed_at::text AS confirmed_at
     FROM posts WHERE author_id = $1 AND day_key = $2 LIMIT 1`,
    [me.id, dayKey],
  );
  if (!rows[0]) {
    return Response.json({ error: '오늘 올린 사진이 없어요.' }, { status: 404 });
  }
  // If confirmed, keep/ensure day lock so re-upload stays blocked after delete.
  if (rows[0].confirmed_at) {
    await sql(
      `INSERT INTO daily_shot_locks (user_id, day_key, confirmed_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, day_key) DO NOTHING`,
      [me.id, dayKey, rows[0].confirmed_at],
    );
  }
  await sql(`DELETE FROM posts WHERE id = $1 AND author_id = $2`, [rows[0].id, me.id]);
  await sql(`DELETE FROM media WHERE id = $1 AND owner_id = $2`, [rows[0].media_id, me.id]);
  return Response.json({ ok: true }, { headers: { 'cache-control': 'private, no-store' } });
}
