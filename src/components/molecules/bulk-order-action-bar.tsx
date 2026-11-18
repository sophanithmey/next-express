'use client';

import React from 'react';
import {
  AlertCircle,
  Banknote,
  HandCoins,
  Package,
  Tag,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../atoms/button';
import { APP_CONFIG, MAX_BULK_ORDERS } from '@/lib/constants';
import { PromoCode } from '@/features/booking/services/promo-service';

interface BulkOrderActionBarProps {
  ordersCount: number;
  totalStops: number;
  subtotalFee: number;
  finalPayableFee: number;
  discountAmount: number;
  appliedPromo: PromoCode | null;
  tipAmount: number;
  totalCod: number;
  invalidOrderCount: number;
  hasPickupErrors: boolean;
  isSubmitting: boolean;
  submitProgress: { completed: number; total: number };
  onSubmit: () => void;
}

export function BulkOrderActionBar({
  ordersCount,
  totalStops,
  subtotalFee,
  finalPayableFee,
  discountAmount,
  appliedPromo,
  tipAmount,
  totalCod,
  invalidOrderCount,
  hasPickupErrors,
  isSubmitting,
  submitProgress,
  onSubmit,
}: BulkOrderActionBarProps) {
  const tBooking = useTranslations('Booking');

  return (
    <div className="sticky bottom-4 z-30 w-full rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] space-y-3 transition-all">
      {ordersCount > 0 && (invalidOrderCount > 0 || hasPickupErrors) && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            {hasPickupErrors
              ? tBooking('bulkFixPickupHint')
              : tBooking('bulkFixOrdersHint', { count: invalidOrderCount })}
          </span>
        </div>
      )}

      {isSubmitting && submitProgress.total > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              {tBooking('bulkSubmittingProgress', {
                completed: submitProgress.completed,
                total: submitProgress.total,
              })}
            </span>
            <span>
              {Math.round(
                (submitProgress.completed / submitProgress.total) * 100,
              )}
              %
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{
                width: `${(submitProgress.completed / submitProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Estimated Fee, Orders/Stops, Voucher, Tip & COD badges */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tBooking('estimatedFee')}
            </span>
            {ordersCount > 0 && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {ordersCount}/{MAX_BULK_ORDERS} {tBooking('bulkOrdersUnit')} ·{' '}
                {totalStops} {tBooking('bulkSummaryStops')}
              </span>
            )}
            {appliedPromo && discountAmount > 0 && (
              <span className="inline-flex items-center gap-1 bg-success-50 text-success-800 border border-success-200 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                <Tag className="h-2.5 w-2.5 text-success-600" />
                <span>
                  -{APP_CONFIG.currencySymbol}
                  {discountAmount.toFixed(2)}
                </span>
              </span>
            )}
            {tipAmount > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                <HandCoins className="h-2.5 w-2.5 text-amber-600" />
                <span>
                  {tBooking('bulkRiderTipBadge', {
                    amount: `${APP_CONFIG.currencySymbol}${tipAmount.toFixed(2)}`,
                  })}
                </span>
              </span>
            )}
            {totalCod > 0 && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-900 border border-primary-200/90 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Banknote className="h-3 w-3 text-primary-700" />
                <span>
                  {tBooking('codCollection')}: {APP_CONFIG.currencySymbol}
                  {totalCod.toFixed(2)}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {APP_CONFIG.currencySymbol}
              {finalPayableFee.toFixed(2)}
            </span>
            {discountAmount > 0 && (
              <span className="text-xs font-mono font-semibold text-slate-400 line-through">
                {APP_CONFIG.currencySymbol}
                {subtotalFee.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Primary Book Orders Action */}
        <div className="w-full sm:w-auto shrink-0">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold bg-primary-500 hover:bg-primary-400 text-slate-950 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] whitespace-nowrap"
            isLoading={isSubmitting}
            disabled={ordersCount === 0 || isSubmitting}
            onClick={onSubmit}
            leftIcon={<Package className="h-4 w-4 shrink-0" />}
          >
            {tBooking('bulkBookOrdersCta', { count: ordersCount })}
          </Button>
        </div>
      </div>
    </div>
  );
}
