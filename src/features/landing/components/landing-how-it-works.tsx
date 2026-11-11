'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, CreditCard, Radar } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    icon: MapPin,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
  },
  {
    step: '2',
    icon: CreditCard,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
  },
  {
    step: '3',
    icon: Radar,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
  },
] as const;

export function LandingHowItWorks() {
  const t = useTranslations('Home.howItWorks');

  return (
    <section className="py-12 border-t border-slate-200/80">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-600 bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary-200">
          {t('badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {t('title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-secondary-600 border border-slate-100">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-black font-mono text-slate-200">
                  0{item.step}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                {t(item.titleKey)}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {t(item.descKey)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
