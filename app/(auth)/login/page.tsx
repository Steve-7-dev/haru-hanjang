'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { IgAuthShell } from '@/components/web/IgShell';
import { useAuth } from '@/components/web/AuthProvider';
import { apiPostJson, type ApiUser } from '@/lib/client/api';

export default function LoginPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/feed');
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await apiPostJson<{ user: ApiUser }>('/api/auth/login', { email, password });
      setUser(data.user);
      router.replace('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했어요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <IgAuthShell
      secondary={
        <>
          계정이 없으신가요? <Link href="/register">새 계정 만들기</Link>
        </>
      }
    >
      <p className="tagline">One photo a day.</p>
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <input
          className="auth-input"
          placeholder="이메일"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          placeholder="비밀번호"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="auth-error">{error}</p> : null}
        <button className="auth-btn" type="submit" disabled={busy || !email || !password}>
          {busy ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </IgAuthShell>
  );
}
