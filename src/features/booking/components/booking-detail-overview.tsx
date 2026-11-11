'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { StatusBadge } from '@/components/molecules/status-badge';
import { BookingDetailKpiStrip } from './booking-detail-kpi-strip';
import { PAYMENT_STATUS_COLORS } from '@/lib/constants';
import { useTranslations } from 'next-intl';

const PAYMENT_DOT_CLASSES: Record<string, string> = {
  pending: 'bg-warning-600',
  paid: 'bg-success-600',
  failed: 'bg-danger-600',
  refunded: 'bg-slate-500',
};

const PAYMENT_LABEL_KEYS = {
  pending: 'paymentPending',
  paid: 'paymentPaid',
  failed: 'paymentFailed',
  refunded: 'paymentRefunded',
} as const;

interface BookingDetailOverviewProps {
  order: BookingOrder;
  formattedCreatedAt: string;
  stopsCount: number;
  copiedField: 'tracking' | 'id' | null;
  onCopy: (field: 'tracking' | 'id', value: string) => void;
}

export function BookingDetailOverview({
  order,
  formattedCreatedAt,
  stopsCount,
  copiedField,
  onCopy,
}: BookingDetailOverviewProps) {
  const tDetails = useTranslations('BookingDetails');
  const tCommon = useTranslations('Common');

  const paymentStatus =
    order.paymentStatus || (order.status === 'pending' ? 'pending' : 'paid');
  const paymentColor =
    PAYMENT_STATUS_COLORS[paymentStatus] || PAYMENT_STATUS_COLORS.paid;
  const paymentDotClass = PAYMENT_DOT_CLASSES[paymentStatus] || 'bg-success-600';
  const paymentLabelKey =
    PAYMENT_LABEL_KEYS[paymentStatus as keyof typeof PAYMENT_LABEL_KEYS] ||
    'paymentPaid';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      {/* Compact Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/bookings"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{tDetails('backToBookings')}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {order.trackingNumber}
            </span>
            <button
              type="button"
              onClick={() => onCopy('tracking', order.trackingNumber)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              title={tDetails('trackingNumber')}
            >
              {copiedField === 'tracking' ? (
                <Check className="h-3 w-3 text-success-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copiedField === 'tracking' ? tCommon('copied') : tCommon('copy')}</span>
            </button>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500">{formattedCreatedAt}</span>
            <button
              type="button"
              onClick={() => onCopy('id', order.id)}
              className="hidden md:inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 hover:text-slate-800 transition"
              title={tCommon('copy')}
            >
              <span>{order.id}</span>
              {copiedField === 'id' ? (
                <Check className="h-3 w-3 text-success-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${paymentColor.bg} ${paymentColor.text} ${paymentColor.border}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${paymentDotClass}`} />
            <span>{tDetails(paymentLabelKey)}</span>
          </span>
        </div>
      </div>

      {/* 4-Tile KPI Glance Strip */}
      <BookingDetailKpiStrip order={order} stopsCount={stopsCount} />
    </div>
  );
}
