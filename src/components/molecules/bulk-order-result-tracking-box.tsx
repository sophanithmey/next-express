'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { AlertCircle, Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import { BookingOrder } from '@/features/booking/types/booking-types';

interface BulkOrderResultTrackingBoxProps {
  order?: BookingOrder;
  error?: string;
  copiedField: 'id' | 'link' | null;
  onCopyId: () => void;
  onCopyLink: () => void;
}

export function BulkOrderResultTrackingBox({
  order,
  error,
  copiedField,
  onCopyId,
  onCopyLink,
}: BulkOrderResultTrackingBoxProps) {
  const tBooking = useTranslations('Booking');
  const tPayment = useTranslations('Payment');
  const tCommon = useTranslations('Common');

  if (!order) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-800">
        <AlertCircle className="h-4 w-4 text-danger-600 shrink-0 mt-0.5" />
        <span>{error || 'Failed to create order'}</span>
      </div>
    );
  }

  const tracking = order.trackingNumber || '';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          {tPayment('trackingRef')}
        </span>
        <span className="font-mono text-xs sm:text-sm font-extrabold text-secondary-700 truncate">
          {tracking}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onCopyId}
          className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title={tCommon('copy')}
        >
          {copiedField === 'id' ? (
            <Check className="h-3 w-3 text-success-600" />
          ) : (
            <Copy className="h-3 w-3 text-slate-500" />
          )}
          <span>
            {copiedField === 'id' ? tCommon('copied') : tCommon('copy')}
          </span>
        </button>

        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title={tBooking('bulkResultCopyLink')}
        >
          {copiedField === 'link' ? (
            <Check className="h-3 w-3 text-success-600" />
          ) : (
            <Link2 className="h-3 w-3 text-secondary-600" />
          )}
          <span>
            {copiedField === 'link'
              ? tCommon('copied')
              : tBooking('bulkResultCopyLink')}
          </span>
        </button>

        <Link
          href={`/bookings/${order.id}`}
          className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-secondary-50 border border-secondary-200/80 px-2.5 py-1 text-[11px] font-bold text-secondary-700 hover:bg-secondary-100 transition"
        >
          <span>{tCommon('viewDetails')}</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
