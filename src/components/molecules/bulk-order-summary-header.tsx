'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface BulkOrderSummaryHeaderProps {
  isReady: boolean;
}

export function BulkOrderSummaryHeader({ isReady }: BulkOrderSummaryHeaderProps) {
  const tBooking = useTranslations('Booking');

  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 pt-4 pb-3 bg-white">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
        {tBooking('bulkSummaryTitle')}
      </h3>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isReady
            ? 'text-primary-950 bg-primary-100/90 border-primary-300'
            : 'text-amber-800 bg-amber-50 border-amber-200'
        }`}
      >
        {isReady ? tBooking('readyToBook') : tBooking('needsDetails')}
      </span>
    </div>
  );
}
