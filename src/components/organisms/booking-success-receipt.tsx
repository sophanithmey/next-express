'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { BookingSuccessStepper } from '../molecules/booking-success-stepper';
import { BookingSuccessRouteTimeline } from '../molecules/booking-success-route-timeline';

interface BookingSuccessReceiptProps {
  refCode: string;
  tracking: string;
  pickup: string;
  dropoff: string;
  recipient: string;
  stops?: DropoffStop[];
  stopsCount: number;
  deliverySpeed?: string | null;
  isCancelled?: boolean;
  activeStep?: number;
}

export function BookingSuccessReceipt({
  refCode,
  tracking,
  pickup,
  dropoff,
  recipient,
  stops,
  stopsCount,
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

      {/* Visual Route Timeline (single stop) or Per-Customer Stop Share List (multi-stop) */}
      <BookingSuccessRouteTimeline
        pickup={pickup}
        dropoff={dropoff}
        recipient={recipient}
        stops={stops}
        stopsCount={stopsCount}
        tracking={tracking}
        isCancelled={isCancelled}
      />
    </div>
  );
}

