'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { ReturningSellerCard } from './returning-seller-card';
import { NewSellerCard } from './new-seller-card';

export function LandingInstantAccess() {
  const t = useTranslations('Home.instantAccess');

  return (
    <section className="py-12 border-t border-slate-200/80">
      {/* Header matching Why Sellers Choose Wing Express */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-700 bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary-200">
          {t('badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {t('title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('subtitle')}
        </p>
      </div>

      {/* Cards Grid matching full container width of other sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReturningSellerCard />
        <NewSellerCard />
      </div>

      {/* Bottom Note */}
      <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
        <Info className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
        <span>{t('bottomNote')}</span>
      </div>
    </section>
  );
}
