'use client';

import React from 'react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BulkOrderStopSummaryProps {
  stop: DropoffStop;
  index: number;
  isLast: boolean;
  canRemove: boolean;
  formattedPhone: string;
  hasCod: boolean;
  hasNote: boolean;
  onOpenEditor: () => void;
  onRemove: () => void;
}

export function BulkOrderStopSummary({
  stop,
  index,
  isLast,
  canRemove,
  formattedPhone,
  hasCod,
  hasNote,
  onOpenEditor,
  onRemove,
}: BulkOrderStopSummaryProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  return (
    <div className="group flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/70 transition">
      <div className="flex flex-col items-center pt-0.5 shrink-0">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 border border-primary-300 text-[11px] font-bold text-primary-950">
          {index + 1}
        </span>
        {!isLast && <span className="mt-1.5 h-5 w-px bg-slate-200" />}
      </div>

      <button
        type="button"
        onClick={onOpenEditor}
        className="flex-1 min-w-0 text-left space-y-1 cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-900 truncate max-w-45">
            {stop.recipient.name?.trim() || tBooking('defaultRecipientName')}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-mono text-slate-600">
            {formattedPhone}
          </span>
          {hasCod && (
            <span className="rounded-md bg-amber-50 border border-amber-200/90 px-1.5 py-0.5 text-[11px] font-mono font-bold text-amber-800">
              COD ${stop.codAmount!.toFixed(2)}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 truncate">
          <span>{stop.dropoff.address}</span>
          {hasNote && (
            <span className="text-slate-400">
              {' '}
              · {stop.recipient.notes?.trim()}
            </span>
          )}
        </p>
      </button>

      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        <button
          type="button"
          onClick={onOpenEditor}
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
        >
          <Pencil className="h-3 w-3" />
          <span>{tCommon('edit')}</span>
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition cursor-pointer"
            aria-label={tCommon('remove')}
            title={tCommon('remove')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
