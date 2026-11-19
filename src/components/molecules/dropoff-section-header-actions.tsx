'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FileSpreadsheet, Route } from 'lucide-react';
import { MAX_TOTAL_COD_USD } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface DropoffSectionHeaderActionsProps {
  totalCod: number;
  isCodOverLimit: boolean;
  isMultiDrop: boolean;
  currentStopsCount: number;
  maxStops: number;
  onOpenUploadModal: () => void;
  onOptimizeRoute?: () => void;
}

export function DropoffSectionHeaderActions({
  totalCod,
  isCodOverLimit,
  isMultiDrop,
  currentStopsCount,
  maxStops,
  onOpenUploadModal,
  onOptimizeRoute,
}: DropoffSectionHeaderActionsProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  const canOptimize = isMultiDrop && currentStopsCount > 1 && Boolean(onOptimizeRoute);
  const showStatus = isMultiDrop || totalCod > 0;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
      {/* Unified Status Capsule (Stops + COD) */}
      {showStatus && (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-2xs transition shrink-0',
            isCodOverLimit
              ? 'border-danger-200 bg-danger-50 text-danger-700'
              : 'border-slate-200/80 bg-slate-100/90 text-slate-700'
          )}
        >
          {isMultiDrop && (
            <span className="font-bold text-slate-900">
              {currentStopsCount}/{maxStops}{' '}
              <span className="hidden sm:inline">{tCommon('stops')}</span>
            </span>
          )}
          {isMultiDrop && totalCod > 0 && (
            <span className="text-slate-300 text-[10px] select-none">•</span>
          )}
          {totalCod > 0 && (
            <span
              className={cn(
                'font-mono font-bold',
                isCodOverLimit ? 'text-danger-700' : 'text-amber-800'
              )}
            >
              COD ${totalCod.toFixed(2)}
              {isCodOverLimit && ` / $${MAX_TOTAL_COD_USD}`}
            </span>
          )}
        </div>
      )}

      {/* Unified Action Controls */}
      <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white p-0.5 shadow-2xs shrink-0">
        {canOptimize && (
          <>
            <button
              type="button"
              onClick={onOptimizeRoute}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition cursor-pointer"
              title={tBooking('optimizeRouteTitle')}
            >
              <Route className="h-3.5 w-3.5 text-secondary-600" />
              <span className="hidden md:inline">{tBooking('optimizeRoute')}</span>
              <span className="md:hidden">Optimize</span>
            </button>
            <div className="h-3.5 w-px bg-slate-200 my-auto shrink-0" />
          </>
        )}

        <button
          type="button"
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition cursor-pointer"
          title={tBooking('dropoffUploadModalTitle')}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden md:inline">{tBooking('dropoffUploadCsvExcel')}</span>
          <span className="hidden sm:inline md:hidden">CSV / Excel</span>
          <span className="sm:hidden">Import</span>
        </button>
      </div>
    </div>
  );
}
