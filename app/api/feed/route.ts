import { sql } from '@/lib/server/db';
import { requireUser } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type FeedRow = {
  id: string;
  author_id: string;
  day_key: string;
  media_id: string;
  caption: string;
  created_at: string;
  updated_at: string;
  username: string;
  display_name: string;
  like_count: string;
  comment_count: string;
  liked_by_me: boolean;
};

export async function GET() {
  const me = await requireUser();
  if (me instanceof Response) return me;

  const rows = await sql<FeedRow>(
    `SELECT p.id, p.author_id, p.day_key, p.media_id, p.caption,
            p.created_at::text, p.updated_at::text,
            u.username, u.display_name,
            (SELECT COUNT(*)::text FROM likes l WHERE l.post_id = p.id) AS like_count,
            (SELECT COUNT(*)::text FROM comments c WHERE c.post_id = p.id) AS comment_count,
            EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked_by_me
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE u.is_private = FALSE OR p.author_id = $1
     ORDER BY p.created_at DESC
     LIMIT 100`,
    [me.id],
  );

  const posts = rows.map((r) => ({
    id: r.id,
    authorId: r.author_id,
    dayKey: r.day_key,
    imageUri: `/api/media/${r.media_id}`,
    caption: r.caption,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    author: { id: r.author_id, username: r.username, displayName: r.display_name },
    likeCount: Number(r.like_count),
    commentCount: Number(r.comment_count),
    likedByMe: r.liked_by_me,
  }));

  return Response.json({ posts }, { headers: { 'cache-control': 'private, no-store' } });
}
