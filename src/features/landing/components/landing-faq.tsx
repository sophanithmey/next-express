'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

const FAQ_KEYS = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
  { q: 'q4', a: 'a4' },
  { q: 'q5', a: 'a5' },
  { q: 'q6', a: 'a6' },
] as const;

export function LandingFaq() {
  const t = useTranslations('Home.faq');

  return (
    <section id="faq" className="py-8 sm:py-12">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-12 lg:p-16 shadow-xs">
        {/* Header (Centered like other landing sections) */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200/70">
            {t('badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed pt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* 3-Column FAQ Grid (2 rows x 3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-8 sm:gap-y-10 mt-10 sm:mt-12 lg:mt-14">
          {FAQ_KEYS.map((item) => (
            <div key={item.q} className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                {t(item.q)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {t(item.a)}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Contact Callout Banner */}
        <div className="mt-12 sm:mt-16 rounded-2xl bg-slate-50 border border-slate-200/70 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {t('stillHaveQuestionsTitle')}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('stillHaveQuestionsSubtitle')}
            </p>
          </div>

          <a
            href={`tel:${APP_CONFIG.supportPhoneRaw}`}
            title={`Call ${APP_CONFIG.supportPhone} (Daily 06:00 AM - 09:00 PM)`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary-600 hover:bg-secondary-700 active:scale-95 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 shadow-xs transition shrink-0 cursor-pointer"
          >
            <span>{t('contactUsCta')}</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
