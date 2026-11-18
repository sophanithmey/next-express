'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  MapPin,
  Package,
  Receipt,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface BulkOrderResultHeroProps {
  succeededCount: number;
  failedCount: number;
  totalOrders: number;
  totalStops: number;
  totalFee: number;
  totalCod: number;
}

/**
 * Top status hero banner + 4-KPI summary strip for Bulk Upload Order results,
 * visually aligned with the single-order Booking Success header.
 */
export function BulkOrderResultHero({
  succeededCount,
  failedCount,
  totalOrders,
  totalStops,
  totalFee,
  totalCod,
}: BulkOrderResultHeroProps) {
  const tBooking = useTranslations('Booking');
  const allSucceeded = failedCount === 0;

  return (
    <div className="space-y-4">
      {/* Compact Horizontal Status Hero */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          {allSucceeded ? (
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-success-200/60 animate-ping"
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertCircle className="h-7 w-7" />
            </div>
          )}

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              {allSucceeded
                ? tBooking('bulkResultAllSuccessTitle', {
                    count: succeededCount,
                  })
                : tBooking('bulkResultPartialTitle', {
                    success: succeededCount,
                    total: totalOrders,
                  })}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {tBooking('bulkResultSubtitle')}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold',
            allSucceeded
              ? 'border-success-200 bg-success-50 text-success-800'
              : 'border-amber-200 bg-amber-50 text-amber-800',
          )}
        >
          {allSucceeded ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
              <span>{tBooking('bulkResultDispatchedBadge')}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              <span>
                {tBooking('bulkResultPartialBadge', { failed: failedCount })}
              </span>
            </>
          )}
        </span>
      </div>

      {/* 4-Metric KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {tBooking('bulkResultOrdersBooked')}
            </span>
            <Package className="h-4 w-4 text-success-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">
            {succeededCount}
            <span className="text-sm font-semibold text-slate-400">
              /{totalOrders}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {tBooking('bulkSummaryStops')}
            </span>
            <MapPin className="h-4 w-4 text-secondary-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">
            {totalStops}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {tBooking('bulkResultTotalFee')}
            </span>
            <Receipt className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">
            {APP_CONFIG.currencySymbol}
            {totalFee.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-primary-200 bg-primary-50/70 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-primary-900">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {tBooking('bulkResultTotalCod')}
            </span>
            <Banknote className="h-4 w-4 text-primary-700" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-primary-950">
            {APP_CONFIG.currencySymbol}
            {totalCod.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
