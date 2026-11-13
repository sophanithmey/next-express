'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PhoneCall } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export function LandingFooterSupport() {
  const t = useTranslations('Footer');

  return (
    <div className='lg:col-span-3'>
      <div className='w-fit max-w-full space-y-3.5 lg:mx-auto'>
        {/* Header */}
        <div>
          <span className='block text-xs font-bold uppercase tracking-wider text-slate-900'>
            {t('supportTitle')}
          </span>
          <span className='block text-[11px] text-slate-400 font-medium'>
            {t('supportSubtitle')}
          </span>
        </div>

        {/* Support Hotline Channel */}
        <div className='space-y-2.5'>
          <a
            href={`tel:${APP_CONFIG.supportPhoneRaw}`}
            aria-label={t('callHotlineAria', { phone: APP_CONFIG.supportPhone })}
            className='group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs hover:border-secondary-400 hover:shadow-xs transition-all cursor-pointer'
          >
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-600 text-white group-hover:bg-secondary-700 transition'>
              <PhoneCall className='h-4 w-4 text-primary-400' />
            </div>
            <div>
              <span className='text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight'>
                {t('hotline')}
              </span>
              <span className='text-sm font-black text-slate-900 group-hover:text-secondary-600 transition tracking-tight'>
                {APP_CONFIG.supportPhone}
              </span>
            </div>
          </a>

          {/* Operating Hours with Live Status Dot */}
          <div className='flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-0.5'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500' />
            </span>
            <span>{t('operatingHours')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
