'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/components/web/AuthProvider';
import { AppNav } from '@/components/web/IgShell';
import { apiGet, type ApiPost, type ApiUser } from '@/lib/client/api';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [hasToday, setHasToday] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{
        user: ApiUser;
        posts: ApiPost[];
        hasTodayPost: boolean;
      }>('/api/profile');
      setProfile(data.user);
      setPosts(data.posts);
      setHasToday(data.hasTodayPost);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필을 불러오지 못했어요.');
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    void load();
  }, [loading, user, router, load]);

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
          오늘 게시 {hasToday ? '완료' : '아직 없음'} · 총 {posts.length}장
        </p>
        {error ? <p className="auth-error">{error}</p> : null}
        <div className="grid" style={{ marginTop: 12 }}>
          {posts.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.imageUri} alt="" />
          ))}
        </div>
      </div>
      <AppNav active="profile" />
    </>
  );
}
