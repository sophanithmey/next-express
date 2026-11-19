'use client';

import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DropoffActionButtonsProps {
  onAddStop: () => void;
  onFileUpload: (file: File) => void;
  onOpenUploadModal: () => void;
  disabled?: boolean;
  maxStops?: number;
  isProcessing?: boolean;
}

export function DropoffActionButtons({
  onAddStop,
  onFileUpload,
  onOpenUploadModal,
  disabled = false,
  maxStops = 5,
  isProcessing = false,
}: DropoffActionButtonsProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Primary: Add Destination Button */}
      <button
        type="button"
        onClick={onAddStop}
        disabled={disabled}
        className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-primary-300 bg-primary-50/50 hover:bg-primary-100/70 text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
      >
        {!disabled && <Plus className="h-3.5 w-3.5 text-slate-900" />}
        <span>
          {disabled
            ? tBooking('maxStopsReached', { max: maxStops })
            : tBooking('addAnother')}
        </span>
      </button>

      {/* Secondary: Upload CSV / Excel Button */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs hover:shadow-xs transition cursor-pointer disabled:opacity-50"
          title="Upload Excel (.xlsx, .xls) or CSV file"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>{isProcessing ? tCommon('loading') : tBooking('dropoffUploadCsvExcel')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenUploadModal}
          className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 shadow-2xs transition cursor-pointer"
          title={tBooking('dropoffUploadModalTitle')}
          aria-label={tBooking('dropoffUploadModalTitle')}
        >
          <Upload className="h-3.5 w-3.5 text-secondary-600" />
        </button>
      </div>
    </div>
  );
}
