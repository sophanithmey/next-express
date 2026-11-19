import React from 'react';
import { useTranslations } from 'next-intl';
import { LandingSectionHeader } from './landing-section-header';
import { ReturningSellerCard } from './returning-seller-card';
import { NewSellerCard } from './new-seller-card';
import { AuthFlowBookingBanner } from './auth-flow-booking-banner';

/**
 * Informational onboarding explainer educating sellers on the frictionless authentication flow.
 * Reinforces the core value proposition: "Book First, Verify in Seconds".
 */
export function LandingInstantAccess() {
  const t = useTranslations('Home.instantAccess');

  return (
    <section
      aria-labelledby="instant-access-heading"
      className="py-12 sm:py-16 border-t border-slate-200/80"
    >
      {/* Centered Hero Section Header */}
      <LandingSectionHeader
        id="instant-access-heading"
        badge={t('badge')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Two Comparison Cards side-by-side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <ReturningSellerCard />
        <NewSellerCard />
      </div>

      {/* Booking-First Highlight Banner beneath cards */}
      <div className="mt-8">
        <AuthFlowBookingBanner />
      </div>
    </section>
  );
}
