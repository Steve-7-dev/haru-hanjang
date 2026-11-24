import { sql } from '@/lib/server/db';
import {
  formatKstDateTime,
  formatKstDayHeader,
  formatLookbackSubtitle,
  kstDayKey,
  kstMonthStartDayKey,
  kstWeekStartDayKey,
} from '@/lib/server/kst';
import { requireUser } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type LookbackPeriod = 'week' | 'month' | 'all';

function parsePeriod(raw: string | null): LookbackPeriod {
  if (raw === 'week' || raw === 'month' || raw === 'all') return raw;
  return 'month';
}

export async function GET(request: Request) {
  const me = await requireUser();
  if (me instanceof Response) return me;

  const url = new URL(request.url);
  const period = parsePeriod(url.searchParams.get('period'));
  const today = kstDayKey();
  const fromDay =
    period === 'week' ? kstWeekStartDayKey() : period === 'month' ? kstMonthStartDayKey() : null;

  const params: unknown[] = [me.id];
  let where = `author_id = $1`;
  if (fromDay) {
    params.push(fromDay);
    where += ` AND day_key >= $${params.length}`;
  }
  params.push(today);
  where += ` AND day_key <= $${params.length}`;

  const rows = await sql<{
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
     ORDER BY day_key ASC`,
    params,
  );

  return Response.json(
    {
      period,
      fromDay,
      toDay: today,
      count: rows.length,
      posts: rows.map((p) => ({
        id: p.id,
        authorId: p.author_id,
        dayKey: p.day_key,
        dayLabel: formatKstDayHeader(p.day_key),
        imageUri: `/api/media/${p.media_id}`,
        caption: p.caption,
        subtitle: formatLookbackSubtitle(p.day_key, p.caption),
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
