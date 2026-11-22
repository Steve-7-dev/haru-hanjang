import { sql } from '@/lib/server/db';
import { requireUser } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const me = await requireUser();
  if (me instanceof Response) return me;
  const { id: postId } = await ctx.params;

  const posts = await sql<{ id: string }>(`SELECT id FROM posts WHERE id = $1 LIMIT 1`, [postId]);
  if (!posts[0]) {
    return Response.json({ error: '게시물을 찾을 수 없어요.' }, { status: 404 });
  }

  const existing = await sql(
    `SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2 LIMIT 1`,
    [postId, me.id],
  );
  if (existing.length) {
    await sql(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2`, [postId, me.id]);
  } else {
    await sql(`INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`, [postId, me.id]);
  }

  const countRows = await sql<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM likes WHERE post_id = $1`,
    [postId],
  );
  const liked = await sql(
    `SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2 LIMIT 1`,
    [postId, me.id],
  );

  return Response.json(
    { likedByMe: liked.length > 0, likeCount: Number(countRows[0]?.c ?? 0) },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
