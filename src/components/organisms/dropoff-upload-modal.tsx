'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { DropoffUploadModalHeader } from '../molecules/dropoff-upload-modal-header';
import { DropoffUploadModalToolbar } from '../molecules/dropoff-upload-modal-toolbar';
import { DropoffUploadPreviewTable } from '../molecules/dropoff-upload-preview-table';

interface DropoffUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  onChangeInputText: (text: string) => void;
  previewStops: DropoffStop[];
  isProcessing: boolean;
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  onDownloadXlsx: () => void;
  onDownloadCsv: () => void;
  onApply: () => void;
}

export function DropoffUploadModal({
  isOpen,
  onClose,
  inputText,
  onChangeInputText,
  previewStops,
  isProcessing,
  onFileUpload,
  onLoadSample,
  onDownloadXlsx,
  onDownloadCsv,
  onApply,
}: DropoffUploadModalProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  if (!isOpen) return null;

  const hasStops = previewStops.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] min-h-[500px] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 select-text">
        <DropoffUploadModalHeader onClose={onClose} />

        <DropoffUploadModalToolbar
          isProcessing={isProcessing}
          onFileUpload={onFileUpload}
          onLoadSample={onLoadSample}
          onDownloadXlsx={onDownloadXlsx}
          onDownloadCsv={onDownloadCsv}
        />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {tBooking('bulkInputLabel')}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => onChangeInputText(e.target.value)}
              placeholder="Recipient Name, Recipient Phone, Drop-off Address, COD Amount, Delivery Note&#10;Sokha Chan, 012345678, St 310 BKK1 Phnom Penh, 25, Call ahead&#10;Dara Vong, 098112233, Toul Kork Phnom Penh, 18.5, Yellow gate"
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary-400 focus:outline-hidden focus:ring-2 focus:ring-primary-100 transition resize-y"
            />
          </div>

          <DropoffUploadPreviewTable stops={previewStops} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 sm:px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition cursor-pointer"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            disabled={!hasStops || isProcessing}
            onClick={onApply}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-5 py-2 text-xs transition shadow-2xs cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{tBooking('dropoffApplyStopsButton', { count: previewStops.length })}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
