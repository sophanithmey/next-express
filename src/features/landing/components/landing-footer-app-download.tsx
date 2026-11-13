'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAppDownload } from '../hooks/use-app-download';
import { LandingFooterAppQr } from './landing-footer-app-qr';
import { LandingFooterStoreBadges } from './landing-footer-store-badges';

/**
 * Right-aligned footer app download column combining the header, QR pod,
 * and store badges.
 */
export function LandingFooterAppDownload() {
  const t = useTranslations('Footer');
  const { qrDataUrl, appDownloadUrl } = useAppDownload();

  return (
    <div className='lg:col-span-3'>
      <div className='w-fit max-w-full space-y-3.5 md:ml-auto'>
        {/* Header */}
        <div>
          <span className='block text-xs font-bold uppercase tracking-wider text-slate-900'>
            {t('appTitle')}
          </span>
          <span className='block text-[11px] text-slate-400 font-medium'>
            {t('appSubtitle')}
          </span>
        </div>

        {/* Viewfinder QR Pod & Store Badges */}
        <div className='flex items-center gap-3'>
          <LandingFooterAppQr
            qrDataUrl={qrDataUrl}
            appDownloadUrl={appDownloadUrl}
          />
          <LandingFooterStoreBadges appDownloadUrl={appDownloadUrl} />
        </div>
      </div>
    </div>
  );
}
