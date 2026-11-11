'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import {
  Bike,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Link2,
  MapPin,
  Repeat,
} from 'lucide-react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { CopiedState } from '@/features/booking/hooks/use-booking-history';
import { StatusBadge } from './status-badge';
import { APP_CONFIG } from '@/lib/constants';
import { formatPhoneNumber } from '@/lib/phone-number';
import { formatOrderTimestamp } from '@/features/booking/services/booking-detail-helpers';
import { useTranslations } from 'next-intl';

interface BookingHistoryMobileCardProps {
  order: BookingOrder;
  copiedItem: CopiedState | null;
  onCopyId: (order: BookingOrder) => void;
  onCopyLink: (order: BookingOrder) => void;
  onRepeatBooking: (order: BookingOrder) => void;
  onNavigateDetail: (orderId: string) => void;
}

export function BookingHistoryMobileCard({
  order,
  copiedItem,
  onCopyId,
  onCopyLink,
  onRepeatBooking,
  onNavigateDetail,
}: BookingHistoryMobileCardProps) {
  const tHistory = useTranslations('BookingHistory');
  const isCopiedId = copiedItem?.id === order.id && copiedItem.type === 'id';
  const isCopiedLink = copiedItem?.id === order.id && copiedItem.type === 'link';
  const stopsCount = order.dropoffs?.length || 1;
  const isCancelled = order.status === 'cancelled';

  return (
    <div
      onClick={() => onNavigateDetail(order.id)}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 active:bg-slate-50 transition cursor-pointer"
    >
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-black text-slate-900">
              {order.trackingNumber}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyId(order);
              }}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Copy Tracking Number"
            >
              {isCopiedId ? (
                <Check className="h-3.5 w-3.5 text-success-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {formatOrderTimestamp(order.createdAt)}
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      {/* Recipient & Destination */}
      <div className="space-y-1.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900">
            {order.recipient.name || tHistory('defaultCustomer')}
          </span>
          <span className="font-mono text-slate-500">
            {formatPhoneNumber(order.recipient.phoneNumber)}
          </span>
          {stopsCount > 1 && (
            <span className="rounded bg-brand-50 border border-brand-200 px-1.5 py-0.5 text-xs font-bold text-brand-800">
              {tHistory('stopsBadge', { count: stopsCount })}
            </span>
          )}
        </div>

        <div className="flex items-start gap-1.5 text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
          <span className="line-clamp-1">{order.dropoff.address}</span>
        </div>

        {order.deliverer && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Bike className="h-3.5 w-3.5 shrink-0 text-secondary-600" />
            <span className="font-medium">{order.deliverer.name}</span>
          </div>
        )}
      </div>

      {/* Footer Financials & Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-2 text-xs">
          {order.cod.isCod && order.cod.amount > 0 ? (
            <span className="rounded-lg bg-primary-50 border border-primary-200 px-2 py-0.5 font-mono font-bold text-primary-950">
              COD {APP_CONFIG.currencySymbol}
              {order.cod.amount.toFixed(2)}
            </span>
          ) : (
            <span className="font-mono font-semibold text-slate-600">
              Fee {APP_CONFIG.currencySymbol}
              {order.deliveryFee.toFixed(2)}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {!isCancelled && (
            <>
              <button
                type="button"
                onClick={() => onCopyLink(order)}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                title="Copy Live Tracking Link"
              >
                {isCopiedLink ? (
                  <Check className="h-3.5 w-3.5 text-success-600" />
                ) : (
                  <Link2 className="h-3.5 w-3.5 text-secondary-600" />
                )}
              </button>
              <Link
                href={`/track/${order.trackingNumber}`}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-600 hover:bg-slate-100"
                title="Open Live Tracking"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => onRepeatBooking(order)}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand-50 px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
            title="Book Again"
          >
            <Repeat className="h-3.5 w-3.5" />
          </button>
          <ChevronRight className="h-4 w-4 text-slate-400 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

