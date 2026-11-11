'use client';

import React, { useState } from 'react';
import {
  Check, Copy, CreditCard, DollarSign, Heart, MapPin, Navigation, User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { APP_CONFIG } from '@/lib/constants';
import { BookingSuccessStepper } from '../molecules/booking-success-stepper';

interface BookingSuccessReceiptProps {
  refCode: string;
  tracking: string;
  pickup: string;
  dropoff: string;
  recipient: string;
  stopsCount: number;
  codAmount: number;
  tipAmount: number;
  feePaid: number;
  paymentMethod?: string | null;
  deliverySpeed?: string | null;
  isCancelled?: boolean;
  activeStep?: number;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  KHQR: 'Wing Bank KHQR / Bakong',
  WINGPOINT: 'WingPoints (Rewards)',
  WING_POINT: 'WingPoints (Rewards)',
  COP: 'Cash on Pickup',
  CASH_ON_DELIVERY: 'Cash on Pickup',
  WALLET: 'Seller Balance',
  WING_PAY: 'WingPay Wallet',
  CARD: 'Bank Card',
};

export function BookingSuccessReceipt({
  refCode,
  tracking,
  pickup,
  dropoff,
  recipient,
  stopsCount,
  codAmount,
  tipAmount,
  feePaid,
  paymentMethod,
  deliverySpeed,
  isCancelled = false,
  activeStep = 1,
}: BookingSuccessReceiptProps) {
  const tPayment = useTranslations('Payment');
  const tCommon = useTranslations('Common');
  const [copiedId, setCopiedId] = useState(false);

  const etaLabel =
    deliverySpeed === 'same_day'
      ? tPayment('etaSameDay')
      : deliverySpeed === 'scheduled'
      ? tPayment('etaScheduled')
      : tPayment('etaInstant');

  const handleCopyTracking = async () => {
    await navigator.clipboard.writeText(tracking);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      {/* Tracking ID & Booking Ref Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {tPayment('trackingRef')}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {tracking}
            </span>
            <button
              type="button"
              onClick={handleCopyTracking}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              {copiedId ? (
                <Check className="h-3.5 w-3.5 text-success-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>{copiedId ? tCommon('copied') : tCommon('copy')}</span>
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Booking Ref
          </span>
          <span className="mt-1 inline-block rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700">
            {refCode}
          </span>
        </div>
      </div>

      {/* Live Dispatch Progress */}
      <BookingSuccessStepper
        activeStep={activeStep}
        etaLabel={etaLabel}
        isCancelled={isCancelled}
      />

      {/* Visual Route Timeline */}
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

      {/* Financial & Payment Metadata Strip */}
      <div className="grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-4 sm:grid-cols-2">
        {paymentMethod && (
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <span>Method</span>
            </span>
            <span className="font-semibold text-slate-800">
              {PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs">
          <span className="text-slate-500 font-medium">{tPayment('deliveryPaidLabel')}</span>
          <span className="font-mono font-bold text-slate-900">
            {APP_CONFIG.currencySymbol}{feePaid.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Rider Tip Confirmation */}
      {tipAmount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-medium">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500 shrink-0" />
            <span>{tPayment('riderTipRow')}</span>
          </div>
          <span className="font-mono text-sm font-bold text-amber-900">
            +{APP_CONFIG.currencySymbol}{tipAmount.toFixed(2)}
          </span>
        </div>
      )}

      {/* COD Remittance Callout (Separate from Delivery Fee) */}
      {codAmount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50/90 px-3.5 py-3 text-xs text-primary-950">
          <div className="flex items-center gap-2 font-semibold">
            <DollarSign className="h-4 w-4 text-primary-700 shrink-0" />
            <span>{tPayment('codCollectLabel')}</span>
          </div>
          <span className="font-mono text-sm font-extrabold">
            {APP_CONFIG.currencySymbol}{codAmount.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

