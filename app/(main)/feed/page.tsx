'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/components/web/AuthProvider';
import { AppNav } from '@/components/web/IgShell';
import { apiGet, apiPostJson, type ApiPost } from '@/lib/client/api';

export default function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ posts: ApiPost[] }>('/api/feed');
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : '피드를 불러오지 못했어요.');
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

  async function toggleLike(postId: string) {
    try {
      const data = await apiPostJson<{ likedByMe: boolean; likeCount: number }>(
        `/api/posts/${postId}/like`,
        {},
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likedByMe: data.likedByMe, likeCount: data.likeCount } : p,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '좋아요 실패');
    }
  }

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
        <h1>One Day One Shot</h1>
        <Link href="/settings" style={{ fontSize: 13, color: 'var(--muted)' }}>
          설정
        </Link>
      </header>
      {error ? <p className="auth-error" style={{ padding: 14 }}>{error}</p> : null}
      <div className="feed">
        {posts.length === 0 ? (
          <p className="tagline" style={{ padding: 24 }}>
            아직 게시물이 없어요. 오늘의 한 장을 올려 보세요.
          </p>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="post-card">
              <div className="post-head">{p.author?.username ?? p.authorId}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="post-img" src={p.imageUri} alt="" />
              <div className="post-actions">
                <button type="button" onClick={() => void toggleLike(p.id)}>
                  {p.likedByMe ? '♥ 좋아요 취소' : '♡ 좋아요'} · {p.likeCount ?? 0}
                </button>
                <Link href={`/comments/${p.id}`}>댓글 {p.commentCount ?? 0}</Link>
              </div>
              <div className="post-meta">
                <div className="caption">
                  <strong>{p.author?.username}</strong> {p.caption}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      <AppNav active="feed" />
    </>
  );
}
