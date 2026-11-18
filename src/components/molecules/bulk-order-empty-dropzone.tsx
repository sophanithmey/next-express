'use client';

import React, { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import {
  Download,
  FileSpreadsheet,
  Plus,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { MAX_BULK_ORDERS, MAX_STOPS_PER_BULK_ORDER } from '@/lib/constants';

interface BulkOrderEmptyDropzoneProps {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onOpenUploadModal: () => void;
  onLoadSample: () => void;
  onDownloadXlsx: () => void;
  onDownloadCsv: () => void;
  onAddOrder: () => void;
}

/**
 * Empty-state spreadsheet dropzone for BulkOrderListSection offering file upload,
 * CSV paste, sample data prefill, downloadable templates, and manual entry.
 */
export function BulkOrderEmptyDropzone({
  onFileChange,
  onOpenUploadModal,
  onLoadSample,
  onDownloadXlsx,
  onDownloadCsv,
  onAddOrder,
}: BulkOrderEmptyDropzoneProps) {
  const tBooking = useTranslations('Booking');

  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 sm:p-8 text-center space-y-5">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-amber-800 border border-primary-300">
        <FileSpreadsheet className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-md mx-auto">
        <h4 className="text-sm font-bold text-slate-900">
          {tBooking('bulkEmptyTitle')}
        </h4>
        <p className="text-xs text-slate-500">
          {tBooking('bulkEmptySubtitle', {
            maxOrders: MAX_BULK_ORDERS,
            maxStops: MAX_STOPS_PER_BULK_ORDER,
          })}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <label className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-2xs transition cursor-pointer">
          <UploadCloud className="h-4 w-4" />
          <span>{tBooking('bulkUploadFile')}</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
        <button
          type="button"
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
        >
          <span>{tBooking('bulkPasteCsvButton')}</span>
        </button>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 text-amber-600" />
          <span>{tBooking('bulkLoadSampleOrders')}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
        <button
          type="button"
          onClick={onDownloadXlsx}
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline cursor-pointer"
        >
          <Download className="h-3 w-3" />
          <span>{tBooking('bulkDownloadXlsx')}</span>
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={onDownloadCsv}
          className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:underline cursor-pointer"
        >
          <Download className="h-3 w-3" />
          <span>{tBooking('bulkDownloadCsv')}</span>
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={onAddOrder}
          className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span>{tBooking('bulkAddOrderManual')}</span>
        </button>
      </div>
    </div>
  );
}
