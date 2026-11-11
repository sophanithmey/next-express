'use client';

import React from 'react';
import { Banknote, Bike, Package, Phone, User } from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { formatPhoneNumber } from '@/lib/phone-number';
import { useTranslations } from 'next-intl';

interface BookingDetailKpiStripProps {
  order: BookingOrder;
  stopsCount: number;
}

export function BookingDetailKpiStrip({
  order,
  stopsCount,
}: BookingDetailKpiStripProps) {
  const tDetails = useTranslations('BookingDetails');
  const tHistory = useTranslations('BookingHistory');
  const hasCod = order.cod?.isCod && order.cod.amount > 0;

  return (
    <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Recipient */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <User className="h-3.5 w-3.5 text-secondary-600" />
          <span>{tDetails('recipientCardLabel')}</span>
        </span>
        <p className="text-sm font-bold text-slate-900 truncate">
          {order.recipient.name || tHistory('defaultCustomer')}
        </p>
        <a
          href={`tel:${order.recipient.phoneNumber.replace(/\s+/g, '')}`}
          className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-secondary-700 hover:underline"
        >
          <Phone className="h-3 w-3" />
          <span>{formatPhoneNumber(order.recipient.phoneNumber)}</span>
        </a>
      </div>

      {/* 2. Courier */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Bike className="h-3.5 w-3.5 text-amber-600" />
          <span>{tDetails('courierCardLabel')}</span>
        </span>
        {order.deliverer ? (
          <>
            <p className="text-sm font-bold text-slate-900 truncate">
              {order.deliverer.name}
            </p>
            <a
              href={`tel:${order.deliverer.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-600 hover:text-secondary-700"
            >
              <span>{order.deliverer.phone}</span>
              {order.deliverer.plateNumber && (
                <span className="rounded bg-white px-1.5 py-0.5 text-slate-500 border border-slate-200">
                  {order.deliverer.plateNumber}
                </span>
              )}
            </a>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-700">
              {order.status === 'cancelled'
                ? tDetails('dispatchCancelled')
                : tDetails('awaitingCourier')}
            </p>
            <p className="text-xs text-slate-400">
              {order.status === 'cancelled'
                ? tDetails('noRiderAssigned')
                : tDetails('matchingRider')}
            </p>
          </>
        )}
      </div>

      {/* 3. Parcel & Stops */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Package className="h-3.5 w-3.5 text-brand-600" />
          <span>{tDetails('parcelAndStops')}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-slate-900 truncate">
            {order.parcel.sellerOrderRef || tDetails('standardRef')}
          </span>
          <span className="rounded-md bg-brand-50 border border-brand-200 px-1.5 py-0.5 text-xs font-bold text-brand-800 shrink-0">
            {tHistory('stopsBadge', { count: stopsCount })}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate">
          {order.parcel.description || tDetails('generalMerchandise')}
        </p>
      </div>

      {/* 4. COD to Collect */}
      <div
        className={`rounded-xl border p-3 space-y-1 ${
          hasCod
            ? 'border-primary-200 bg-primary-50/80 text-primary-950'
            : 'border-slate-100 bg-slate-50/70 text-slate-600'
        }`}
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-75">
          <Banknote className="h-3.5 w-3.5 text-primary-700" />
          <span>{tDetails('codCollectionLabel')}</span>
        </span>
        <p className="font-mono text-base font-black text-slate-900">
          {hasCod
            ? `${APP_CONFIG.currencySymbol}${order.cod.amount.toFixed(2)} USD`
            : tDetails('prepaidOrder')}
        </p>
        <p className="text-xs opacity-75">
          {hasCod ? tDetails('collectOnDelivery') : tDetails('noCashDue')}
        </p>
      </div>
    </div>
  );
}

