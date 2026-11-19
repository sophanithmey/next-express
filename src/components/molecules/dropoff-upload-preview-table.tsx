'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { MAX_DROPOFF_STOPS } from '@/lib/constants';

interface DropoffUploadPreviewTableProps {
  stops: DropoffStop[];
}

export function DropoffUploadPreviewTable({ stops }: DropoffUploadPreviewTableProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  if (stops.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">
          {tBooking('bulkReadyBadge')}: {stops.length} {tCommon('stops')}
        </span>
        {stops.length >= MAX_DROPOFF_STOPS && (
          <span className="text-amber-700 flex items-center gap-1 text-[11px] font-medium">
            <AlertCircle className="h-3 w-3" />
            <span>Max {MAX_DROPOFF_STOPS} stops per booking</span>
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-600">
            <tr>
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">{tBooking('bulkColRecipient')}</th>
              <th className="py-2 px-3">{tBooking('bulkColPhone')}</th>
              <th className="py-2 px-3">{tBooking('bulkColAddress')}</th>
              <th className="py-2 px-3">{tBooking('bulkColCod')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {stops.map((stop, i) => (
              <tr key={stop.id || i} className="hover:bg-slate-50/50">
                <td className="py-2 px-3 font-bold font-mono text-slate-500">{i + 1}</td>
                <td className="py-2 px-3 font-medium text-slate-900">
                  {stop.recipient?.name || '—'}
                </td>
                <td className="py-2 px-3 font-mono">{stop.recipient?.phoneNumber || '—'}</td>
                <td className="py-2 px-3 truncate max-w-[200px]">
                  {stop.dropoff?.address || '—'}
                </td>
                <td className="py-2 px-3 font-mono font-semibold">
                  {(stop.codAmount ?? 0) > 0 ? `$${stop.codAmount?.toFixed(2)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
