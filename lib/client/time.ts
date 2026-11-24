const KST = 'Asia/Seoul';

/** Display form: 2026.11.23 07:45 (KST) from server created_at ISO. */
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
