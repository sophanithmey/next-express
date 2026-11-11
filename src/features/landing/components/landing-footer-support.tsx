'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PhoneCall, Clock, Headphones } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export function LandingFooterSupport() {
  const t = useTranslations('Footer');

  return (
    <div className='lg:col-span-4'>
      <div className='w-fit max-w-full space-y-4 lg:mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-600 text-white shadow-2xs ring-1 ring-secondary-500/20'>
              <Headphones className='h-4.5 w-4.5 text-primary-400' />
            </div>
            <div>
              <span className='text-sm font-extrabold text-slate-900 block leading-tight'>
                {t('supportTitle')}
              </span>
              <span className='text-[11px] text-slate-400 font-medium'>
                {t('supportSubtitle')}
              </span>
            </div>
          </div>
        </div>

        {/* Support Hotline Channel */}
        <div className='space-y-3 pt-1'>
          <a
            href={`tel:${APP_CONFIG.supportPhoneRaw}`}
            aria-label={t('callHotlineAria', { phone: APP_CONFIG.supportPhone })}
            className='group flex items-center justify-between py-1 transition cursor-pointer'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-secondary-600 shadow-2xs group-hover:border-secondary-500 group-hover:bg-secondary-50 group-hover:text-secondary-700 transition'>
                <PhoneCall className='h-4.5 w-4.5' />
              </div>
              <div>
                <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
                  {t('hotline')}
                </span>
                <span className='font-mono text-base font-black text-slate-900 group-hover:text-secondary-600 transition tracking-tight'>
                  {APP_CONFIG.supportPhone}
                </span>
              </div>
            </div>
          </a>

          {/* Operating Hours */}
          <div className='flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium'>
            <Clock className='h-3.5 w-3.5 text-slate-400 shrink-0' />
            <span>{t('operatingHours')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
