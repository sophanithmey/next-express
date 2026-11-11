'use client';

import React, { useMemo } from 'react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { MOCK_BOOKING_DETAILS } from '@/features/booking/data/mock-booking-detail-data';
import { LandingAuthenticatedBanner } from './landing-authenticated-banner';
import { LandingHero } from './landing-hero';
import { LandingHowItWorks } from './landing-how-it-works';
import { LandingBenefits } from './landing-benefits';
import { LandingFaq } from './landing-faq';
import { LandingCta } from './landing-cta';

export function LandingPageClient() {
  const { isAuthenticated, user } = useAuthState();

  const recentBookings = useMemo(
    () => Object.values(MOCK_BOOKING_DETAILS).slice(0, 3),
    []
  );

  return (
    <div className="space-y-4">
      {/* Personalized banner if authenticated */}
      {isAuthenticated && (
        <LandingAuthenticatedBanner
          user={user}
          recentBookings={recentBookings}
        />
      )}

      {/* Main SaaS Hero */}
      <LandingHero />

      {/* Simple 3-step explanation */}
      <LandingHowItWorks />

      {/* Seller Benefits */}
      <LandingBenefits />

      {/* Seller FAQ Accordion */}
      <LandingFaq />

      {/* Primary Bottom Action */}
      <LandingCta />
    </div>
  );
}

