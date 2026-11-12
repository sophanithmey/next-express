'use client';

import React from 'react';
import { MapPin, Navigation, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { BookingSuccessStopsList } from './booking-success-stops-list';

interface BookingSuccessRouteTimelineProps {
  pickup: string;
  dropoff: string;
  recipient: string;
  stops?: DropoffStop[];
  stopsCount: number;
  tracking: string;
  isCancelled?: boolean;
}

/**
 * Renders either the isolated per-customer stop list (multi-drop) or the compact
 * 2-point timeline (single stop) inside the booking success receipt.
 */
export function BookingSuccessRouteTimeline({
  pickup,
  dropoff,
  recipient,
  stops,
  stopsCount,
  tracking,
  isCancelled = false,
}: BookingSuccessRouteTimelineProps) {
  const tPayment = useTranslations('Payment');

  if (stops && stops.length > 1) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
            <MapPin className="h-3 w-3 text-brand-600" />
          </span>
          <div>
            <span className="text-xs font-medium text-slate-400 block">
              {tPayment('pickupPointLabel')}
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{pickup}</p>
          </div>
        </div>
        <BookingSuccessStopsList
          stops={stops}
          tracking={tracking}
          isCancelled={isCancelled}
        />
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-6 before:w-0.5 before:bg-slate-200">
      <div className="relative">
        <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 ring-4 ring-white">
          <MapPin className="h-3 w-3 text-brand-600" />
        </span>
        <span className="text-xs font-medium text-slate-400 block">
          {tPayment('pickupPointLabel')}
        </span>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{pickup}</p>
      </div>

      <div className="relative">
        <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-success-100 ring-4 ring-white">
          <Navigation className="h-3 w-3 text-success-600" />
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            {tPayment('dropoffLabel')}
          </span>
          {stopsCount > 1 && (
            <span className="rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-800">
              {stopsCount} Stops
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{dropoff}</p>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          <User className="h-3 w-3 text-slate-500" />
          <span>{recipient}</span>
        </div>
      </div>
    </div>
  );
}

