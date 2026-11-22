'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/web/AuthProvider';
import { AppNav } from '@/components/web/IgShell';
import { apiGet, type ApiPost, type ApiUser } from '@/lib/client/api';
import { formatKstDateTime, formatKstDayHeader } from '@/lib/client/time';

type ProfilePost = ApiPost & { dayLabel?: string };

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [hasToday, setHasToday] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (cursor: string | null, replace: boolean) => {
    const qs = new URLSearchParams({ limit: '10' });
    if (cursor) qs.set('cursor', cursor);
    const data = await apiGet<{
      user: ApiUser;
      posts: ProfilePost[];
      hasTodayPost: boolean;
      totalCount: number;
      nextCursor: string | null;
    }>(`/api/profile?${qs.toString()}`);
    setProfile(data.user);
    setHasToday(data.hasTodayPost);
    setTotalCount(data.totalCount);
    setNextCursor(data.nextCursor);
    setPosts((prev) => (replace ? data.posts : [...prev, ...data.posts]));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    void loadPage(null, true).catch((err) =>
      setError(err instanceof Error ? err.message : '프로필을 불러오지 못했어요.'),
    );
  }, [loading, user, router, loadPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !nextCursor) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        void loadPage(nextCursor, false)
          .catch((err) => setError(err instanceof Error ? err.message : '더 불러오지 못했어요.'))
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: '200px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [nextCursor, loadingMore, loadPage]);

  if (loading || !user || !profile) {
    return (
      <div className="auth-root">
        <p className="tagline">불러오는 중…</p>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <h1>{profile.username}</h1>
      </header>
      <div className="page">
        <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>{profile.displayName}</h2>
        <p className="tagline" style={{ textAlign: 'left', marginBottom: 8 }}>
          {profile.bio || '소개가 없어요.'}
        </p>
        <p className="tagline" style={{ textAlign: 'left' }}>
          오늘 게시 {hasToday ? '완료' : '아직 없음'} · 총 {totalCount}장
        </p>
        {error ? <p className="auth-error">{error}</p> : null}

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {posts.map((p) => (
            <article key={p.id} style={{ background: 'var(--panel)' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>
                {p.dayLabel || formatKstDayHeader(p.dayKey)}
              </h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUri}
                alt=""
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }}
              />
              <p className="tagline" style={{ textAlign: 'left', marginTop: 8 }}>
                {p.createdAtLabel || formatKstDateTime(p.createdAt)}
                {p.confirmed ? ' · 확정됨' : ' · 미확정'}
              </p>
              {p.caption ? (
                <p style={{ margin: '4px 0 0', fontSize: 14 }}>{p.caption}</p>
              ) : null}
            </article>
          ))}
        </div>

        <div ref={sentinelRef} style={{ height: 24 }} />
        {loadingMore ? (
          <p className="tagline">더 불러오는 중…</p>
        ) : nextCursor ? null : posts.length > 0 ? (
          <p className="tagline">끝이에요.</p>
        ) : (
          <p className="tagline">아직 올린 사진이 없어요.</p>
        )}
      </div>
      <AppNav active="profile" />
    </>
  );
}
