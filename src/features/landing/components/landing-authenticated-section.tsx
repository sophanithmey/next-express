'use client';

import dynamic from 'next/dynamic';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';

const LandingAuthenticatedBanner = dynamic(
  () =>
    import('./landing-authenticated-banner').then(
      (mod) => mod.LandingAuthenticatedBanner,
    ),
  { ssr: false },
);

export function LandingAuthenticatedSection() {
  const { isAuthenticated, user } = useAuthState();

  if (!isAuthenticated || !user) {
    return null;
  }

  return <LandingAuthenticatedBanner user={user} recentBookings={[]} />;
}
