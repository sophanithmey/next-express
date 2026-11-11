'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Smartphone } from 'lucide-react';
import { useAppDownload } from '../hooks/use-app-download';
import { LandingFooterAppQr } from './landing-footer-app-qr';
import { LandingFooterStoreBadges } from './landing-footer-store-badges';
import { LandingFooterPaymentMethods } from './landing-footer-payment-methods';

/**
 * Right-aligned footer app download column combining the header, QR pod,
 * store badges, and accepted payment methods.
 */
export function LandingFooterAppDownload() {
  const t = useTranslations('Footer');
  const { qrDataUrl, appDownloadUrl } = useAppDownload();

  return (
    <div className='lg:col-span-4'>
      <div className='w-fit max-w-full space-y-4 md:ml-auto'>
        {/* Header matching sibling footer columns */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-600 text-white shadow-2xs ring-1 ring-secondary-500/20'>
              <Smartphone className='h-4.5 w-4.5 text-primary-400' />
            </div>
            <div className='min-w-0'>
              <span className='block truncate text-sm font-extrabold leading-tight text-slate-900'>
                {t('appTitle')}
              </span>
              <span className='block truncate text-[11px] font-medium text-slate-400'>
                {t('appSubtitle')}
              </span>
            </div>
          </div>
        </div>

        {/* Viewfinder QR Pod & Store Badges */}
        <div className='flex items-center justify-between gap-3.5'>
          <LandingFooterAppQr
            qrDataUrl={qrDataUrl}
            appDownloadUrl={appDownloadUrl}
          />
          <LandingFooterStoreBadges appDownloadUrl={appDownloadUrl} />
        </div>

        {/* Accepted Payment Methods */}
        <LandingFooterPaymentMethods />
      </div>
    </div>
  );
}
