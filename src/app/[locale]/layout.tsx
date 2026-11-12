import type { Metadata } from 'next';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, Locale } from '@/i18n/routing';
import { QueryProvider } from '@/lib/query/query-provider';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import { authServerService } from '@/server/services/auth-server-service';
import { AppHeader } from '@/components/organisms/app-header';
import { ToastProvider } from '@/components/atoms/toast-provider';

export const metadata: Metadata = {
  title: 'WingExpress — High-Speed Delivery Platform',
  description:
    'Fast, modern delivery booking and management for online merchants and sellers',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const user = await authServerService.getCurrentUser().catch(() => null);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-50 antialiased flex flex-col font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <QueryProvider>
            <AuthProvider initialUser={user}>
              <AppHeader user={user} />
              {children}
              <ToastProvider />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
