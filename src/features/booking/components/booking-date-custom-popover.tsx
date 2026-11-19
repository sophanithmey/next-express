'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface BookingDateCustomPopoverProps {
  draftStart: string;
  draftEnd: string;
  onChangeStart: (val: string) => void;
  onChangeEnd: (val: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function BookingDateCustomPopover({
  draftStart,
  draftEnd,
  onChangeStart,
  onChangeEnd,
  onApply,
  onCancel,
}: BookingDateCustomPopoverProps) {
  const tHistory = useTranslations('BookingHistory');
  const tCommon = useTranslations('Common');

  return (
    <div className="mt-2 space-y-2.5 border-t border-slate-100 pt-2.5 px-1.5 pb-1">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {tHistory('dateFrom')}
          </label>
          <input
            type="date"
            value={draftStart}
            onChange={(e) => onChangeStart(e.target.value)}
            className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50/70 px-2 text-xs text-slate-900 focus:border-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {tHistory('dateTo')}
          </label>
          <input
            type="date"
            value={draftEnd}
            onChange={(e) => onChangeEnd(e.target.value)}
            className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50/70 px-2 text-xs text-slate-900 focus:border-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="h-7 rounded-lg px-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
        >
          {tCommon('cancel')}
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={!draftStart && !draftEnd}
          className="h-7 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-3 text-xs font-bold text-slate-950 transition cursor-pointer shadow-2xs"
        >
          {tHistory('applyDateRange')}
        </button>
      </div>
    </div>
  );
}
