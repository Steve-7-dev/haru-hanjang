import { newId } from '@/lib/server/crypto';
import { sql } from '@/lib/server/db';
import { kstDayKey } from '@/lib/server/kst';
import { requireUser } from '@/lib/server/session';
import {
  clampText,
  MAX_CAPTION_LEN,
  MAX_IMAGE_BYTES,
} from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: Request) {
  const me = await requireUser();
  if (me instanceof Response) return me;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: '잘못된 요청이에요.' }, { status: 400 });
  }

  const file = form.get('image');
  const caption = clampText(String(form.get('caption') ?? ''), MAX_CAPTION_LEN);
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
  const dayKey = kstDayKey();
  const mediaId = newId('m');
  const now = new Date().toISOString();

  const existing = await sql<{ id: string; media_id: string }>(
    `SELECT id, media_id FROM posts WHERE author_id = $1 AND day_key = $2 LIMIT 1`,
    [me.id, dayKey],
  );

  if (existing[0]) {
    const postId = existing[0].id;
    const oldMedia = existing[0].media_id;
    await sql(
      `INSERT INTO media (id, owner_id, content_type, bytes) VALUES ($1, $2, $3, $4)`,
      [mediaId, me.id, file.type, bytes],
    );
    await sql(
      `UPDATE posts SET media_id = $1, caption = $2, updated_at = $3 WHERE id = $4 AND author_id = $5`,
      [mediaId, caption, now, postId, me.id],
    );
    await sql(`DELETE FROM media WHERE id = $1 AND owner_id = $2`, [oldMedia, me.id]);
    return Response.json(
      {
        post: {
          id: postId,
          authorId: me.id,
          dayKey,
          imageUri: `/api/media/${mediaId}`,
          caption,
          createdAt: now,
          updatedAt: now,
        },
      },
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

  return Response.json(
    {
      post: {
        id: postId,
        authorId: me.id,
        dayKey,
        imageUri: `/api/media/${mediaId}`,
        caption,
        createdAt: now,
        updatedAt: now,
      },
    },
    { status: 201, headers: { 'cache-control': 'private, no-store' } },
  );
}

export async function DELETE() {
  const me = await requireUser();
  if (me instanceof Response) return me;
  const dayKey = kstDayKey();
  const rows = await sql<{ id: string; media_id: string }>(
    `SELECT id, media_id FROM posts WHERE author_id = $1 AND day_key = $2 LIMIT 1`,
    [me.id, dayKey],
  );
  if (!rows[0]) {
    return Response.json({ error: '오늘 올린 사진이 없어요.' }, { status: 404 });
  }
  await sql(`DELETE FROM posts WHERE id = $1 AND author_id = $2`, [rows[0].id, me.id]);
  await sql(`DELETE FROM media WHERE id = $1 AND owner_id = $2`, [rows[0].media_id, me.id]);
  return Response.json({ ok: true }, { headers: { 'cache-control': 'private, no-store' } });
}
