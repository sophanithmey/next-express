'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Package,
  UploadCloud,
} from 'lucide-react';
import { MAX_BULK_ORDERS, MAX_STOPS_PER_BULK_ORDER } from '@/lib/constants';

interface BulkOrderListHeaderProps {
  ordersCount: number;
  allExpanded: boolean;
  onToggleAll: () => void;
  onOpenUploadModal: () => void;
}

/**
 * Header bar for BulkOrderListSection with order counter, Expand/Collapse All,
 * and Upload / Paste CSV trigger.
 */
export function BulkOrderListHeader({
  ordersCount,
  allExpanded,
  onToggleAll,
  onOpenUploadModal,
}: BulkOrderListHeaderProps) {
  const tBooking = useTranslations('Booking');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-amber-800 border border-primary-300 shadow-2xs">
          <Package className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold tracking-tight text-brand-950">
              {tBooking('bulkOrdersSectionTitle')}
            </h2>
            <span className="inline-flex items-center rounded-full bg-primary-50 border border-primary-300/90 px-2 py-0.5 text-[11px] font-bold font-mono text-primary-950">
              {ordersCount}/{MAX_BULK_ORDERS}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {tBooking('bulkOrdersShortSubtitle', {
              maxOrders: MAX_BULK_ORDERS,
              maxStops: MAX_STOPS_PER_BULK_ORDER,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {ordersCount > 0 && (
          <button
            type="button"
            onClick={onToggleAll}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap transition cursor-pointer"
          >
            {allExpanded ? (
              <ChevronsDownUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>
              {allExpanded ? tBooking('collapse') : tBooking('bulkExpandAll')}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={onOpenUploadModal}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 px-3 text-xs font-bold text-slate-950 whitespace-nowrap shadow-2xs transition cursor-pointer"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>{tBooking('bulkUploadPasteButton')}</span>
        </button>
      </div>
    </div>
  );
}
