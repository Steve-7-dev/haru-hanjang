'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/web/AuthProvider';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/feed' : '/login');
  }, [loading, user, router]);

  return (
    <div className="auth-root">
      <p className="tagline">불러오는 중…</p>
    </div>
  );
}
