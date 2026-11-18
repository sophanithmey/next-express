'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, CreditCard, Radar } from 'lucide-react';
import { LandingSectionHeader } from './landing-section-header';
import { LandingBenefitCard } from './landing-benefit-card';

const STEPS = [
  {
    index: '01',
    icon: MapPin,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
  },
  {
    index: '02',
    icon: CreditCard,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
  },
  {
    index: '03',
    icon: Radar,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
  },
] as const;

export function LandingHowItWorks() {
  const t = useTranslations('Home.howItWorks');

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="py-12 sm:py-16 border-t border-slate-200/80"
    >
      <LandingSectionHeader
        id="how-it-works-heading"
        badge={t('badge')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {STEPS.map((item) => (
          <LandingBenefitCard
            key={item.index}
            index={item.index}
            icon={item.icon}
            title={t(item.titleKey)}
            description={t(item.descKey)}
          />
        ))}
      </div>
    </section>
  );
}
