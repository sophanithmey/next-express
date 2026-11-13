'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UserPlus, CheckCircle2 } from 'lucide-react';

export function NewSellerCard() {
  const t = useTranslations('Home.instantAccess');

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60">
            <UserPlus className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            {t('newBadge')}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
            {t('newTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t('newDesc')}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Step 1 */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white text-xs font-black">
              1
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">{t('newStep1')}</p>
              <p className="text-[11px] text-slate-500 truncate">{t('newStep1Desc')}</p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 shrink-0">Mobile</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white text-xs font-black">
              2
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">{t('newStep2')}</p>
              <p className="text-[11px] text-slate-500 truncate">{t('newStep2Desc')}</p>
            </div>
            <span className="text-[11px] font-semibold text-secondary-600 shrink-0">SMS OTP</span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white text-xs font-black">
              3
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">{t('newStep3')}</p>
              <p className="text-[11px] text-slate-500 truncate">{t('newStep3Desc')}</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 shrink-0">Ready</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>{t('newPerk')}</span>
      </div>
    </div>
  );
}
