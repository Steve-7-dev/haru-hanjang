'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/components/web/AuthProvider';
import { AppNav } from '@/components/web/IgShell';

/** Explore reuses the public feed for MVP. */
export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else router.replace('/feed');
  }, [loading, user, router]);

  return (
    <>
      <div className="auth-root">
        <p className="tagline">탐색으로 이동 중…</p>
      </div>
      <AppNav active="explore" />
    </>
  );
}
