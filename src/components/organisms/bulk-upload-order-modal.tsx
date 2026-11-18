'use client';

import React, { useState } from 'react';
import {
  BulkOrderDraft,
  ParsedBulkOrder,
  parseBulkOrderText,
  convertOrdersToBulkDrafts,
  downloadSampleCsvTemplate,
  downloadSampleXlsxTemplate,
  parseBulkOrderFile,
  SAMPLE_BULK_CSV,
} from '@/features/booking/services/bulk-order-parser';
import { Button } from '../atoms/button';
import { BulkOrderPreviewTable } from '../molecules/bulk-order-preview-table';
import {
  MAX_BULK_ORDERS,
  MAX_STOPS_PER_BULK_ORDER,
  MAX_TOTAL_COD_USD,
} from '@/lib/constants';
import { X, Package, Download, Zap, UploadCloud, Info, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BulkUploadOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOrders: (orders: BulkOrderDraft[]) => void;
}

export function BulkUploadOrderModal({
  isOpen,
  onClose,
  onApplyOrders,
}: BulkUploadOrderModalProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const [inputText, setInputText] = useState('');
  const [parsedOrders, setParsedOrders] = useState<ParsedBulkOrder[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setInputText(text);
    setParsedOrders(parseBulkOrderText(text));
  };

  const handleLoadSample = () => handleTextChange(SAMPLE_BULK_CSV);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const text = await parseBulkOrderFile(file);
      handleTextChange(text);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const importableOrders = parsedOrders
    .filter((o) => !o.exceedsOrderLimit && o.validStopCount > 0)
    .slice(0, MAX_BULK_ORDERS);
  const importOrderCount = importableOrders.length;
  const totalStopCount = importableOrders.reduce(
    (sum, o) => sum + o.validStopCount,
    0,
  );
  const codOverLimitOrders = importableOrders.filter((o) => o.isCodOverLimit);

  const handleImport = () => {
    if (importOrderCount === 0) return;
    const drafts = convertOrdersToBulkDrafts(importableOrders);
    onApplyOrders(drafts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] min-h-[540px] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 select-text">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-slate-950 shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {tBooking('bulkOrderModalTitle')}
                </h3>
                <span className="rounded-full bg-primary-50 border border-primary-300 px-2 py-0.5 text-[10px] font-bold text-primary-950">
                  {tBooking('bulkOrderBadge')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {tBooking('bulkOrderModalSubtitle')}
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

        {/* Capacity hint */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-primary-50/60 border-b border-primary-100 text-xs text-primary-950">
          <Info className="h-3.5 w-3.5 shrink-0 text-amber-700" />
          <span>
            {tBooking('bulkOrderCapacityHint', {
              maxOrders: MAX_BULK_ORDERS,
              maxStops: MAX_STOPS_PER_BULK_ORDER,
            })}
          </span>
        </div>

        {/* Toolbar */}
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
              onClick={handleLoadSample}
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
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
              <label htmlFor="bulk-order-input" className="font-bold text-slate-800">
                {tBooking('bulkInputLabel')}
              </label>
              <span className="text-[11px] text-slate-400">
                {tBooking('bulkOrderFormatHint')}{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">
                  Order #, Name, Phone, Address (or lat,lng), COD, Note
                </code>
              </span>
            </div>
            <textarea
              id="bulk-order-input"
              rows={5}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Order #, Recipient Name, Recipient Phone, Drop-off Address, COD Amount, Delivery Note\n1, Sokha Chan, 012345678, St 310 BKK1 Phnom Penh, 25, Leave with guard\n1, Dara Vong, 098112233, "11.5564, 104.9282", 18.50, Red gate\n2, Bopha Pich, 077445566, St 271 Toul Tompoung, 0, Call on arrival`}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition shadow-2xs"
            />
          </div>

          {parsedOrders.length > MAX_BULK_ORDERS && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
              {tBooking('bulkMaxOrdersNotice', {
                total: parsedOrders.length,
                max: MAX_BULK_ORDERS,
              })}
            </div>
          )}

          {codOverLimitOrders.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-medium text-danger-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {tBooking('bulkOrderCodNotice', {
                  count: codOverLimitOrders.length,
                  max: MAX_TOTAL_COD_USD,
                })}
              </span>
            </div>
          )}

          <BulkOrderPreviewTable orders={parsedOrders} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/80">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <div className="flex items-center gap-3">
            {importOrderCount > 0 && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {tBooking('bulkOrderImportSummary', {
                  orders: importOrderCount,
                  stops: totalStopCount,
                })}
              </span>
            )}
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleImport}
              disabled={importOrderCount === 0}
              leftIcon={<Package className="h-4 w-4" />}
            >
              {tBooking('bulkOrderImportButton', { count: importOrderCount })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
