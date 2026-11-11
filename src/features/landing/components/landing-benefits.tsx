'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Send, Banknote, History, Repeat } from 'lucide-react';

const BENEFITS = [
  {
    icon: Send,
    titleKey: 'item1Title',
    descKey: 'item1Desc',
  },
  {
    icon: Banknote,
    titleKey: 'item2Title',
    descKey: 'item2Desc',
  },
  {
    icon: History,
    titleKey: 'item3Title',
    descKey: 'item3Desc',
  },
  {
    icon: Repeat,
    titleKey: 'item4Title',
    descKey: 'item4Desc',
  },
] as const;

export function LandingBenefits() {
  const t = useTranslations('Home.benefits');

  return (
    <section className="py-12 border-t border-slate-200/80">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
          {t('badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {t('title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BENEFITS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.titleKey}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition space-y-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-brand-600 border border-slate-100">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                {t(item.titleKey)}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t(item.descKey)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
