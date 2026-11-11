'use client';

import React from 'react';
import { Package, ShieldAlert } from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { useTranslations } from 'next-intl';

interface BookingDetailParcelProps {
  order: BookingOrder;
}

export function BookingDetailParcel({ order }: BookingDetailParcelProps) {
  const tDetails = useTranslations('BookingDetails');
  const tBooking = useTranslations('Booking');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Package className="h-4 w-4 text-secondary-600" />
          <span>{tDetails('parcelHandlingTitle')}</span>
        </h3>
        <span className="text-xs font-mono font-semibold text-slate-500">
          {order.parcel.sellerOrderRef || tBooking('noneLabel')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">
            {tDetails('sellerOrderIdLabel')}
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {order.parcel.sellerOrderRef || tDetails('notSpecified')}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">
            {tDetails('itemDescLabel')}
          </span>
          <span className="font-medium text-slate-800">
            {order.parcel.description || tDetails('generalMerchandise')}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-0.5">
            {tDetails('quantityLabel')}
          </span>
          <span className="font-semibold text-slate-800">
            {tDetails('itemsCount', { count: order.parcel.quantity || 1 })}
          </span>
        </div>
      </div>

      {order.parcel.instructions && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              {tDetails('handlingInstructions')}
            </span>
            <span>{order.parcel.instructions}</span>
          </div>
        </div>
      )}
    </div>
  );
}
