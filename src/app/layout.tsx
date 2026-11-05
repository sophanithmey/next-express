import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/auth/components/auth-provider';

export const metadata: Metadata = {
  title: 'Express Seller — High-Speed Delivery Platform',
  description: 'Fast, modern delivery booking and management for online merchants and sellers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
