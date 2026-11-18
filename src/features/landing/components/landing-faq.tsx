'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

const STANDARD_FAQ_KEYS = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
] as const;

const PROHIBITED_ITEM_KEYS = [
  'prohibitedItem1',
  'prohibitedItem2',
  'prohibitedItem3',
  'prohibitedItem4',
  'prohibitedItem5',
  'prohibitedItem6',
  'prohibitedItem7',
  'prohibitedItem8',
  'prohibitedItem9',
  'prohibitedItem10',
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

        {/* 3-Column Row for concise FAQs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 lg:gap-x-10 gap-y-8 mt-10 sm:mt-12 lg:mt-14">
          {STANDARD_FAQ_KEYS.map((item) => (
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

        {/* Full-Width Prohibited Items FAQ with 2-column scannable list */}
        <div className="mt-8 sm:mt-10 pt-8 border-t border-slate-200/80 space-y-3">
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
              {t('q4')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t('a4')}
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 pt-1">
            {PROHIBITED_ITEM_KEYS.map((itemKey) => (
              <li
                key={itemKey}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"
                />
                <span>{t(itemKey)}</span>
              </li>
            ))}
          </ul>
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
            title={`Call ${APP_CONFIG.supportPhone} (Daily 06:00 AM - 09:30 PM)`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 hover:bg-primary-400 active:scale-95 text-slate-950 text-xs sm:text-sm font-bold px-6 py-2.5 shadow-xs transition shrink-0 cursor-pointer"
          >
            <span>{t('contactUsCta')}</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
