import React from 'react';
import { sessionService } from '@/server/auth/session-service';
import { HomeHeader } from '@/components/organisms/home-header';
import { HomeHero } from '@/components/organisms/home-hero';
import { HomeFeatures } from '@/components/organisms/home-features';
import { HomeFooter } from '@/components/organisms/home-footer';

export default async function HomePage() {
  const user = await sessionService.getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomeHeader user={user} />
      <main className="flex-1">
        <HomeHero isAuthenticated={Boolean(user)} />
        <HomeFeatures />
      </main>
      <HomeFooter />
    </div>
  );
}
