'use client';

import React from 'react';
import { ParsedBulkStop } from '@/features/booking/services/bulk-dropoff-parser';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BulkDropoffPreviewTableProps {
  parsedList: ParsedBulkStop[];
  validCount: number;
}

/**
 * Displays validated spreadsheet rows (including optional COD amounts) prior to bulk import.
 */
export function BulkDropoffPreviewTable({
  parsedList,
  validCount,
}: BulkDropoffPreviewTableProps) {
  const tBooking = useTranslations('Booking');

  if (parsedList.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900">
          {tBooking('bulkPreviewTitle', {
            valid: validCount,
            total: parsedList.length,
          })}
        </span>
        {validCount > 0 && (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
            {tBooking('bulkReadyBadge')}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden max-h-56 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
            <tr>
              <th className="py-2 px-3">{tBooking('bulkColNum')}</th>
              <th className="py-2 px-3">{tBooking('bulkColRecipient')}</th>
              <th className="py-2 px-3">{tBooking('bulkColPhone')}</th>
              <th className="py-2 px-3">{tBooking('bulkColAddress')}</th>
              <th className="py-2 px-3">{tBooking('bulkColCod')}</th>
              <th className="py-2 px-3 text-right">{tBooking('bulkColStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parsedList.map((stop, idx) => (
              <tr
                key={stop.id}
                className={stop.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40'}
              >
                <td className="py-2 px-3 font-bold text-slate-500">{idx + 1}</td>
                <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-[120px]">
                  {stop.recipientName || '—'}
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  {stop.phoneNumber || '—'}
                </td>
                <td className="py-2 px-3 text-slate-600 truncate max-w-[160px]">
                  <div className="flex items-center gap-1.5 truncate">
                    {stop.coordinates && (
                      <span
                        className="shrink-0 text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1 py-0.5 rounded"
                        title={`GPS: ${stop.coordinates.lat.toFixed(5)}, ${stop.coordinates.lng.toFixed(5)}`}
                      >
                        GPS
                      </span>
                    )}
                    <span className="truncate" title={stop.address}>
                      {stop.address || '—'}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3 font-mono font-semibold text-amber-800">
                  {typeof stop.codAmount === 'number' && stop.codAmount > 0
                    ? `$${stop.codAmount.toFixed(2)}`
                    : '—'}
                </td>
                <td className="py-2 px-3 text-right">
                  {stop.isValid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{tBooking('bulkStatusValid')}</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-danger-600"
                      title={stop.error}
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span className="truncate max-w-[90px]">{stop.error}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

