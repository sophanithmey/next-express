'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Route,
  Banknote,
  Navigation,
  Link2,
  Camera,
  Headset,
} from 'lucide-react';
import { LandingSectionHeader } from './landing-section-header';
import { LandingBenefitCard } from './landing-benefit-card';

const BENEFITS = [
  {
    index: '01',
    icon: Route,
    titleKey: 'item1Title',
    descKey: 'item1Desc',
  },
  {
    index: '02',
    icon: Banknote,
    titleKey: 'item2Title',
    descKey: 'item2Desc',
  },
  {
    index: '03',
    icon: Navigation,
    titleKey: 'item3Title',
    descKey: 'item3Desc',
  },
  {
    index: '04',
    icon: Link2,
    titleKey: 'item4Title',
    descKey: 'item4Desc',
  },
  {
    index: '05',
    icon: Camera,
    titleKey: 'item5Title',
    descKey: 'item5Desc',
  },
  {
    index: '06',
    icon: Headset,
    titleKey: 'item6Title',
    descKey: 'item6Desc',
  },
] as const;

export function LandingBenefits() {
  const t = useTranslations('Home.benefits');

  return (
    <section
      aria-labelledby="why-sellers-heading"
      className="py-12 sm:py-16 border-t border-slate-200/80"
    >
      <LandingSectionHeader
        id="why-sellers-heading"
        badge={t('badge')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {BENEFITS.map((item) => (
          <LandingBenefitCard
            key={item.titleKey}
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
