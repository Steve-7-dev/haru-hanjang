import { sql } from '@/lib/server/db';
import { getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const me = await getSessionUser();
  if (!me) {
    return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }
  const { id } = await ctx.params;

  const rows = await sql<{
    content_type: string;
    bytes: Buffer | Uint8Array;
    owner_id: string;
    is_private: boolean;
  }>(
    `SELECT m.content_type, m.bytes, m.owner_id, u.is_private
     FROM media m
     JOIN users u ON u.id = m.owner_id
     WHERE m.id = $1 LIMIT 1`,
    [id],
  );
  const row = rows[0];
  if (!row) {
    return Response.json({ error: '미디어를 찾을 수 없어요.' }, { status: 404 });
  }
  if (row.is_private && row.owner_id !== me.id) {
    return Response.json({ error: '권한이 없어요.' }, { status: 403 });
  }

  const buf = Buffer.isBuffer(row.bytes) ? row.bytes : Buffer.from(row.bytes);
  const body = new Uint8Array(buf);
  return new Response(body, {
    headers: {
      'content-type': row.content_type,
      'cache-control': 'private, no-store',
    },
  });
}
