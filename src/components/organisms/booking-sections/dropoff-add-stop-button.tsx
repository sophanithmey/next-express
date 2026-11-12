'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DropoffAddStopButtonProps {
  onAddStop: () => void;
  disabled?: boolean;
  maxStops?: number;
}

export function DropoffAddStopButton({
  onAddStop,
  disabled = false,
  maxStops = 5,
}: DropoffAddStopButtonProps) {
  const t = useTranslations('Booking');

  return (
    <button
      type="button"
      onClick={onAddStop}
      disabled={disabled}
      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-brand-200 bg-brand-50/40 hover:bg-brand-50 text-xs font-bold text-brand-700 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
    >
      {!disabled && <Plus className="h-3.5 w-3.5 text-brand-600" />}
      <span>
        {disabled ? t('maxStopsReached', { max: maxStops }) : t('addAnother')}
      </span>
    </button>
  );
}
