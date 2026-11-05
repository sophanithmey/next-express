'use client';

import React from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { StatusBadge } from '../molecules/status-badge';
import { Button } from '../atoms/button';
import { EmptyState } from '../molecules/empty-state';
import { APP_CONFIG } from '@/lib/constants';
import { Copy, Repeat, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface BookingHistoryTableProps {
  orders: BookingOrder[];
  onRepeatBooking?: (order: BookingOrder) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BookingHistoryTable({
  orders,
  onRepeatBooking,
  currentPage,
  totalPages,
  onPageChange,
}: BookingHistoryTableProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No deliveries found"
        description="Try adjusting your search query or status filter to find orders."
        action={
          <Link href="/bookings/new">
            <Button variant="primary" size="sm">
              Create New Delivery
            </Button>
          </Link>
        }
      />
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Tracking / Code</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">COD Amount</th>
              <th className="px-4 py-3">Delivery Fee</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">
                      {order.trackingNumber}
                    </span>
                    <button
                      type="button"
                      title="Copy Tracking Number"
                      onClick={() => copyToClipboard(order.trackingNumber)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  {order.parcel.sellerOrderRef && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Ref: {order.parcel.sellerOrderRef}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-900 block">
                    {order.recipient.name}
                  </span>
                  <span className="text-[11px] text-slate-500">{order.recipient.phoneNumber}</span>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-4 py-3">
                  {order.cod.isCod ? (
                    <span className="font-bold text-emerald-600">
                      {APP_CONFIG.currencySymbol}
                      {order.cod.amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </td>

                <td className="px-4 py-3 font-medium text-slate-900">
                  {APP_CONFIG.currencySymbol}
                  {order.deliveryFee.toFixed(2)}
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onRepeatBooking && (
                      <button
                        type="button"
                        onClick={() => onRepeatBooking(order)}
                        title="Book Again (Prefill Form)"
                        className="flex items-center gap-1 rounded bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100 transition"
                      >
                        <Repeat className="h-3 w-3" />
                        <span>Book Again</span>
                      </button>
                    )}

                    <Link href={`/bookings/${order.id}`}>
                      <button
                        type="button"
                        title="View Details"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-500">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
