import { sql } from './db';
import { formatKstDateTime, kstDayKey } from './kst';

export type TodayPostRow = {
  id: string;
  author_id: string;
  day_key: string;
  media_id: string;
  caption: string;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
};

export async function getTodayLock(userId: string, dayKey = kstDayKey()) {
  const rows = await sql<{ confirmed_at: string }>(
    `SELECT confirmed_at::text FROM daily_shot_locks WHERE user_id = $1 AND day_key = $2 LIMIT 1`,
    [userId, dayKey],
  );
  return rows[0] ?? null;
}

export async function getTodayPost(userId: string, dayKey = kstDayKey()) {
  const rows = await sql<TodayPostRow>(
    `SELECT id, author_id, day_key, media_id, caption,
            created_at::text, updated_at::text, confirmed_at::text AS confirmed_at
     FROM posts WHERE author_id = $1 AND day_key = $2 LIMIT 1`,
    [userId, dayKey],
  );
  return rows[0] ?? null;
}

export function mapTodayPost(row: TodayPostRow) {
  return {
    id: row.id,
    authorId: row.author_id,
    dayKey: row.day_key,
    imageUri: `/api/media/${row.media_id}`,
    caption: row.caption,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    confirmedAt: row.confirmed_at,
    confirmed: Boolean(row.confirmed_at),
    createdAtLabel: formatKstDateTime(row.created_at),
  };
}
