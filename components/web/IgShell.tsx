import type { ReactNode } from 'react';
import Link from 'next/link';

export function IgAuthShell({
  children,
  secondary,
}: {
  children: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="auth-root">
      <div style={{ width: '100%', maxWidth: 350 }}>
        <div className="auth-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-mark" src="/brand-mark.png" alt="One Day One Shot" />
          <h1 className="wordmark">One Day One Shot</h1>
          {children}
        </div>
        {secondary ? <div className="auth-secondary">{secondary}</div> : null}
        <p className="auth-footer" style={{ textAlign: 'center' }}>
          One Day One Shot
        </p>
      </div>
    </div>
  );
}

export function AppNav({ active }: { active: 'feed' | 'create' | 'explore' | 'profile' }) {
  return (
    <nav className="nav">
      <Link href="/feed" className={active === 'feed' ? 'active' : ''}>
        홈
      </Link>
      <Link href="/explore" className={active === 'explore' ? 'active' : ''}>
        탐색
      </Link>
      <Link href="/create" className={active === 'create' ? 'active' : ''}>
        업로드
      </Link>
      <Link href="/profile" className={active === 'profile' ? 'active' : ''}>
        프로필
      </Link>
    </nav>
  );
}
