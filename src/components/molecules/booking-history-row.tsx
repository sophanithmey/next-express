'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
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

interface BookingHistoryRowProps {
  order: BookingOrder;
  copiedItem: CopiedState | null;
  onCopyId?: (order: BookingOrder) => void;
  onCopyLink?: (order: BookingOrder) => void;
  onRepeatBooking?: (order: BookingOrder) => void;
  onNavigateDetail?: (orderId: string) => void;
}

export function BookingHistoryRow({
  order,
  copiedItem,
  onCopyId,
  onCopyLink,
  onRepeatBooking,
  onNavigateDetail,
}: BookingHistoryRowProps) {
  const tHistory = useTranslations('BookingHistory');
  const isCopiedId = copiedItem?.id === order.id && copiedItem.type === 'id';
  const isCopiedLink = copiedItem?.id === order.id && copiedItem.type === 'link';
  const stopsCount = order.dropoffs?.length || 1;
  const isCancelled = order.status === 'cancelled';

  return (
    <tr
      onClick={() => onNavigateDetail?.(order.id)}
      className="hover:bg-slate-50/90 transition-colors cursor-pointer"
    >
      {/* Tracking & Created */}
      <td className="px-4 py-3.5 align-top">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-slate-900">
            {order.trackingNumber}
          </span>
          <button
            type="button"
            title="Copy Tracking Number"
            onClick={(e) => {
              e.stopPropagation();
              onCopyId?.(order);
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            {isCopiedId ? (
              <Check className="h-3.5 w-3.5 text-success-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <span className="text-xs text-slate-400 block mt-0.5">
          {formatOrderTimestamp(order.createdAt)}
        </span>
      </td>

      {/* Recipient + Destination Snippet */}
      <td className="px-4 py-3.5 max-w-xs align-top">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-900">
            {order.recipient.name || tHistory('defaultCustomer')}
          </span>
          <span className="font-mono text-slate-500">
            {formatPhoneNumber(order.recipient.phoneNumber)}
          </span>
          {stopsCount > 1 && (
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-bold text-brand-700 border border-brand-200">
              {tHistory('stopsBadge', { count: stopsCount })}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1 text-slate-500">
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
          <span className="truncate">{order.dropoff.address}</span>
        </div>
      </td>

      {/* Status & Rider */}
      <td className="px-4 py-3.5 align-top space-y-1">
        <StatusBadge status={order.status} />
        {order.deliverer && (
          <span className="block text-xs text-slate-500 font-medium">
            {order.deliverer.name}
          </span>
        )}
      </td>

      {/* COD */}
      <td className="px-4 py-3.5 align-top font-mono">
        {order.cod.isCod && order.cod.amount > 0 ? (
          <span className="inline-block rounded-md bg-primary-50 border border-primary-200 px-2 py-0.5 font-bold text-primary-950">
            {APP_CONFIG.currencySymbol}
            {order.cod.amount.toFixed(2)}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Fee */}
      <td className="px-4 py-3.5 align-top font-mono font-semibold text-slate-900">
        {APP_CONFIG.currencySymbol}
        {order.deliveryFee.toFixed(2)}
      </td>

      {/* Quick Actions */}
      <td
        className="px-4 py-3.5 text-right align-top"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1.5">
          {!isCancelled && onCopyLink && (
            <button
              type="button"
              onClick={() => onCopyLink(order)}
              title="Copy Live Tracking Link"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {isCopiedLink ? (
                <Check className="h-3.5 w-3.5 text-success-600" />
              ) : (
                <Link2 className="h-3.5 w-3.5 text-secondary-600" />
              )}
            </button>
          )}
          {!isCancelled && (
            <Link
              href={`/track/${order.trackingNumber}`}
              title="Open Live Tracking"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          {onRepeatBooking && (
            <button
              type="button"
              onClick={() => onRepeatBooking(order)}
              title="Book Again"
              className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>{tHistory('bookAgain')}</span>
            </button>
          )}
          <Link
            href={`/bookings/${order.id}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            title="View Details"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

