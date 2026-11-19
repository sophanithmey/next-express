'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { MAX_STOPS_PER_BULK_ORDER } from '@/lib/constants';

interface BulkOrderCardHeaderProps {
  index: number;
  canReorder?: boolean;
  stopsCount: number;
  orderCod: number;
  isCodOverLimit: boolean;
  estimatedFee: number;
  isExpanded: boolean;
  hasOrderErrors: boolean;
  recipientPreview: string;
  onToggleExpand: () => void;
  onRemoveOrder: () => void;
}

/**
 * Collapsible header row for a single order inside the Bulk Upload workspace.
 */
export function BulkOrderCardHeader({
  index,
  canReorder = false,
  stopsCount,
  orderCod,
  isCodOverLimit,
  estimatedFee,
  isExpanded,
  hasOrderErrors,
  recipientPreview,
  onToggleExpand,
  onRemoveOrder,
}: BulkOrderCardHeaderProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  return (
    <div className="flex items-center justify-between gap-2.5 px-4 sm:px-5 py-3.5 bg-white hover:bg-slate-50/50 transition">
      {canReorder && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="order-drag-handle touch-none shrink-0 flex items-center justify-center p-1.5 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-grab active:cursor-grabbing transition"
          title={tBooking('dragToReorder')}
          aria-label={tBooking('dragToReorder')}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <button
        type="button"
        onClick={onToggleExpand}
        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-xs font-extrabold text-slate-950">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">
              {tBooking('bulkOrderLabel', { index: index + 1 })}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {stopsCount}/{MAX_STOPS_PER_BULK_ORDER}{' '}
              {tCommon('stops').toLowerCase()}
            </span>
            {orderCod > 0 && (
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  isCodOverLimit
                    ? 'border-danger-200 bg-danger-50 text-danger-700'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
              >
                COD ${orderCod.toFixed(2)}
              </span>
            )}
          </div>
          {!isExpanded && (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {recipientPreview}
            </p>
          )}
        </div>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-mono font-bold text-slate-800 hidden sm:inline">
          ${estimatedFee.toFixed(2)}
        </span>
        {hasOrderErrors ? (
          <AlertCircle
            className="h-4 w-4 text-danger-500 shrink-0"
            aria-label={tBooking('needsDetails')}
          />
        ) : (
          <CheckCircle2
            className="h-4 w-4 text-emerald-500 shrink-0"
            aria-label={tBooking('bulkStatusValid')}
          />
        )}
        <button
          type="button"
          onClick={onRemoveOrder}
          className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition cursor-pointer"
          title={tCommon('remove')}
          aria-label={tCommon('remove')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleExpand}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label={isExpanded ? tBooking('collapse') : tBooking('configure')}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
