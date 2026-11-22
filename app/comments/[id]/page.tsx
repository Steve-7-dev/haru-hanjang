'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/components/web/AuthProvider';
import { apiGet, apiPostJson } from '@/lib/client/api';

type CommentRow = {
  id: string;
  text: string;
  createdAt: string;
  author: { username: string; displayName: string };
};

export default function CommentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await apiGet<{ comments: CommentRow[] }>(`/api/posts/${postId}/comments`);
    setComments(data.comments);
  }, [postId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    void load().catch((err) => setError(err instanceof Error ? err.message : '실패'));
  }, [loading, user, router, load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiPostJson(`/api/posts/${postId}/comments`, { text });
      setText('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 실패');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <Link href="/feed">← 뒤로</Link>
        <h1>댓글</h1>
        <span />
      </header>
      <div className="page">
        {comments.map((c) => (
          <p key={c.id} style={{ margin: '0 0 10px', fontSize: 14 }}>
            <strong>{c.author.username}</strong> {c.text}
          </p>
        ))}
        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <input
            className="auth-input"
            placeholder="댓글 달기…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="auth-btn" type="submit" disabled={busy || !text.trim()}>
            게시
          </button>
        </form>
      </div>
    </>
  );
}
