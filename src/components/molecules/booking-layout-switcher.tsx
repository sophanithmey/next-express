'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlignJustify, Columns3 } from 'lucide-react';

export type BookingLayoutMode = 'vertical' | 'horizontal';

interface BookingLayoutSwitcherProps {
  mode: BookingLayoutMode;
  onChange: (mode: BookingLayoutMode) => void;
}

export function BookingLayoutSwitcher({
  mode,
  onChange,
}: BookingLayoutSwitcherProps) {
  const t = useTranslations('Booking');

  return (
    <div
      role="radiogroup"
      aria-label={t('layoutViewAria')}
      className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 shadow-2xs"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'vertical'}
        onClick={() => onChange('vertical')}
        title={t('layoutClassicTitle')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer select-none ${
          mode === 'vertical'
            ? 'bg-white text-secondary-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <AlignJustify className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t('layoutClassic')}</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === 'horizontal'}
        onClick={() => onChange('horizontal')}
        title={t('layoutStandardTitle')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer select-none ${
          mode === 'horizontal'
            ? 'bg-white text-secondary-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <Columns3 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t('layoutStandard')}</span>
      </button>
    </div>
  );
}
