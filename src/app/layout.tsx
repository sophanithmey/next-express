import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}

