'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Repeat, Clock, ExternalLink } from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { StatusBadge } from '@/components/molecules/status-badge';

interface RecentBookingsListProps {
  bookings: BookingOrder[];
  onBookAgain: (order: BookingOrder) => void;
}

export function RecentBookingsList({
  bookings,
  onBookAgain,
}: RecentBookingsListProps) {
  const t = useTranslations('Booking');

  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('recentBookingsTitle')}
          </h3>
        </div>
        <Link
          href="/bookings"
          className="text-xs font-semibold text-secondary-700 hover:text-secondary-800 flex items-center gap-1 transition"
        >
          <span>{t('viewAllShort')}</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {bookings.slice(0, 3).map((order) => (
          <div
            key={order.id}
            className="group rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/70 hover:border-slate-200 transition text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/bookings/${order.id}`}
                className="font-mono font-bold text-slate-900 hover:text-secondary-700 flex items-center gap-1"
              >
                <span>{order.id}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-slate-400" />
              </Link>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-baseline justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-[160px] text-slate-700 font-medium">
                {t('toRecipientCompact', {
                  recipient: order.recipient.name || t('defaultRecipientName'),
                  address: order.dropoff.address.split(',')[0],
                })}
              </span>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                {order.createdAt.split('•')[0]?.trim() || order.createdAt}
              </span>
            </div>

            <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[11px]">
              <span className="font-mono font-bold text-slate-900">
                ${order.deliveryFee.toFixed(2)}
              </span>

              <button
                type="button"
                onClick={() => onBookAgain(order)}
                className="inline-flex items-center gap-1 font-semibold text-secondary-700 hover:text-secondary-800 hover:bg-secondary-50 px-2 py-0.5 rounded transition cursor-pointer"
                title={t('bookAgainTitle')}
              >
                <Repeat className="h-3 w-3" />
                <span>{t('bookAgain')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
