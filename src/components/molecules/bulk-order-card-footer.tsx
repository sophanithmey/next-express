'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Route } from 'lucide-react';
import { MAX_STOPS_PER_BULK_ORDER } from '@/lib/constants';

interface BulkOrderCardFooterProps {
  stopsCount: number;
  isMaxStops: boolean;
  onAddStop: () => void;
  onOptimizeRoute: () => void;
}

/**
 * Bottom action toolbar inside an expanded BulkOrderCard (Add Stop + Optimize Route).
 */
export function BulkOrderCardFooter({
  stopsCount,
  isMaxStops,
  onAddStop,
  onOptimizeRoute,
}: BulkOrderCardFooterProps) {
  const tBooking = useTranslations('Booking');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-2.5">
      <button
        type="button"
        onClick={onAddStop}
        disabled={isMaxStops}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>
          {isMaxStops
            ? tBooking('maxStopsReached', { max: MAX_STOPS_PER_BULK_ORDER })
            : tBooking('bulkAddStopToOrder', {
                current: stopsCount,
                max: MAX_STOPS_PER_BULK_ORDER,
              })}
        </span>
      </button>

      {stopsCount > 1 && (
        <button
          type="button"
          onClick={onOptimizeRoute}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer shadow-2xs"
          title={tBooking('optimizeRouteTitle')}
        >
          <Route className="h-3.5 w-3.5 text-amber-600" />
          <span>{tBooking('optimizeRoute')}</span>
        </button>
      )}
    </div>
  );
}
