import React from 'react';
import { getTranslations } from 'next-intl/server';
import { LandingAuthenticatedSection } from '@/features/landing/components/landing-authenticated-section';
import { LandingHero } from '@/features/landing/components/landing-hero';
import { LandingHowItWorks } from '@/features/landing/components/landing-how-it-works';
import { LandingBenefits } from '@/features/landing/components/landing-benefits';
import { LandingFaq } from '@/features/landing/components/landing-faq';
import { LandingInstantAccess } from '@/features/landing/components/landing-instant-access';
import { LandingCta } from '@/features/landing/components/landing-cta';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { buildPageSeoMetadata } from '@/lib/seo';
import { routing } from '@/i18n/routing';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  return buildPageSeoMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 antialiased font-sans">
      {/* Main Landing Content rendered as Server Components */}
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <LandingAuthenticatedSection />
          <LandingHero />
          <LandingHowItWorks />
          <LandingBenefits />
          <LandingFaq />
          <LandingInstantAccess />
          <LandingCta />
        </div>
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
