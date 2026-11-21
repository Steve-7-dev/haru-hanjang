/** Korea Standard Time helpers — "하루" is always KST calendar day. */

const KST = 'Asia/Seoul';

export function nowKst(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: KST }),
  );
}

/** Returns YYYY-MM-DD in KST for a given instant (default: now). */
export function kstDayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatKstRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.max(0, Math.floor((now - then) / 1000));
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

export function formatKstDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
