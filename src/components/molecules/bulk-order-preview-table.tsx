'use client';

import React, { useState } from 'react';
import { ParsedBulkOrder } from '@/features/booking/services/bulk-order-parser';
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MAX_STOPS_PER_BULK_ORDER, MAX_TOTAL_COD_USD } from '@/lib/constants';

interface BulkOrderPreviewTableProps {
  orders: ParsedBulkOrder[];
}

export function BulkOrderPreviewTable({ orders }: BulkOrderPreviewTableProps) {
  const tBooking = useTranslations('Booking');
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  if (orders.length === 0) return null;

  const importableCount = orders.filter(
    (o) => !o.exceedsOrderLimit && o.validStopCount > 0,
  ).length;
  const totalStops = orders
    .filter((o) => !o.exceedsOrderLimit)
    .reduce((sum, o) => sum + o.stops.length, 0);

  const toggleOrder = (idx: number) =>
    setExpandedOrders((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900">
          {tBooking('bulkOrderPreviewTitle', {
            orders: orders.length,
            stops: totalStops,
          })}
        </span>
        {importableCount > 0 && (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
            {tBooking('bulkReadyBadge')}
          </span>
        )}
      </div>

      {/* Grouped Order Accordions */}
      <div className="rounded-xl border border-slate-200 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100">
        {orders.map((order) => {
          const isExpanded = expandedOrders[order.orderIndex] ?? false;

          return (
            <div
              key={`${order.orderIndex}-${order.orderKey}`}
              className={order.exceedsOrderLimit ? 'opacity-55 bg-slate-50/70' : ''}
            >
              <button
                type="button"
                onClick={() => toggleOrder(order.orderIndex)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
              >
                <span className="text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </span>
                <Package className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span className="font-bold text-xs text-slate-800">
                  {tBooking('bulkOrderLabel', { index: order.orderIndex })}
                </span>
                <span className="text-[11px] text-slate-500">
                  ({order.stops.length}/{MAX_STOPS_PER_BULK_ORDER})
                </span>

                <span className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
                  {order.exceedsOrderLimit && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {tBooking('bulkOrderSkippedBadge')}
                    </span>
                  )}
                  {order.truncatedStopCount > 0 && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      {tBooking('bulkStopsTrimmedBadge', {
                        trimmed: order.truncatedStopCount,
                        max: MAX_STOPS_PER_BULK_ORDER,
                      })}
                    </span>
                  )}
                  {order.totalCod > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        order.isCodOverLimit
                          ? 'text-danger-700 bg-danger-50 border-danger-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}
                    >
                      COD ${order.totalCod.toFixed(2)}
                      {order.isCodOverLimit ? ` > $${MAX_TOTAL_COD_USD}` : ''}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      order.isValid
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-danger-600 bg-danger-50 border-danger-200'
                    }`}
                  >
                    {order.validStopCount}/{order.stops.length}{' '}
                    {tBooking('bulkStatusValid').toLowerCase()}
                  </span>
                </span>
              </button>

              {isExpanded && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-slate-100 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-1.5 px-3 pl-9">{tBooking('bulkColRecipient')}</th>
                      <th className="py-1.5 px-3">{tBooking('bulkColPhone')}</th>
                      <th className="py-1.5 px-3">{tBooking('bulkColAddress')}</th>
                      <th className="py-1.5 px-3">{tBooking('bulkColCod')}</th>
                      <th className="py-1.5 px-3 text-right">{tBooking('bulkColStatus')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {order.stops.map((stop, idx) => (
                      <tr
                        key={stop.id}
                        className={stop.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40'}
                      >
                        <td className="py-1.5 px-3 pl-9 font-semibold text-slate-900 truncate max-w-[130px]">
                          <span className="text-slate-400 font-normal mr-1.5">{idx + 1}.</span>
                          {stop.recipientName || '—'}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-slate-700">
                          {stop.phoneNumber || '—'}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 truncate max-w-[180px]">
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
                        <td className="py-1.5 px-3 font-mono font-semibold text-amber-800">
                          {typeof stop.codAmount === 'number' && stop.codAmount > 0
                            ? `$${stop.codAmount.toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-right">
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
                              <span className="truncate max-w-[100px]">{stop.error}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
