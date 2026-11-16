'use client';

import React from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { CopiedState } from '@/features/booking/hooks/use-booking-history';
import { Button } from '../atoms/button';
import { EmptyState } from '../molecules/empty-state';
import { BookingHistoryMobileCard } from '../molecules/booking-history-mobile-card';
import { BookingHistoryRow } from '../molecules/booking-history-row';
import { cn } from '@/lib/cn';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface BookingHistoryTableProps {
  orders: BookingOrder[];
  isLoading?: boolean;
  copiedItem?: CopiedState | null;
  onCopyId?: (order: BookingOrder) => void;
  onCopyLink?: (order: BookingOrder) => void;
  onRepeatBooking?: (order: BookingOrder) => void;
  onNavigateDetail?: (orderId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClearFilters?: () => void;
}

export function BookingHistoryTable({
  orders,
  isLoading = false,
  copiedItem = null,
  onCopyId,
  onCopyLink,
  onRepeatBooking,
  onNavigateDetail,
  currentPage,
  totalPages,
  onPageChange,
  onClearFilters,
}: BookingHistoryTableProps) {
  const tHistory = useTranslations('BookingHistory');

  if (orders.length === 0) {
    return (
      <EmptyState
        title={tHistory('noDeliveries')}
        description={tHistory('noDeliveriesDesc')}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            {onClearFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                {tHistory('resetFilters')}
              </Button>
            )}
            <Link href="/booking">
              <Button variant="primary" size="sm">
                {tHistory('createNew')}
              </Button>
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className={cn('space-y-3 transition-opacity', isLoading && 'opacity-60')}>
      {/* Mobile Card List (< md) */}
      <div className="space-y-2.5 md:hidden">
        {orders.map((order) => (
          <BookingHistoryMobileCard
            key={order.id}
            order={order}
            copiedItem={copiedItem}
            onCopyId={(o) => onCopyId?.(o)}
            onCopyLink={(o) => onCopyLink?.(o)}
            onRepeatBooking={(o) => onRepeatBooking?.(o)}
            onNavigateDetail={(id) => onNavigateDetail?.(id)}
          />
        ))}
      </div>

      {/* Desktop Data Table (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-2.5">{tHistory('colTracking')}</th>
              <th className="px-4 py-2.5">{tHistory('colRecipient')}</th>
              <th className="px-4 py-2.5">{tHistory('colStatus')}</th>
              <th className="px-4 py-2.5">{tHistory('colCod')}</th>
              <th className="px-4 py-2.5">{tHistory('colFee')}</th>
              <th className="px-4 py-2.5 text-right">{tHistory('colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <BookingHistoryRow
                key={order.id}
                order={order}
                copiedItem={copiedItem}
                onCopyId={onCopyId}
                onCopyLink={onCopyLink}
                onRepeatBooking={onRepeatBooking}
                onNavigateDetail={onNavigateDetail}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Modern Compact Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
          <span>
            {tHistory('pageOfTotal', { current: currentPage, total: totalPages })}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-8 px-2.5 text-xs rounded-lg"
            >
              {tHistory('previousPage')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-8 px-2.5 text-xs rounded-lg"
            >
              {tHistory('nextPage')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
