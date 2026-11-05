import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import { sessionService } from '@/server/auth/session-service';

export const metadata: Metadata = {
  title: 'WingExpress — High-Speed Delivery Platform',
  description:
    'Fast, modern delivery booking and management for online merchants and sellers',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await sessionService.getCurrentUser().catch(() => null);

  return (
    <html lang='en'>
      <body className='min-h-screen bg-slate-50 antialiased'>
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
