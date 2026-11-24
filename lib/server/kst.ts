const KST = 'Asia/Seoul';

export function kstDayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Display form: 2026.11.23 07:45 (KST) */
export function formatKstDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}.${get('month')}.${get('day')} ${get('hour')}:${get('minute')}`;
}

export function formatKstDayHeader(dayKey: string): string {
  const [y, m, d] = dayKey.split('-');
  if (!y || !m || !d) return dayKey;
  return `${y}.${m}.${d}`;
}

/** "11월 24일" from day_key YYYY-MM-DD */
export function formatKstMonthDay(dayKey: string): string {
  const [, m, d] = dayKey.split('-');
  if (!m || !d) return dayKey;
  return `${Number(m)}월 ${Number(d)}일`;
}

/** Caption subtitle for lookback: date only, or "11월 24일, caption". */
export function formatLookbackSubtitle(dayKey: string, caption: string): string {
  const datePart = formatKstMonthDay(dayKey);
  const line = caption.trim();
  return line ? `${datePart}, ${line}` : datePart;
}

function kstYmdParts(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: get('weekday'),
  };
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

/** Monday-start week in KST (YYYY-MM-DD). */
export function kstWeekStartDayKey(date: Date = new Date()): string {
  const { year, month, day, weekday } = kstYmdParts(date);
  const weekdayIndex: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = weekdayIndex[weekday] ?? 0;
  // Build a UTC noon date for the KST calendar day, then subtract offset days.
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  utc.setUTCDate(utc.getUTCDate() - offset);
  return `${utc.getUTCFullYear()}-${pad2(utc.getUTCMonth() + 1)}-${pad2(utc.getUTCDate())}`;
}

export function kstMonthStartDayKey(date: Date = new Date()): string {
  const { year, month } = kstYmdParts(date);
  return `${year}-${pad2(month)}-01`;
}
