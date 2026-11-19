'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

interface DropoffUploadModalToolbarProps {
  isProcessing: boolean;
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  onDownloadXlsx: () => void;
  onDownloadCsv: () => void;
}

export function DropoffUploadModalToolbar({
  isProcessing,
  onFileUpload,
  onLoadSample,
  onDownloadXlsx,
  onDownloadCsv,
}: DropoffUploadModalToolbarProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white px-5 sm:px-6 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>{isProcessing ? tCommon('loading') : tBooking('bulkUploadFile')}</span>
        </button>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
        >
          <span>{tBooking('dropoffLoadSample')}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[11px] font-medium hidden sm:inline">Templates:</span>
        <button
          type="button"
          onClick={onDownloadXlsx}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>{tBooking('dropoffDownloadXlsx')}</span>
        </button>
        <button
          type="button"
          onClick={onDownloadCsv}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>{tBooking('dropoffDownloadCsv')}</span>
        </button>
      </div>
    </div>
  );
}
