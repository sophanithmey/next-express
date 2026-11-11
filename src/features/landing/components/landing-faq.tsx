'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
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
    <section className="py-12 border-t border-slate-200/80">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-secondary-700 bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary-200">
          <HelpCircle className="h-3 w-3 text-secondary-600" />
          <span>{t('badge')}</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {t('title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_KEYS.map((item, idx) => (
          <details
            key={item.q}
            open={idx === 0}
            className="group rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition open:border-secondary-200 open:shadow-xs"
          >
            <summary className="flex items-center justify-between gap-4 px-5 py-4 min-h-11 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500/30">
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-open:text-secondary-800 transition-colors leading-snug">
                {t(item.q)}
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 group-hover:bg-slate-100 group-open:bg-secondary-50 group-open:border-secondary-200 group-open:text-secondary-700 transition">
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
              </span>
            </summary>

            <div className="px-5 pb-4 pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
              {t(item.a)}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
        <PhoneCall className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
        <span>{t('supportPrompt')}</span>
        <a
          href={`tel:${APP_CONFIG.supportPhoneRaw}`}
          className="font-mono font-bold text-secondary-700 hover:underline"
        >
          {APP_CONFIG.supportPhone}
        </a>
      </div>
    </section>
  );
}
