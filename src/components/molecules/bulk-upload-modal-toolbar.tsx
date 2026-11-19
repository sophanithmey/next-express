'use client';

import React from 'react';
import { Download, UploadCloud, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  downloadSampleCsvTemplate,
  downloadSampleXlsxTemplate,
} from '@/features/booking/services/bulk-order-parser';

interface BulkUploadModalToolbarProps {
  isUploading: boolean;
  onLoadSample: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BulkUploadModalToolbar({
  isUploading,
  onLoadSample,
  onFileUpload,
}: BulkUploadModalToolbarProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50/40 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void downloadSampleXlsxTemplate()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-800 shadow-2xs transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-emerald-600" />
          <span>{tBooking('bulkDownloadXlsx')}</span>
        </button>
        <button
          type="button"
          onClick={downloadSampleCsvTemplate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 shadow-2xs transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>{tBooking('bulkDownloadCsv')}</span>
        </button>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 font-bold text-amber-800 shadow-2xs transition cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 text-amber-600" />
          <span>{tBooking('bulkLoadSample')}</span>
        </button>
      </div>

      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-300 bg-primary-50 hover:bg-primary-100 font-bold text-primary-950 shadow-2xs transition cursor-pointer">
        <UploadCloud className="h-3.5 w-3.5 text-amber-700" />
        <span>{isUploading ? tCommon('loading') : tBooking('bulkUploadFile')}</span>
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={onFileUpload}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
}
