'use client';

import React from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { CopiedState } from '@/features/booking/hooks/use-booking-history';
import { BookingJiraCard } from './booking-jira-card';
import { cn } from '@/lib/cn';

interface BookingJiraColumnProps {
  id: string;
  title: string;
  orders: BookingOrder[];
  copiedItem?: CopiedState | null;
  onCopyId?: (order: BookingOrder) => void;
  onCopyLink?: (order: BookingOrder) => void;
  onNavigateDetail?: (orderId: string) => void;
  isDark?: boolean;
  emptyLabel?: string;
}

/**
 * Single Kanban status column formatted in Jira Software aesthetic.
 */
export function BookingJiraColumn({
  title,
  orders,
  copiedItem,
  onCopyId,
  onCopyLink,
  onNavigateDetail,
  isDark = true,
  emptyLabel = 'No orders',
}: BookingJiraColumnProps) {
  const count = orders.length;

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-w-[280px] max-w-[360px] rounded-xl p-2.5 transition-colors shrink-0',
        isDark
          ? 'bg-[#181b20] border border-[#2b313a]'
          : 'bg-slate-100/80 border border-slate-200/80',
      )}
    >
      {/* Column Status Header + Count Pill */}
      <div className="flex items-center justify-between pb-2.5 px-1 select-none">
        <h3
          className={cn(
            'text-xs font-bold tracking-wider uppercase',
            isDark ? 'text-slate-300' : 'text-slate-700',
          )}
        >
          {title}
        </h3>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[11px] font-bold font-mono',
            isDark
              ? 'bg-[#282e38] text-slate-200 border border-[#3b434f]'
              : 'bg-white text-slate-700 border border-slate-200 shadow-2xs',
          )}
        >
          {count}
        </span>
      </div>

      {/* Vertical Card List */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
        {orders.length === 0 ? (
          <div
            className={cn(
              'rounded-lg border-2 border-dashed p-4 text-center text-xs select-none',
              isDark
                ? 'border-[#2d333e] text-slate-500'
                : 'border-slate-200 text-slate-400',
            )}
          >
            {emptyLabel}
          </div>
        ) : (
          orders.map((order) => (
            <BookingJiraCard
              key={order.id}
              order={order}
              copiedItem={copiedItem}
              onCopyId={onCopyId}
              onCopyLink={onCopyLink}
              onNavigateDetail={onNavigateDetail}
              isDark={isDark}
            />
          ))
        )}
      </div>
    </div>
  );
}
