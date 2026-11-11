'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function LandingFooterBottom() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-[11px] text-slate-400 font-medium">
      <p>{t('copyright', { year: currentYear })}</p>
      <p>{t('allRightsReserved')}</p>
    </div>
  );
}
