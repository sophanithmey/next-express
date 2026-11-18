'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BulkOrderFeeBreakdown } from '@/features/booking/services/bulk-batch-submitter';
import { APP_CONFIG } from '@/lib/constants';

interface BulkOrderFeeListProps {
  perOrder: Record<string, BulkOrderFeeBreakdown>;
}

export function BulkOrderFeeList({ perOrder }: BulkOrderFeeListProps) {
  const tBooking = useTranslations('Booking');
  const orderItems = Object.values(perOrder);

  if (orderItems.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
      {orderItems.map((item, idx) => (
        <div
          key={item.orderId}
          className="flex items-center justify-between px-3 py-1.5"
        >
          <span className="text-slate-600 truncate pr-2">
            {tBooking('bulkOrderLabel', { index: idx + 1 })} ({item.stopsCount})
          </span>
          <span className="font-mono font-semibold text-slate-800 shrink-0">
            {APP_CONFIG.currencySymbol}
            {item.fee.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
