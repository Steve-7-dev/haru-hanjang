'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { IgAuthShell } from '@/components/web/IgShell';
import { useAuth } from '@/components/web/AuthProvider';
import { apiPostJson, type ApiUser } from '@/lib/client/api';

export default function RegisterPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/feed');
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (!email.includes('@')) {
        setError('올바른 이메일을 입력해 주세요.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (password.length < 8) {
        setError('비밀번호는 8자 이상이어야 해요.');
        return;
      }
      setStep(3);
      return;
    }
    setBusy(true);
    try {
      const data = await apiPostJson<{ user: ApiUser }>('/api/auth/register', {
        email,
        password,
        username,
        displayName: displayName || username,
      });
      setUser(data.user);
      router.replace('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : '가입에 실패했어요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <IgAuthShell
      secondary={
        <>
          이미 계정이 있나요? <Link href="/login">로그인</Link>
        </>
      }
    >
      <p className="tagline">친구들의 사진과 동영상을 보려면 가입하세요.</p>
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <p className="field-label">단계 {step} / 3</p>
        {step === 1 ? (
          <input
            className="auth-input"
            placeholder="이메일"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : null}
        {step === 2 ? (
          <input
            className="auth-input"
            placeholder="비밀번호"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : null}
        {step === 3 ? (
          <>
            <input
              className="auth-input"
              placeholder="유저네임"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="auth-input"
              placeholder="이름"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </>
        ) : null}
        {error ? <p className="auth-error">{error}</p> : null}
        <button
          className="auth-btn"
          type="submit"
          disabled={busy || (step === 3 && !username)}
        >
          {step < 3 ? '다음' : busy ? '가입 중…' : '가입하기'}
        </button>
        {step > 1 ? (
          <button
            className="auth-btn outline"
            type="button"
            onClick={() => {
              setError('');
              setStep((s) => s - 1);
            }}
          >
            뒤로
          </button>
        ) : null}
      </form>
    </IgAuthShell>
  );
}
