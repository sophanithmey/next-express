'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';

interface LandingFooterStoreBadgesProps {
  appDownloadUrl: string;
}

interface StoreBadgeConfig {
  id: string;
  eyebrowKey: 'downloadOn' | 'getItOn';
  nameKey: 'appStore' | 'googlePlay';
  ariaKey: 'downloadOnAppStoreAria' | 'getItOnGooglePlayAria';
  icon: React.ReactNode;
}

const STORE_BADGES: StoreBadgeConfig[] = [
  {
    id: 'app-store',
    eyebrowKey: 'downloadOn',
    nameKey: 'appStore',
    ariaKey: 'downloadOnAppStoreAria',
    icon: (
      <svg
        className='h-4.5 w-4.5 shrink-0 text-white transition-transform group-hover:scale-110'
        viewBox='0 0 24 24'
        fill='currentColor'
        aria-hidden='true'
      >
        <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.19c.6-.73 1-1.75.89-2.77-.87.04-1.92.58-2.54 1.3-.55.64-.99 1.66-.86 2.67.97.08 1.93-.47 2.51-1.2z' />
      </svg>
    ),
  },
  {
    id: 'google-play',
    eyebrowKey: 'getItOn',
    nameKey: 'googlePlay',
    ariaKey: 'getItOnGooglePlayAria',
    icon: (
      <svg
        className='h-4 w-4 shrink-0 transition-transform group-hover:scale-110'
        viewBox='0 0 512 512'
        aria-hidden='true'
      >
        <path
          fill='#4285F4'
          d='M48.7 13.6c-5.7 6.1-9 15.3-9 26.8v431.2c0 11.5 3.3 20.7 9 26.8l1.4 1.3 241.6-241.6v-5.7L50.1 12.2l-1.4 1.4z'
        />
        <path
          fill='#FBBC04'
          d='M371.7 329.8l-80-80v-5.7l80-80 1.8 1 94.8 53.9c27.1 15.4 27.1 40.6 0 56l-94.8 53.8-1.8 1z'
        />
        <path
          fill='#EA4335'
          d='M291.7 244.1L48.7 487.1c8.9 9.5 23.6 10.6 39.9 1.4l283.1-160.8-80-83.6z'
        />
        <path
          fill='#34A853'
          d='M291.7 267.9l80-83.6L88.6 23.5C72.3 14.3 57.6 15.4 48.7 24.9l243 243z'
        />
      </svg>
    ),
  },
];

/**
 * Stacked content-fitted App Store and Google Play badges linking to OneLink.
 */
export function LandingFooterStoreBadges({
  appDownloadUrl,
}: LandingFooterStoreBadgesProps) {
  const t = useTranslations('Footer');

  return (
    <div className='w-fit max-w-full min-w-0 space-y-2.5'>
      {STORE_BADGES.map((badge) => (
        <a
          key={badge.id}
          href={appDownloadUrl}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={t(badge.ariaKey)}
          className='group flex min-h-11 items-center justify-between gap-3.5 rounded-xl bg-wing-dark px-3.5 py-2 text-white shadow-xs transition-all hover:bg-secondary-700 active:scale-95 cursor-pointer'
        >
          <div className='flex items-center gap-2.5 min-w-0'>
            {badge.icon}
            <div className='min-w-0'>
              <span className='block text-[9px] font-bold uppercase tracking-wider leading-tight text-slate-300'>
                {t(badge.eyebrowKey)}
              </span>
              <span className='mt-0.5 block truncate text-xs font-extrabold leading-tight text-white'>
                {t(badge.nameKey)}
              </span>
            </div>
          </div>
          <ArrowUpRight className='h-3.5 w-3.5 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-400' />
        </a>
      ))}
    </div>
  );
}
