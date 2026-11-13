'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LandingFooterSocialLinks } from './landing-footer-social-links';

export function LandingFooterBottom() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-500 font-medium'>
      <div className='flex flex-wrap items-center gap-1.5 text-slate-400'>
        <p>{t('copyright', { year: currentYear })}</p>
        <p>{t('allRightsReserved')}</p>
      </div>

      <LandingFooterSocialLinks />
    </div>
  );
}
