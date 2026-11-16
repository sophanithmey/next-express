'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText, FileCode2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BookingOrder } from '../types/booking-types';
import {
  exportOrdersToCsv,
  exportOrdersToPdf,
  exportOrdersToXlsx,
  ExportFormat,
} from '../services/booking-export-service';
import { cn } from '@/lib/cn';

interface BookingExportMenuProps {
  orders: BookingOrder[];
  disabled?: boolean;
}

/**
 * Dropdown menu for exporting orders to PDF, XLSX, and CSV formats.
 */
export function BookingExportMenu({ orders, disabled = false }: BookingExportMenuProps) {
  const tHistory = useTranslations('BookingHistory');
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExport = async (format: ExportFormat) => {
    if (orders.length === 0) {
      toast.error(tHistory('exportEmpty'));
      setIsOpen(false);
      return;
    }

    try {
      setIsExporting(format);
      let filename = '';
      if (format === 'xlsx') {
        filename = await exportOrdersToXlsx(orders);
      } else if (format === 'csv') {
        filename = exportOrdersToCsv(orders);
      } else if (format === 'pdf') {
        filename = exportOrdersToPdf(orders);
      }
      toast.success(
        tHistory('exportSuccess', { count: orders.length, format: format.toUpperCase() }) +
          ` (${filename})`,
      );
    } catch {
      toast.error('Failed to export orders. Please try again.');
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled || isExporting !== null}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-2.5 sm:px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs whitespace-nowrap',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-label="Export orders"
        aria-expanded={isOpen}
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
        ) : (
          <Download className="h-3.5 w-3.5 text-slate-500" />
        )}
        <span>{tHistory('exportButton')}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            <span>{tHistory('exportOptions')}</span>
            <span className="font-mono text-slate-500 text-[10px]">{orders.length} orders</span>
          </div>

          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => void handleExport('pdf')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-900 transition cursor-pointer text-left"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-700 shrink-0">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{tHistory('exportPdf')}</p>
                <p className="text-[10px] text-slate-400">Printable manifest</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => void handleExport('xlsx')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer text-left"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{tHistory('exportXlsx')}</p>
                <p className="text-[10px] text-slate-400">Microsoft Excel</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => void handleExport('csv')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition cursor-pointer text-left"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-700 shrink-0">
                <FileCode2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{tHistory('exportCsv')}</p>
                <p className="text-[10px] text-slate-400">Standard CSV table</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
