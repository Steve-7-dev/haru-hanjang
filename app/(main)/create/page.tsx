'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/web/AuthProvider';
import { AppNav } from '@/components/web/IgShell';
import {
  apiGet,
  apiPostForm,
  apiPostJson,
  type ApiPost,
  type TodayStatus,
} from '@/lib/client/api';
import { formatKstDateTime } from '@/lib/client/time';

export default function CreatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    const data = await apiGet<TodayStatus>('/api/posts/today');
    setStatus(data);
    setCaption(data.post?.caption ?? '');
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : '오늘 상태를 불러오지 못했어요.'),
    );
  }, [loading, user, router, load]);

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
    if (!status?.canUpload && !status?.canEdit) {
      setError('오늘은 더 이상 올리거나 수정할 수 없어요.');
      return;
    }
    if (!file && !status?.post) {
      setError('사진을 선택해 주세요.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (!file && !status?.post) {
        setError('사진을 선택해 주세요.');
        setBusy(false);
        return;
      }
      const form = new FormData();
      if (file) form.append('image', file);
      form.append('caption', caption);
      await apiPostForm<{ post: ApiPost }>('/api/posts/today', form);
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했어요.');
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    setBusy(true);
    setError('');
    setConfirmOpen(false);
    try {
      await apiPostJson('/api/posts/today/confirm', {});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '확정에 실패했어요.');
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!window.confirm('오늘 사진을 삭제할까요?')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/posts/today', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || '삭제 실패');
      setFile(null);
      setPreview(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했어요.');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user || !status) {
    return (
      <div className="auth-root">
        <p className="tagline">불러오는 중…</p>
      </div>
    );
  }

  const lockedNoPost = status.locked && !status.post;
  const showEditor = status.canUpload || status.canEdit;
  const imageSrc = preview || status.post?.imageUri || null;
  const uploadedLabel = status.post
    ? status.post.createdAtLabel || formatKstDateTime(status.post.createdAt)
    : null;

  return (
    <>
      <header className="topbar">
        <h1>오늘의 한 장</h1>
      </header>
      <div className="page">
        {lockedNoPost ? (
          <p className="tagline" style={{ textAlign: 'left' }}>
            오늘 사진을 확정한 뒤 삭제했어요. 오늘은 다시 올릴 수 없습니다.
          </p>
        ) : (
          <p className="tagline" style={{ textAlign: 'left' }}>
            {status.post?.confirmed
              ? '확정됨 — 수정·재업로드 불가. 삭제는 가능합니다.'
              : '하루에 한 장만 올릴 수 있어요. 확정 전에는 수정할 수 있습니다.'}
          </p>
        )}

        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            style={{ width: '100%', borderRadius: 8, aspectRatio: '1', objectFit: 'cover' }}
          />
        ) : null}

        {uploadedLabel ? (
          <p className="tagline" style={{ textAlign: 'left', marginTop: 8 }}>
            업로드 {uploadedLabel}
            {status.post?.confirmed ? ' · 확정됨' : ''}
          </p>
        ) : null}

        {showEditor ? (
          <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <textarea
              className="auth-input"
              style={{ marginTop: 12, minHeight: 80, resize: 'vertical' }}
              placeholder="캡션"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <button
              className="auth-btn"
              type="submit"
              disabled={busy || (!file && !status.post)}
            >
              {busy ? '저장 중…' : status.post ? (file ? '사진 교체·저장' : '캡션 저장') : '게시'}
            </button>
          </form>
        ) : null}

        {status.canConfirm ? (
          <button
            className="auth-btn"
            type="button"
            style={{ marginTop: 10 }}
            disabled={busy}
            onClick={() => setConfirmOpen(true)}
          >
            오늘의 사진 확정
          </button>
        ) : null}

        {status.canDelete ? (
          <button
            className="auth-btn outline"
            type="button"
            style={{ marginTop: 10 }}
            disabled={busy}
            onClick={() => void onDelete()}
          >
            삭제
          </button>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}
      </div>

      {confirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              maxWidth: 320,
              width: '100%',
            }}
          >
            <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.45 }}>
              확정하면 수정·재업로드 불가
            </p>
            <button className="auth-btn" type="button" disabled={busy} onClick={() => void onConfirm()}>
              확정하기
            </button>
            <button
              className="auth-btn outline"
              type="button"
              style={{ marginTop: 8 }}
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </button>
          </div>
        </div>
      ) : null}

      <AppNav active="create" />
    </>
  );
}
