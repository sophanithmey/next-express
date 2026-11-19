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
      {/* Unified Status Capsule (Stops Counter + COD Summary) */}
      {showStatus && (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-2xs transition shrink-0',
            isCodOverLimit
              ? 'border-danger-200 bg-danger-50 text-danger-700'
              : 'border-slate-200/80 bg-slate-50/90 text-slate-700'
          )}
        >
          {isMultiDrop && (
            <span className="font-semibold text-slate-700">
              <strong className="font-bold text-slate-900">{currentStopsCount}</strong>
              <span className="text-slate-400">/{maxStops}</span>{' '}
              <span className="hidden sm:inline font-medium text-slate-500">{tCommon('stops')}</span>
            </span>
          )}

          {isMultiDrop && totalCod > 0 && (
            <span className="text-slate-300 text-[10px] select-none" aria-hidden="true">•</span>
          )}

          {totalCod > 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono font-bold',
                isCodOverLimit ? 'text-danger-700' : 'text-slate-900'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-bold tracking-wide uppercase px-1 py-0.5 rounded',
                  isCodOverLimit
                    ? 'bg-danger-100 text-danger-700'
                    : 'bg-amber-100/90 text-amber-900'
                )}
              >
                COD
              </span>
              ${totalCod.toFixed(2)}
              {isCodOverLimit && (
                <span className="font-normal text-danger-600 text-[10px]">
                  / ${MAX_TOTAL_COD_USD}
                </span>
              )}
            </span>
          )}
        </div>
      )}

      {/* Unified Segmented Action Toolbar */}
      <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white p-0.5 shadow-2xs shrink-0">
        {canOptimize && (
          <>
            <button
              type="button"
              onClick={onOptimizeRoute}
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary-500/30 focus-visible:outline-none"
              title={tBooking('optimizeRouteTitle')}
              aria-label={tBooking('optimizeRoute')}
            >
              <Route className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
              <span className="hidden md:inline">{tBooking('optimizeRoute')}</span>
              <span className="hidden xs:inline md:hidden">Optimize</span>
            </button>
            <div className="h-3.5 w-px bg-slate-200 my-auto shrink-0" aria-hidden="true" />
          </>
        )}

        <button
          type="button"
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary-500/30 focus-visible:outline-none"
          title={tBooking('dropoffUploadModalTitle')}
          aria-label={tBooking('dropoffUploadCsvExcel')}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="hidden md:inline">{tBooking('dropoffUploadCsvExcel')}</span>
          <span className="hidden sm:inline md:hidden">CSV / Excel</span>
          <span className="hidden xs:inline sm:hidden">Import</span>
        </button>
      </div>
    </div>
  );
}
