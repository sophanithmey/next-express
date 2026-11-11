import React from 'react';
import { getTranslations } from 'next-intl/server';
import { LandingPageClient } from '@/features/landing/components/landing-page-client';
import { LandingFooter } from '@/features/landing/components/landing-footer';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 antialiased font-sans">
      {/* Main Landing Content */}
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <LandingPageClient />
        </div>
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
