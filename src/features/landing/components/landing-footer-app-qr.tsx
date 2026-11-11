'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { QrCode } from 'lucide-react';

interface LandingFooterAppQrProps {
  qrDataUrl: string;
  appDownloadUrl: string;
}

const VIEWFINDER_CORNERS = [
  '-top-0.5 -left-0.5 rounded-tl-md border-t-2 border-l-2 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5',
  '-top-0.5 -right-0.5 rounded-tr-md border-t-2 border-r-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
  '-bottom-0.5 -left-0.5 rounded-bl-md border-b-2 border-l-2 group-hover:-translate-x-0.5 group-hover:translate-y-0.5',
  '-bottom-0.5 -right-0.5 rounded-br-md border-b-2 border-r-2 group-hover:translate-x-0.5 group-hover:translate-y-0.5',
] as const;

/**
 * Clickable QR viewfinder pod with animated corner brackets and Wingmall badge overlay.
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
      className='group relative shrink-0 flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-2 shadow-2xs transition-all hover:border-secondary-300 hover:bg-white cursor-pointer'
    >
      <div className='relative p-1'>
        {VIEWFINDER_CORNERS.map((cornerClass, index) => (
          <span
            key={index}
            className={`pointer-events-none absolute h-3 w-3 border-secondary-600 transition-all duration-200 group-hover:border-primary-500 ${cornerClass}`}
            aria-hidden='true'
          />
        ))}

        <div className='relative flex items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-slate-100'>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={t('qrAlt')}
              width={80}
              height={80}
              className='h-20 w-20 rounded-xs object-contain transition-transform duration-200 group-hover:scale-105'
            />
          ) : (
            <div className='h-20 w-20 rounded-xs bg-slate-100 animate-pulse' />
          )}

          {/* Center Wingmall Brand Badge */}
          <div className='pointer-events-none absolute flex h-6 w-6 items-center justify-center rounded-md bg-white p-0.5 shadow-xs ring-1 ring-slate-200'>
            <img
              src='/apple-touch-icon.png'
              alt='Wingmall Logo'
              width={20}
              height={20}
              className='h-full w-full rounded-xs object-contain'
            />
          </div>
        </div>
      </div>

      <span className='inline-flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-wing-dark shadow-2xs'>
        <QrCode className='h-2.5 w-2.5' />
        {t('scanMe')}
      </span>
    </a>
  );
}
