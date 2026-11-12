'use client';

import React from 'react';
import { CreditCard, DollarSign, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { APP_CONFIG } from '@/lib/constants';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  KHQR: 'Wing Bank KHQR',
  WINGPOINT: 'WingPoints',
  WING_POINT: 'WingPoints',
  COP: 'Cash on Pickup',
  CASH_ON_DELIVERY: 'Cash on Pickup',
  WALLET: 'Seller Balance',
  WING_PAY: 'WingPay Wallet',
  CARD: 'Bank Card',
};

interface BookingSuccessPaymentCardProps {
  paymentMethod?: string | null;
  feePaid: number;
  tipAmount: number;
  codAmount: number;
}

/**
 * Sticky right-column payment and COD summary card so sellers immediately see
 * delivery charges and buyer COD totals without scrolling past stop lists.
 */
export function BookingSuccessPaymentCard({
  paymentMethod,
  feePaid,
  tipAmount,
  codAmount,
}: BookingSuccessPaymentCardProps) {
  const tPayment = useTranslations('Payment');

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <span className="text-xs font-bold text-slate-900">
          {tPayment('orderSummaryTitle')}
        </span>
        {paymentMethod && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            <CreditCard className="h-3 w-3 text-slate-500" />
            <span>{PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}</span>
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">
            {tPayment('deliveryPaidLabel')}
          </span>
          <span className="font-mono font-bold text-slate-900">
            {APP_CONFIG.currencySymbol}
            {feePaid.toFixed(2)} USD
          </span>
        </div>

        {tipAmount > 0 && (
          <div className="flex items-center justify-between text-amber-900">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 shrink-0" />
              <span>{tPayment('riderTipRow')}</span>
            </span>
            <span className="font-mono font-bold">
              +{APP_CONFIG.currencySymbol}
              {tipAmount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {codAmount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50/90 px-3 py-2.5 text-xs text-primary-950">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <DollarSign className="h-4 w-4 text-primary-700 shrink-0" />
            <span>{tPayment('codCollectLabel')}</span>
          </span>
          <span className="font-mono text-sm font-extrabold">
            {APP_CONFIG.currencySymbol}
            {codAmount.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

