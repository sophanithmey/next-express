'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { BulkBatchSubmissionItem } from '@/features/booking/services/bulk-batch-submitter';
import { buildTrackingSharePayload } from '@/features/booking/services/tracking-share-helper';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { BulkOrderResultStops } from './bulk-order-result-stops';

interface BulkOrderResultRowProps {
  item: BulkBatchSubmissionItem;
  index: number;
}

export function BulkOrderResultRow({ item, index }: BulkOrderResultRowProps) {
  const locale = useLocale();
  const tBooking = useTranslations('Booking');
  const tPayment = useTranslations('Payment');
  const tCommon = useTranslations('Common');

  const [copiedField, setCopiedField] = useState<'id' | 'link' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const order = item.createdOrder;
  const isSuccess = item.status === 'success' && Boolean(order);
  const tracking = order?.trackingNumber || '';
  const stops = item.draft.stops;
  const orderCod = order?.cod?.amount ?? 0;
  const orderFee = order?.deliveryFee ?? 0;
  const firstStop = stops[0];

  const handleCopyId = async () => {
    if (!tracking) return;
    try {
      await navigator.clipboard.writeText(tracking);
      setCopiedField('id');
      toast.success(`${tCommon('copied')}: ${tracking}`);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  };

  const handleCopyLink = async () => {
    if (!tracking || !order) return;
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const { fullTrackingUrl } = buildTrackingSharePayload({
        tracking,
        locale,
        origin,
        recipient: firstStop?.recipient.name || 'Recipient',
        dropoff: firstStop?.dropoff.address || '',
        codAmount: orderCod,
      });
      await navigator.clipboard.writeText(fullTrackingUrl);
      setCopiedField('link');
      toast.success(tPayment('linkCopied'));
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white transition-all',
        isSuccess
          ? 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
          : 'border-danger-200 bg-danger-50/20 shadow-2xs',
      )}
    >
      <div className="p-4 space-y-3">
        {/* Top Row: Order # + Order Ref + Status + Financials */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span
              className={cn(
                'inline-flex h-6 items-center rounded-lg px-2 text-[11px] font-extrabold',
                isSuccess
                  ? 'bg-slate-900 text-white'
                  : 'bg-danger-600 text-white',
              )}
            >
              {tBooking('bulkOrderLabel', { index: index + 1 })}
            </span>

            {item.draft.orderRef && (
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                {item.draft.orderRef}
              </span>
            )}

            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {stops.length} {tCommon('stops')}
            </span>

            {isSuccess ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-50 border border-success-200 px-2 py-0.5 text-[11px] font-bold text-success-700">
                <CheckCircle2 className="h-3 w-3" />
                <span>{tPayment('stepConfirmed')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 border border-danger-200 px-2 py-0.5 text-[11px] font-bold text-danger-700">
                <AlertCircle className="h-3 w-3" />
                <span>{tBooking('bulkResultStatusFailed')}</span>
              </span>
            )}
          </div>

          {/* Financials: Fee + Separate COD Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {orderCod > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-primary-300 bg-primary-50 px-2 py-0.5 font-mono text-[11px] font-bold text-primary-950">
                <Banknote className="h-3 w-3 text-primary-700" />
                <span>
                  COD {APP_CONFIG.currencySymbol}
                  {orderCod.toFixed(2)}
                </span>
              </span>
            )}
            {isSuccess && (
              <span className="font-mono text-xs font-extrabold text-slate-900">
                {APP_CONFIG.currencySymbol}
                {orderFee.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Middle Row: Tracking + Quick Copy / Share Actions OR Error Alert */}
        {isSuccess && order ? (
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
                onClick={() => void handleCopyId()}
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
                onClick={() => void handleCopyLink()}
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
        ) : (
          <div className="flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-800">
            <AlertCircle className="h-4 w-4 text-danger-600 shrink-0 mt-0.5" />
            <span>{item.error || 'Failed to create order'}</span>
          </div>
        )}

        {/* Footer Preview: First Stop Summary + Expand Stops Toggle */}
        <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
          <div className="flex items-center gap-2 min-w-0 text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">
              {firstStop?.dropoff.address || '—'}
            </span>
            {firstStop?.recipient.phoneNumber && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-mono">
                <span>•</span>
                <span>{firstStop.recipient.phoneNumber}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shrink-0"
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded
                ? tBooking('collapse')
                : `${stops.length} ${tCommon('stops')}`}
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>

      {/* Expandable Per-Stop Breakdown */}
      {isExpanded && <BulkOrderResultStops stops={stops} />}
    </div>
  );
}
