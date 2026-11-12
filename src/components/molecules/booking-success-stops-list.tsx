'use client';

import React from 'react';
import { Lock, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { StopTrackCopyActions } from './stop-track-copy-actions';

interface BookingSuccessStopsListProps {
  stops: DropoffStop[];
  tracking: string;
  isCancelled?: boolean;
}

/**
 * Compact per-customer drop-off rows with numbered route nodes and lightweight
 * right-aligned Copy Link / Copy Msg pills scoped strictly to each stop.
 */
export function BookingSuccessStopsList({
  stops,
  tracking,
  isCancelled = false,
}: BookingSuccessStopsListProps) {
  const tPayment = useTranslations('Payment');

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700">
          {tPayment('customerDropoffsTitle', { count: stops.length })}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
          <Lock className="h-3 w-3 text-secondary-600 shrink-0" />
          <span>{tPayment('privateRouteHint')}</span>
        </span>
      </div>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
        {stops.map((stop, index) => {
          const stopId = stop.id || `stop-${index + 1}`;
          const stopCod = stop.codAmount ?? 0;

          return (
            <div
              key={stopId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 hover:bg-slate-50/60 transition"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-50 border border-secondary-200 font-mono text-[10px] font-bold text-secondary-700">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900">
                      <User className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{stop.recipient?.name || `Customer ${index + 1}`}</span>
                    </span>
                    {stop.recipient?.phoneNumber && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                        <Phone className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                        <span>{stop.recipient.phoneNumber}</span>
                      </span>
                    )}
                    {stopCod > 0 && (
                      <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-900">
                        COD {APP_CONFIG.currencySymbol}
                        {stopCod.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    {stop.dropoff?.address}
                  </p>
                </div>
              </div>

              {!isCancelled && (
                <div className="pl-7 sm:pl-0 shrink-0">
                  <StopTrackCopyActions
                    tracking={tracking}
                    stop={stop}
                    index={index}
                    includeCopyMessage
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
