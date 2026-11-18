'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Phone, User } from 'lucide-react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';

const STOP_LETTERS = ['A', 'B', 'C', 'D', 'E'];

interface BulkOrderResultStopsProps {
  stops: DropoffStop[];
}

/**
 * Expandable per-stop breakdown displayed inside a BulkOrderResultRow.
 */
export function BulkOrderResultStops({ stops }: BulkOrderResultStopsProps) {
  const tRecipient = useTranslations('Recipient');

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 space-y-2 rounded-b-2xl">
      {stops.map((stop, stopIdx) => {
        const letter = STOP_LETTERS[stopIdx] || String(stopIdx + 1);
        const stopCod = stop.codAmount ?? 0;
        return (
          <div
            key={stop.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-xs"
          >
            <div className="flex items-start gap-2 min-w-0">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary-50 border border-secondary-200 text-[10px] font-extrabold text-secondary-700">
                {letter}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {stop.dropoff.address}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Phone className="h-2.5 w-2.5 text-slate-400" />
                    <span>{stop.recipient.phoneNumber}</span>
                  </span>
                  {stop.recipient.name && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-2.5 w-2.5 text-slate-400" />
                      <span>{stop.recipient.name}</span>
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {tRecipient('stopLabel', { letter })}
                  </span>
                </div>
              </div>
            </div>

            {stopCod > 0 && (
              <span className="self-start sm:self-center shrink-0 rounded-md border border-primary-200 bg-primary-50 px-2 py-0.5 font-mono text-[11px] font-bold text-primary-950">
                COD {APP_CONFIG.currencySymbol}
                {stopCod.toFixed(2)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
