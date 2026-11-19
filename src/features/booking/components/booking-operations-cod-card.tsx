'use client';

import React from 'react';
import { Banknote, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { APP_CONFIG } from '@/lib/constants';

interface BookingOperationsCodCardProps {
  totalCod: number;
  activeDateLabel?: string;
}

export function BookingOperationsCodCard({
  totalCod,
  activeDateLabel,
}: BookingOperationsCodCardProps) {
  const tHistory = useTranslations('BookingHistory');

  return (
    <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-amber-200/90 bg-linear-to-b from-amber-50/80 via-white to-amber-50/30 p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-900/80">
              {tHistory('statTotalCod')}
            </span>
            {activeDateLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                <Calendar className="h-2.5 w-2.5" />
                <span>{activeDateLabel}</span>
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-amber-800/70">
            {tHistory('remittanceDesc')}
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-2xs shrink-0">
          <Banknote className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-amber-100/90">
        <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-950">
          {APP_CONFIG.currencySymbol}
          {totalCod.toFixed(2)}
        </span>
        <span className="text-[11px] font-semibold text-amber-700/80">
          USD Currency
        </span>
      </div>
    </div>
  );
}
