'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Zap, CheckCircle2 } from 'lucide-react';

export function ReturningSellerCard() {
  const t = useTranslations('Home.instantAccess');

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600 border border-secondary-200/60">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-700 bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary-200">
            {t('existingBadge')}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
            {t('existingTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t('existingDesc')}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Step 1 */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary-600 text-white text-xs font-black">
              1
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">{t('existingStep1')}</p>
              <p className="text-[11px] text-slate-500 truncate">{t('existingStep1Desc')}</p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 shrink-0">+855</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary-600 text-white text-xs font-black">
              2
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">{t('existingStep2')}</p>
              <p className="text-[11px] text-slate-500 truncate">{t('existingStep2Desc')}</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 shrink-0">4-Digit PIN</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>{t('existingPerk')}</span>
      </div>
    </div>
  );
}
