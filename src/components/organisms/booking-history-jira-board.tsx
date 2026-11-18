'use client';

import React, { useMemo, useState } from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { CopiedState } from '@/features/booking/hooks/use-booking-history';
import { BookingJiraColumn } from '../molecules/booking-jira-column';
import { BookingJiraDetailModal } from './booking-jira-detail-modal';
import { EmptyState } from '../molecules/empty-state';
import { Button } from '../atoms/button';
import { Moon, Sun } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface BookingHistoryJiraBoardProps {
  orders: BookingOrder[];
  isLoading?: boolean;
  copiedItem?: CopiedState | null;
  onCopyId?: (order: BookingOrder) => void;
  onCopyLink?: (order: BookingOrder) => void;
  onNavigateDetail?: (orderId: string) => void;
  onBookAgain?: (order: BookingOrder) => void;
  onClearFilters?: () => void;
}

/**
 * 5-Stage Compact Kanban Board with expansive Jira issue detail modal:
 * Pending, Accepted, In Transit, Fulfilled, Cancelled.
 */
export function BookingHistoryJiraBoard({
  orders,
  isLoading = false,
  copiedItem,
  onCopyId,
  onCopyLink,
  onBookAgain,
  onClearFilters,
}: BookingHistoryJiraBoardProps) {
  const tHistory = useTranslations('BookingHistory');
  const [isDark, setIsDark] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);

  // Partition orders by the 5 operational lifecycle statuses
  const columnsData = useMemo(() => {
    const pending: BookingOrder[] = [];
    const accepted: BookingOrder[] = [];
    const inTransit: BookingOrder[] = [];
    const fulfilled: BookingOrder[] = [];
    const cancelled: BookingOrder[] = [];

    for (const order of orders) {
      if (order.status === 'draft' || order.status === 'pending' || order.status === 'confirmed') {
        pending.push(order);
      } else if (order.status === 'assigned') {
        accepted.push(order);
      } else if (order.status === 'out_for_delivery') {
        inTransit.push(order);
      } else if (order.status === 'delivered') {
        fulfilled.push(order);
      } else if (order.status === 'cancelled') {
        cancelled.push(order);
      }
    }

    return { pending, accepted, inTransit, fulfilled, cancelled };
  }, [orders]);

  const handleCardClick = (orderId: string) => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setSelectedOrder(found);
    }
  };

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
    <div className={cn('space-y-2.5 transition-opacity', isLoading && 'opacity-60')}>
      {/* Board Header & Optional Column Contrast Switcher */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">
            {tHistory('viewCompact')} Board
          </span>
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
            {orders.length} cards
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          title={isDark ? 'Switch to light board columns' : 'Switch to dark board columns'}
          aria-label={isDark ? 'Switch to light board columns' : 'Switch to dark board columns'}
          className={cn(
            'flex items-center justify-center h-7 w-7 rounded-lg border text-xs transition cursor-pointer shadow-2xs',
            isDark
              ? 'bg-[#181b20] text-amber-300 border-[#373e47] hover:bg-[#22272e]'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900',
          )}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 5 Status Columns: Pending, Accepted, In Transit, Fulfilled, Cancelled */}
      <div
        className={cn(
          'flex gap-3 rounded-2xl p-3 border transition-colors overflow-x-auto',
          isDark
            ? 'bg-[#0d1117] border-[#21262d]'
            : 'bg-slate-50/70 border-slate-200/80',
        )}
      >
        <BookingJiraColumn
          id="pending"
          title={tHistory('colPending')}
          orders={columnsData.pending}
          copiedItem={copiedItem}
          onCopyId={onCopyId}
          onCopyLink={onCopyLink}
          onNavigateDetail={handleCardClick}
          isDark={isDark}
          emptyLabel={tHistory('noOrdersInStage')}
        />

        <BookingJiraColumn
          id="accepted"
          title={tHistory('colAccepted')}
          orders={columnsData.accepted}
          copiedItem={copiedItem}
          onCopyId={onCopyId}
          onCopyLink={onCopyLink}
          onNavigateDetail={handleCardClick}
          isDark={isDark}
          emptyLabel={tHistory('noOrdersInStage')}
        />

        <BookingJiraColumn
          id="in_transit"
          title={tHistory('colInTransit')}
          orders={columnsData.inTransit}
          copiedItem={copiedItem}
          onCopyId={onCopyId}
          onCopyLink={onCopyLink}
          onNavigateDetail={handleCardClick}
          isDark={isDark}
          emptyLabel={tHistory('noOrdersInStage')}
        />

        <BookingJiraColumn
          id="fulfilled"
          title={tHistory('colFulfilled')}
          orders={columnsData.fulfilled}
          copiedItem={copiedItem}
          onCopyId={onCopyId}
          onCopyLink={onCopyLink}
          onNavigateDetail={handleCardClick}
          isDark={isDark}
          emptyLabel={tHistory('noOrdersInStage')}
        />

        <BookingJiraColumn
          id="cancelled"
          title={tHistory('colCancelled')}
          orders={columnsData.cancelled}
          copiedItem={copiedItem}
          onCopyId={onCopyId}
          onCopyLink={onCopyLink}
          onNavigateDetail={handleCardClick}
          isDark={isDark}
          emptyLabel={tHistory('noOrdersInStage')}
        />
      </div>

      {/* Expansive Jira Details Modal (Opened on Card Click) */}
      <BookingJiraDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onBookAgain={onBookAgain}
      />
    </div>
  );
}
