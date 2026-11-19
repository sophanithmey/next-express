'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, MousePointerClick } from 'lucide-react';

/**
 * Prominent informational banner emphasizing the core "Book First, Verify Later" product principle.
 */
export function AuthFlowBookingBanner() {
  const t = useTranslations('Home.instantAccess');

  return (
    <div className='relative overflow-hidden rounded-2xl border border-secondary-200/90 bg-linear-to-r from-secondary-50/80 via-blue-50/40 to-slate-50/70 p-5 sm:p-6 shadow-2xs'>
      <div className='flex items-start gap-4'>
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-600 text-white shadow-2xs'>
          <ShieldCheck className='h-5 w-5 sm:h-6 sm:w-6' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h3 className='text-base sm:text-lg font-bold text-slate-900 tracking-tight'>
              {t('bannerTitle')}
            </h3>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-secondary-200/80 bg-white/90 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-secondary-700 shadow-2xs'>
              <MousePointerClick className='h-3 w-3 text-secondary-600' />
              <span>{t('badge')}</span>
            </span>
          </div>
          <p className='mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-5xl'>
            {t('bannerDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
