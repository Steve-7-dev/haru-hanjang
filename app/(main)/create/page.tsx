'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { useAuth } from '@/components/web/AuthProvider';
import { AppNav } from '@/components/web/IgShell';
import { apiPostForm, type ApiPost } from '@/lib/client/api';

export default function CreatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('사진을 선택해 주세요.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('caption', caption);
      await apiPostForm<{ post: ApiPost }>('/api/posts/today', form);
      setDone(true);
      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했어요.');
    } finally {
      setBusy(false);
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
        <h1>오늘의 한 장</h1>
      </header>
      <div className="page">
        <p className="tagline" style={{ textAlign: 'left' }}>
          하루에 한 장만 올릴 수 있어요. 다시 올리면 오늘 사진이 교체됩니다.
        </p>
        <form onSubmit={onSubmit}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              style={{ width: '100%', marginTop: 12, borderRadius: 8, aspectRatio: '1', objectFit: 'cover' }}
            />
          ) : null}
          <textarea
            className="auth-input"
            style={{ marginTop: 12, minHeight: 80, resize: 'vertical' }}
            placeholder="캡션"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          {error ? <p className="auth-error">{error}</p> : null}
          {done ? <p className="tagline">올렸어요!</p> : null}
          <button className="auth-btn" type="submit" disabled={busy || !file}>
            {busy ? '올리는 중…' : '게시'}
          </button>
        </form>
      </div>
      <AppNav active="create" />
    </>
  );
}
