import { newId } from '@/lib/server/crypto';
import { sql } from '@/lib/server/db';
import { requireUser } from '@/lib/server/session';
import { clampText, MAX_COMMENT_LEN } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const me = await requireUser();
  if (me instanceof Response) return me;
  const { id: postId } = await ctx.params;

  const posts = await sql(`SELECT id FROM posts WHERE id = $1 LIMIT 1`, [postId]);
  if (!posts.length) {
    return Response.json({ error: '게시물을 찾을 수 없어요.' }, { status: 404 });
  }

  const rows = await sql<{
    id: string;
    author_id: string;
    body: string;
    created_at: string;
    username: string;
    display_name: string;
  }>(
    `SELECT c.id, c.author_id, c.body, c.created_at::text, u.username, u.display_name
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId],
  );

  return Response.json(
    {
      comments: rows.map((r) => ({
        id: r.id,
        postId,
        authorId: r.author_id,
        text: r.body,
        createdAt: r.created_at,
        author: { id: r.author_id, username: r.username, displayName: r.display_name },
      })),
    },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}

export async function POST(request: Request, ctx: Ctx) {
  const me = await requireUser();
  if (me instanceof Response) return me;
  const { id: postId } = await ctx.params;

  const posts = await sql(`SELECT id FROM posts WHERE id = $1 LIMIT 1`, [postId]);
  if (!posts.length) {
    return Response.json({ error: '게시물을 찾을 수 없어요.' }, { status: 404 });
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '잘못된 요청이에요.' }, { status: 400 });
  }
  const text = clampText(body.text ?? '', MAX_COMMENT_LEN);
  if (!text) {
    return Response.json({ error: '댓글을 입력해 주세요.' }, { status: 400 });
  }

  const id = newId('c');
  const createdAt = new Date().toISOString();
  await sql(
    `INSERT INTO comments (id, post_id, author_id, body, created_at) VALUES ($1, $2, $3, $4, $5)`,
    [id, postId, me.id, text, createdAt],
  );

  return Response.json(
    {
      comment: {
        id,
        postId,
        authorId: me.id,
        text,
        createdAt,
        author: { id: me.id, username: me.username, displayName: me.displayName },
      },
    },
    { status: 201, headers: { 'cache-control': 'private, no-store' } },
  );
}
