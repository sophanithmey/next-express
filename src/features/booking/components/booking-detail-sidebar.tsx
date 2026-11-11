'use client';

import React from 'react';
import {
  Banknote,
  CreditCard,
} from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { ShareTrackingCard } from '@/components/molecules/share-tracking-card';
import { PaymentDetailCard } from '@/components/molecules/payment-detail-card';
import { BookingDetailActionsCard } from './booking-detail-actions-card';
import { PaymentDetailRecord } from '@/features/payment/types/payment-types';
import {
  APP_CONFIG,
  PAYMENT_STATUS_COLORS,
} from '@/lib/constants';
import { useTranslations } from 'next-intl';

const PAYMENT_LABEL_KEYS = {
  pending: 'paymentPending',
  paid: 'paymentPaid',
  failed: 'paymentFailed',
  refunded: 'paymentRefunded',
} as const;

interface BookingDetailSidebarProps {
  order: BookingOrder;
  extraStops: number;
  stopOneFee: number;
  isPendingPayment: boolean;
  canCancel: boolean;
  isCancelled: boolean;
  onBookAgain: () => void;
  onContinuePayment?: () => void;
  onRequestCancel?: () => void;
  isCancelling?: boolean;
  paymentDetail?: PaymentDetailRecord | null;
  isLoadingPaymentDetail?: boolean;
  onRefreshPaymentDetail?: () => void;
}

export function BookingDetailSidebar({
  order,
  extraStops,
  stopOneFee,
  isPendingPayment,
  canCancel,
  isCancelled,
  onBookAgain,
  onContinuePayment,
  onRequestCancel,
  isCancelling = false,
  paymentDetail = null,
  isLoadingPaymentDetail = false,
  onRefreshPaymentDetail,
}: BookingDetailSidebarProps) {
  const tDetails = useTranslations('BookingDetails');
  const tHistory = useTranslations('BookingHistory');

  const paymentStatus =
    order.paymentStatus || (isPendingPayment ? 'pending' : 'paid');
  const paymentColor =
    PAYMENT_STATUS_COLORS[paymentStatus] || PAYMENT_STATUS_COLORS.paid;
  const paymentLabelKey =
    PAYMENT_LABEL_KEYS[paymentStatus as keyof typeof PAYMENT_LABEL_KEYS] ||
    'paymentPaid';

  return (
    <div className="space-y-4">
      {/* Live Tracking Share Hub */}
      {!isCancelled && (
        <ShareTrackingCard
          tracking={order.trackingNumber}
          recipient={order.recipient.name || tHistory('defaultCustomer')}
          dropoff={order.dropoff.address}
          codAmount={order.cod?.isCod ? order.cod.amount : 0}
        />
      )}

      {/* Financial Payment Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {tDetails('paymentSummaryTitle')}
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${paymentColor.bg} ${paymentColor.text} ${paymentColor.border}`}
          >
            {tDetails(paymentLabelKey)}
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>{tDetails('deliveryFeeStop1')}</span>
            <span className="font-mono text-slate-900 font-semibold">
              {APP_CONFIG.currencySymbol}
              {stopOneFee.toFixed(2)}
            </span>
          </div>
          {extraStops > 0 && (
            <div className="flex justify-between">
              <span>{tDetails('extraStopsRow', { count: extraStops })}</span>
              <span className="font-mono text-slate-900 font-semibold">
                +{APP_CONFIG.currencySymbol}
                {(extraStops * 0.75).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm text-slate-900">
            <span>{tDetails('totalCharge')}</span>
            <span className="font-mono text-secondary-800">
              {APP_CONFIG.currencySymbol}
              {order.deliveryFee.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-slate-400 pt-1 flex justify-between">
            <span>{tDetails('paymentMethodLabel')}</span>
            <span className="font-semibold text-slate-700 uppercase">
              {order.paymentMethod || 'KHQR'}
            </span>
          </div>
        </div>

        {order.cod?.isCod && order.cod.amount > 0 && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-3 text-xs text-primary-950 flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-primary-700" />
              <span>{tDetails('buyerCodLabel')}</span>
            </span>
            <span className="font-mono text-sm">
              {APP_CONFIG.currencySymbol}
              {order.cod.amount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <PaymentDetailCard
        detail={paymentDetail}
        isLoading={isLoadingPaymentDetail}
        onRefresh={order.paymentId ? onRefreshPaymentDetail : undefined}
      />

      <BookingDetailActionsCard
        isPendingPayment={isPendingPayment}
        canCancel={canCancel}
        isCancelled={isCancelled}
        isCancelling={isCancelling}
        onBookAgain={onBookAgain}
        onContinuePayment={onContinuePayment}
        onRequestCancel={onRequestCancel}
      />
    </div>
  );
}
