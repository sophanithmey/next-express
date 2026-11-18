'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Calendar,
  Check,
  Copy,
  CreditCard,
  DollarSign,
  MapPin,
  Package,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  DeliverySpeedOption,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { Button } from '../atoms/button';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  khqr: 'Wing Bank KHQR',
  KHQR: 'Wing Bank KHQR',
  wingpoint: 'WingPoints',
  WINGPOINT: 'WingPoints',
  WING_POINT: 'WingPoints',
  cop: 'Cash on Pickup',
  COP: 'Cash on Pickup',
  CASH_ON_DELIVERY: 'Cash on Pickup',
  wallet: 'WingPay Wallet',
  WALLET: 'Seller Balance',
  WING_PAY: 'WingPay Wallet',
  card: 'Bank Card',
  CARD: 'Bank Card',
};

interface BulkOrderResultSidebarProps {
  pickup?: PickupLocation;
  deliveryOption?: DeliverySpeedOption;
  paymentMethod?: string;
  succeededCount: number;
  failedCount: number;
  totalStops: number;
  totalFee: number;
  totalCod: number;
  copiedAll: boolean;
  onCopyAllTracking: () => void;
  onRetryFailed: () => void;
  onStartNewBatch: () => void;
}

export function BulkOrderResultSidebar({
  pickup,
  deliveryOption,
  paymentMethod,
  succeededCount,
  failedCount,
  totalStops,
  totalFee,
  totalCod,
  copiedAll,
  onCopyAllTracking,
  onRetryFailed,
  onStartNewBatch,
}: BulkOrderResultSidebarProps) {
  const tBooking = useTranslations('Booking');
  const tPayment = useTranslations('Payment');
  const tPickup = useTranslations('Pickup');
  const tDelivery = useTranslations('Delivery');
  const tCommon = useTranslations('Common');

  const paymentLabel = paymentMethod
    ? PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod
    : undefined;

  const isScheduled =
    deliveryOption === 'scheduled' || deliveryOption === 'same_day';

  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      {/* Batch Financial & Pickup Summary Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-sm font-extrabold text-slate-900">
            {tBooking('bulkResultBatchSummary')}
          </span>
          {paymentLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
              <CreditCard className="h-3 w-3 text-slate-500" />
              <span>{paymentLabel}</span>
            </span>
          )}
        </div>

        {/* Shared Pickup & Delivery Speed */}
        {pickup && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {tPickup('origin')}
                </span>
                <p className="font-semibold text-slate-800 leading-snug break-words">
                  {pickup.address || pickup.name}
                </p>
                {pickup.senderPhone && (
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {pickup.senderPhone}
                  </p>
                )}
              </div>
            </div>

            {deliveryOption && (
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                  {isScheduled ? (
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                  )}
                  <span>{tDelivery('speed')}</span>
                </span>
                <span className="font-bold text-slate-900">
                  {isScheduled ? tDelivery('scheduled') : tDelivery('instant')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Fee Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">
              {tBooking('bulkResultOrdersBooked')}
            </span>
            <span className="font-mono font-bold text-slate-900">
              {succeededCount} ({totalStops} {tCommon('stops')})
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-700 font-bold">
              {tBooking('bulkResultTotalFee')}
            </span>
            <span className="font-mono text-base font-extrabold text-slate-900">
              {APP_CONFIG.currencySymbol}
              {totalFee.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Separate COD Remittance Highlight */}
        {totalCod > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50/90 px-3.5 py-2.5 text-xs text-primary-950">
            <div>
              <span className="inline-flex items-center gap-1.5 font-bold">
                <DollarSign className="h-4 w-4 text-primary-700 shrink-0" />
                <span>{tBooking('bulkResultTotalCod')}</span>
              </span>
              <p className="text-[10px] text-primary-800 mt-0.5">
                {tPayment('codCollectLabel')}
              </p>
            </div>
            <span className="font-mono text-sm font-extrabold">
              {APP_CONFIG.currencySymbol}
              {totalCod.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Next Actions Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2.5">
        {failedCount > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onRetryFailed}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="w-full"
          >
            {tBooking('bulkRetryFailedButton', { count: failedCount })}
          </Button>
        )}

        <Link
          href="/bookings"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-2xs transition"
        >
          <span>{tPayment('viewAll')}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        {succeededCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCopyAllTracking}
            leftIcon={
              copiedAll ? (
                <Check className="h-4 w-4 text-success-600" />
              ) : (
                <Copy className="h-4 w-4 text-slate-500" />
              )
            }
            className="w-full"
          >
            {copiedAll
              ? tCommon('copied')
              : tBooking('bulkResultCopyAllTracking')}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onStartNewBatch}
          leftIcon={<Package className="h-4 w-4 text-slate-500" />}
          className="w-full"
        >
          {tBooking('bulkStartNewBatch')}
        </Button>
      </div>
    </div>
  );
}
