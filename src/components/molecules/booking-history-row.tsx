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
  Bike,
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

/**
 * Modern, clean table row for dispatched courier bookings.
 */
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
      className="group hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100 last:border-0"
    >
      {/* Tracking Number & Date */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-slate-950 transition-colors">
            {order.trackingNumber}
          </span>
          <button
            type="button"
            title="Copy Tracking Number"
            onClick={(e) => {
              e.stopPropagation();
              onCopyId?.(order);
            }}
            className="rounded p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            {isCopiedId ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
        <span className="text-[11px] text-slate-400 block mt-0.5 font-normal">
          {formatOrderTimestamp(order.createdAt)}
        </span>
      </td>

      {/* Recipient & Destination */}
      <td className="px-4 py-3 max-w-xs align-middle">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-xs text-slate-900">
            {order.recipient.name || tHistory('defaultCustomer')}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            · {formatPhoneNumber(order.recipient.phoneNumber)}
          </span>
          {stopsCount > 1 && (
            <span className="rounded-full bg-primary-50 px-1.5 py-0.2 text-[10px] font-bold text-primary-950 border border-primary-300">
              {tHistory('stopsBadge', { count: stopsCount })}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
          <span className="truncate">{order.dropoff.address}</span>
        </div>
      </td>

      {/* Status & Assigned Rider */}
      <td className="px-4 py-3 align-middle">
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={order.status} />
          {order.deliverer && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Bike className="h-3 w-3 text-slate-400" />
              <span>{order.deliverer.name}</span>
            </span>
          )}
        </div>
      </td>

      {/* COD Collection */}
      <td className="px-4 py-3 align-middle font-mono text-xs">
        {order.cod.isCod && order.cod.amount > 0 ? (
          <span className="inline-block rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 font-bold text-amber-900">
            {APP_CONFIG.currencySymbol}{order.cod.amount.toFixed(2)}
          </span>
        ) : (
          <span className="text-slate-300 font-normal">—</span>
        )}
      </td>

      {/* Delivery Fee */}
      <td className="px-4 py-3 align-middle font-mono font-semibold text-xs text-slate-900">
        {APP_CONFIG.currencySymbol}{order.deliveryFee.toFixed(2)}
      </td>

      {/* Actions */}
      <td
        className="px-4 py-3 text-right align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1">
          {!isCancelled && onCopyLink && (
            <button
              type="button"
              onClick={() => onCopyLink(order)}
              title="Copy Live Tracking Link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              {isCopiedLink ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {!isCancelled && (
            <Link
              href={`/track/${order.trackingNumber}`}
              title="Open Live Tracking"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}

          {onRepeatBooking && (
            <button
              type="button"
              onClick={() => onRepeatBooking(order)}
              title="Book Again"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition"
            >
              <Repeat className="h-3 w-3" />
              <span className="hidden sm:inline">{tHistory('bookAgain')}</span>
            </button>
          )}

          <Link
            href={`/bookings/${order.id}`}
            className="p-1 text-slate-300 group-hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="View Details"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
