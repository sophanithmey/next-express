'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PromoCode } from '@/features/booking/services/promo-service';
import { APP_CONFIG, MAX_TOTAL_COD_USD } from '@/lib/constants';

interface BulkOrderFeeTotalsProps {
  subtotalFee: number;
  appliedPromo: PromoCode | null;
  discountAmount: number;
  tipAmount: number;
  finalPayableFee: number;
  totalCod: number;
}

export function BulkOrderFeeTotals({
  subtotalFee,
  appliedPromo,
  discountAmount,
  tipAmount,
  finalPayableFee,
  totalCod,
}: BulkOrderFeeTotalsProps) {
  const tBooking = useTranslations('Booking');
  const tPayment = useTranslations('Payment');

  return (
    <div className="space-y-3">
      {/* Delivery Fee Breakdown (COD is strictly excluded from delivery total) */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>{tBooking('bulkDeliveryFeeSubtotal')}</span>
          <span className="font-mono font-semibold text-slate-800">
            {APP_CONFIG.currencySymbol}
            {subtotalFee.toFixed(2)}
          </span>
        </div>

        {appliedPromo && discountAmount > 0 && (
          <div className="flex items-center justify-between text-success-700 font-semibold">
            <span className="truncate pr-2">
              {tPayment('promoVoucherRow', { code: appliedPromo.code })}
            </span>
            <span className="font-mono shrink-0">
              -{APP_CONFIG.currencySymbol}
              {discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {tipAmount > 0 && (
          <div className="flex items-center justify-between text-amber-800 font-semibold">
            <span className="truncate pr-2">{tPayment('riderTipRow')}</span>
            <span className="font-mono shrink-0">
              +{APP_CONFIG.currencySymbol}
              {tipAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200/80 pt-2 mt-1.5">
          <span className="font-bold text-slate-900">
            {tPayment('totalAmountPayable')}
          </span>
          <span className="text-base font-extrabold text-slate-950 font-mono">
            {APP_CONFIG.currencySymbol}
            {finalPayableFee.toFixed(2)}
          </span>
        </div>
      </div>

      {/* COD Collection Callout (Always separated from delivery fee) */}
      {totalCod > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 space-y-0.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900">
              {tBooking('codCollection')}
            </span>
            <span className="font-mono font-extrabold text-amber-900">
              {APP_CONFIG.currencySymbol}
              {totalCod.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-amber-800/80">
            {tBooking('bulkCodSummaryHint', { max: MAX_TOTAL_COD_USD })}
          </p>
        </div>
      )}
    </div>
  );
}
