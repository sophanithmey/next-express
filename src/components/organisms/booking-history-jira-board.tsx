'use client';

import React from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { CopiedState } from '@/features/booking/hooks/use-booking-history';
import { useBookingJiraBoard } from '@/features/booking/hooks/use-booking-jira-board';
import { BookingJiraColumn } from '../molecules/booking-jira-column';
import { BookingJiraDetailModal } from './booking-jira-detail-modal';
import { BookingJiraBoardHeader } from '../molecules/booking-jira-board-header';
import { EmptyState } from '../molecules/empty-state';
import { Button } from '../atoms/button';
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
  const {
    isDark,
    toggleDark,
    selectedOrder,
    columnsData,
    handleCardClick,
    handleCloseModal,
  } = useBookingJiraBoard({ orders });

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
      <BookingJiraBoardHeader
        ordersCount={orders.length}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

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
        onClose={handleCloseModal}
        onBookAgain={onBookAgain}
      />
    </div>
  );
}
