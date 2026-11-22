import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/components/web/AuthProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'One Day One Shot',
  description: 'One photo a day.',
  applicationName: 'One Day One Shot',
  appleWebApp: {
    capable: true,
    title: 'OneDayOneShot',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <div className="app-shell">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
