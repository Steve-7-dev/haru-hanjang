'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/components/web/AuthProvider';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [loading, user, router]);

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <>
      <header className="topbar">
        <Link href="/profile">← 뒤로</Link>
        <h1>설정</h1>
        <span />
      </header>
      <div className="page">
        <p className="tagline" style={{ textAlign: 'left' }}>
          {user?.email}
        </p>
        <button className="auth-btn outline" type="button" onClick={() => void onLogout()}>
          로그아웃
        </button>
      </div>
    </>
  );
}
