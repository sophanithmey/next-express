'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export function LandingCta() {
  const t = useTranslations('Home.ctaSection');

  return (
    <section className="py-12 sm:py-16">
      <div className="rounded-3xl border border-secondary-200 bg-secondary-50/70 p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xs space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-secondary-800 shadow-2xs border border-secondary-200">
          <Truck className="h-3.5 w-3.5 text-secondary-600" />
          <span>{t('badge')}</span>
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            {t('title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/booking"
            prefetch={true}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-600 px-8 py-4 text-sm font-bold text-white shadow-md hover:bg-secondary-700 hover:shadow-lg transition active:scale-[0.99]"
          >
            <span>{t('button')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
          <ShieldCheck className="h-4 w-4 text-secondary-600 shrink-0" />
          <span>{t('trustNote')}</span>
        </div>
      </div>
    </section>
  );
}
