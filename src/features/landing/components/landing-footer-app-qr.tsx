'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { QrCode } from 'lucide-react';

interface LandingFooterAppQrProps {
  qrDataUrl: string;
  appDownloadUrl: string;
}

/**
 * Modern minimalist QR pod with center Wingmall brand badge.
 */
export function LandingFooterAppQr({
  qrDataUrl,
  appDownloadUrl,
}: LandingFooterAppQrProps) {
  const t = useTranslations('Footer');

  return (
    <a
      href={appDownloadUrl}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={t('qrAria')}
      className='group relative shrink-0 flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white p-2 shadow-2xs hover:border-secondary-400 hover:shadow-xs transition-all cursor-pointer'
    >
      <div className='relative flex items-center justify-center rounded-lg bg-slate-50/70 p-1'>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={t('qrAlt')}
            width={76}
            height={76}
            className='h-[76px] w-[76px] rounded-xs object-contain transition-transform group-hover:scale-102'
          />
        ) : (
          <div className='h-[76px] w-[76px] rounded-xs bg-slate-100 animate-pulse' />
        )}

        {/* Center Wingmall Brand Badge */}
        <div className='pointer-events-none absolute flex h-5.5 w-5.5 items-center justify-center rounded-md bg-white p-0.5 shadow-2xs ring-1 ring-slate-200/80'>
          <img
            src='/apple-touch-icon.png'
            alt='Wingmall Logo'
            width={18}
            height={18}
            className='h-full w-full rounded-xs object-contain'
          />
        </div>
      </div>

      <span className='inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 group-hover:text-secondary-600 transition-colors'>
        <QrCode className='h-2.5 w-2.5 text-secondary-600' />
        <span>{t('scanMe')}</span>
      </span>
    </a>
  );
}
