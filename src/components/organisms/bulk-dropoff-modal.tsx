'use client';

import React, { useState } from 'react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import {
  parseBulkDropoffText,
  convertParsedToDropoffStops,
  downloadSampleCsvTemplate,
  SAMPLE_BULK_CSV,
  ParsedBulkStop,
} from '@/features/booking/services/bulk-dropoff-parser';
import { Button } from '../atoms/button';
import { BulkDropoffPreviewTable } from '../molecules/bulk-dropoff-preview-table';
import { MAX_DROPOFF_STOPS, MAX_TOTAL_COD_USD } from '@/lib/constants';
import { X, Layers, Download, Zap, UploadCloud } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BulkDropoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStops: (stops: DropoffStop[]) => void;
}

export function BulkDropoffModal({
  isOpen,
  onClose,
  onApplyStops,
}: BulkDropoffModalProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const [inputText, setInputText] = useState('');
  const [parsedList, setParsedList] = useState<ParsedBulkStop[]>([]);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setInputText(text);
    setParsedList(parseBulkDropoffText(text));
  };

  const handleLoadSample = () => handleTextChange(SAMPLE_BULK_CSV);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleTextChange((ev.target?.result as string) || '');
    reader.readAsText(file);
  };

  const validStops = parsedList.filter((s) => s.isValid);
  const importCount = Math.min(validStops.length, MAX_DROPOFF_STOPS);
  const importTotalCod = validStops
    .slice(0, MAX_DROPOFF_STOPS)
    .reduce((sum, s) => sum + Math.max(0, s.codAmount ?? 0), 0);

  const handleImport = () => {
    if (importCount === 0) return;
    onApplyStops(convertParsedToDropoffStops(parsedList));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-3xl max-h-[92vh] min-h-[540px] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {tBooking('bulkModalTitle')}
                </h3>
                <span className="rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  {tBooking('bulkBadge')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {tBooking('bulkModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition cursor-pointer"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar: Template Download & Sample Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50/40 text-xs">
          <div className="flex items-center gap-2">
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
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 font-bold text-amber-800 shadow-2xs transition cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              <span>{tBooking('bulkLoadSample')}</span>
            </button>
          </div>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 font-bold text-brand-700 shadow-2xs transition cursor-pointer">
            <UploadCloud className="h-3.5 w-3.5 text-brand-600" />
            <span>{tBooking('bulkUploadFile')}</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
              <label htmlFor="bulk-csv-input" className="font-bold text-slate-800">
                {tBooking('bulkInputLabel')}
              </label>
              <span className="text-[11px] text-slate-400">
                {tBooking('bulkFormatHint')}{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">
                  Name, Phone, Address, COD, Note
                </code>
              </span>
            </div>
            <textarea
              id="bulk-csv-input"
              rows={4}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Recipient Name, Recipient Phone, Drop-off Address, COD Amount, Delivery Note\nSokha Chan, 012345678, St 310 BKK1 Phnom Penh, 25, Leave with guard\nDara Vong, 098112233, St 63 Daun Penh Phnom Penh, 18.50, Red gate`}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition shadow-2xs"
            />
          </div>

          {validStops.length > MAX_DROPOFF_STOPS && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
              {tBooking('bulkMaxStopsNotice', { max: MAX_DROPOFF_STOPS })}
            </div>
          )}

          {importTotalCod > MAX_TOTAL_COD_USD && (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-medium text-danger-700">
              {tBooking('bulkMaxCodNotice', {
                total: importTotalCod.toFixed(2),
                max: MAX_TOTAL_COD_USD,
              })}
            </div>
          )}

          {/* Parsed Preview Table */}
          <BulkDropoffPreviewTable
            parsedList={parsedList}
            validCount={validStops.length}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/80">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleImport}
            disabled={importCount === 0}
            leftIcon={<Layers className="h-4 w-4" />}
          >
            {tBooking('bulkImportButton', { count: importCount })}
          </Button>
        </div>
      </div>
    </div>
  );
}
