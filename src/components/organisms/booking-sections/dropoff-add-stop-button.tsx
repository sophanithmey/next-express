'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DropoffAddStopButtonProps {
  onAddStop: () => void;
}

export function DropoffAddStopButton({ onAddStop }: DropoffAddStopButtonProps) {
  const t = useTranslations('Booking');

  return (
    <button
      type="button"
      onClick={onAddStop}
      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-brand-200 bg-brand-50/40 hover:bg-brand-50 text-xs font-bold text-brand-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
    >
      <Plus className="h-3.5 w-3.5 text-brand-600" />
      <span>{t('addAnother')}</span>
    </button>
  );
}
