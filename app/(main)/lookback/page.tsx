'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { LookbackPlayer, type LookbackSlide } from '@/components/web/LookbackPlayer';
import { useAuth } from '@/components/web/AuthProvider';
import { AppNav } from '@/components/web/IgShell';
import { apiGet } from '@/lib/client/api';

type Period = 'week' | 'month' | 'all';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: '이번 주' },
  { id: 'month', label: '이번 달' },
  { id: 'all', label: '전체' },
];

export default function LookbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('month');
  const [slides, setSlides] = useState<LookbackSlide[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  const load = useCallback(async (p: Period) => {
    setBusy(true);
    setError('');
    try {
      const data = await apiGet<{ posts: LookbackSlide[] }>(`/api/lookback?period=${p}`);
      setSlides(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : '되돌아보기를 불러오지 못했어요.');
      setSlides([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    void load(period);
  }, [loading, user, router, period, load]);

  if (loading || !user) {
    return (
      <div className="auth-root">
        <p className="tagline">불러오는 중…</p>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <Link href="/profile" className="lookback-back" aria-label="뒤로">
          ←
        </Link>
        <h1>되돌아보기</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lookback-mark" src="/brand-mark.png" alt="" width={28} height={28} />
      </header>

      <div className="page lookback-page">
        <div className="lookback-periods" role="tablist" aria-label="기간" data-testid="lookback-periods">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              className={`lookback-period${period === p.id ? ' active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {error ? <p className="auth-error">{error}</p> : null}
        {busy ? (
          <p className="tagline">불러오는 중…</p>
        ) : (
          <LookbackPlayer
            key={`${period}:${slides.map((s) => s.id).join(',')}`}
            slides={slides}
          />
        )}
      </div>

      <AppNav active="profile" />
    </>
  );
}
