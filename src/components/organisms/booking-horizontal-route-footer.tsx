'use client';

import React from 'react';
import { CodInfo } from '@/features/booking/types/booking-types';
import { DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingHorizontalRouteFooterProps {
  fee: number;
  cod: CodInfo;
}

export function BookingHorizontalRouteFooter({
  fee,
  cod,
}: BookingHorizontalRouteFooterProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  return (
    <div className="border-t border-slate-100 mt-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          {tBooking('estimatedFee')}
        </span>
        <span className="text-xl font-black text-slate-900 tracking-tight">
          ${fee.toFixed(2)}{' '}
          <span className="text-xs font-bold text-slate-400 font-sans">
            {tCommon('usd')}
          </span>
        </span>
      </div>

      {cod.isCod && cod.amount > 0 && (
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs self-start sm:self-auto">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            {tBooking('codCollection')}: ${cod.amount.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

