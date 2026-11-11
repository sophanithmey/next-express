'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { HelpCircle, PhoneCall } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

const HELP_STEPS = [
  { step: 1, titleKey: 'helpStep1Title', descKey: 'helpStep1Desc' },
  { step: 2, titleKey: 'helpStep2Title', descKey: 'helpStep2Desc' },
  { step: 3, titleKey: 'helpStep3Title', descKey: 'helpStep3Desc' },
] as const;

export function GuestHelpCard() {
  const t = useTranslations('Booking');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <HelpCircle className="h-4 w-4 text-brand-600 shrink-0" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {t('helpTitle')}
        </h3>
      </div>

      <div className="space-y-2.5 text-xs text-slate-600">
        {HELP_STEPS.map((item) => (
          <div key={item.step} className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
              {item.step}
            </span>
            <div>
              <strong className="text-slate-900 block font-semibold">
                {t(item.titleKey)}
              </strong>
              <span className="text-[11px] text-slate-500">
                {t(item.descKey)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
          <span className="text-[11px] font-medium">{t('merchantHotlineLabel')}</span>
        </div>
        <a
          href={`tel:${APP_CONFIG.supportPhoneRaw}`}
          className="font-mono font-bold text-slate-900 hover:text-secondary-700 transition"
        >
          {APP_CONFIG.supportPhone}
        </a>
      </div>
    </div>
  );
}
