'use client';

import React from 'react';
import { CircleDot, PackagePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingHorizontalRouteHeaderProps {
  isReady: boolean;
}

export function BookingHorizontalRouteHeader({
  isReady,
}: BookingHorizontalRouteHeaderProps) {
  const tBooking = useTranslations('Booking');

  return (
    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
      <div className="flex items-center gap-2">
        <PackagePlus className="h-4 w-4 text-brand-600" />
        <span className="text-xs font-black tracking-wider text-slate-800 uppercase">
          {tBooking('routePreview')}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
            isReady
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <CircleDot className="h-2.5 w-2.5 shrink-0" />
          <span>{isReady ? tBooking('readyToBook') : tBooking('needsDetails')}</span>
        </span>
      </div>
    </div>
  );
}

