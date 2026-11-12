'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DropoffStop, PickupLocation } from '@/features/booking/types/booking-types';
import { MapPinHouse, Navigation, Image as ImageIcon, Landmark } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/phone-number';

interface BookingRouteTimelineProps {
  pickup: PickupLocation;
  stops: DropoffStop[];
}

export function BookingRouteTimeline({ pickup, stops }: BookingRouteTimelineProps) {
  const tPickup = useTranslations('Pickup');
  const tPayment = useTranslations('Payment');

  return (
    <div className="relative pl-6 space-y-6">
      {/* Connected vertical line */}
      <div className="absolute left-2.75 top-3 bottom-3 w-0.5 bg-slate-200" />

      {/* Pickup Node */}
      <div className="relative text-xs space-y-1">
        <div className="absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-100 text-secondary-800 ring-4 ring-white border border-secondary-300">
          <MapPinHouse className="h-3 w-3" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-secondary-800 uppercase tracking-wider bg-secondary-50 px-2 py-0.5 rounded border border-secondary-200">
            {tPickup('origin')}
          </span>
          {pickup.senderPhone && (
            <span className="text-[11px] font-mono text-slate-500">
              {formatPhoneNumber(pickup.senderPhone)}
            </span>
          )}
        </div>

        <p className="font-bold text-slate-900 text-sm">
          {pickup.name || tPickup('warehouse')}
        </p>
        <p className="text-slate-600 leading-relaxed">{pickup.address}</p>

        {pickup.settlementAccountName?.trim() && pickup.settlementAccountNumber?.trim() && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-secondary-700">
            <Landmark className="h-3 w-3 shrink-0" />
            <span>
              {tPickup('wingBankTitle')}: {pickup.settlementAccountName} ·{' '}
              {pickup.settlementAccountNumber}
            </span>
          </div>
        )}

        {pickup.riderNote && (
          <div className="mt-1.5 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100">
            <span className="font-semibold text-slate-700">{tPayment('pickupNoteLabel')}</span>
            {pickup.riderNote}
            {pickup.imageUrl && (
              <span className="flex items-center gap-1 text-secondary-700 font-medium text-[10px] mt-0.5">
                <ImageIcon className="h-3 w-3" /> {tPayment('photoAttached')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dropoff Stops */}
      {stops.map((stop, idx) => {
        const note = stop.recipient?.notes || stop.parcelNote;
        const img = stop.imageUrl || stop.recipient?.imageUrl;

        return (
          <div key={stop.id || idx} className="relative text-xs space-y-1">
            <div className="absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-lime-100 text-brand-lime-900 ring-4 ring-white border border-brand-lime-300">
              <Navigation className="h-3 w-3" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-900 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {stops.length > 1
                  ? tPayment('stopOfTotal', { index: idx + 1, total: stops.length })
                  : tPayment('stopSingle', { index: idx + 1 })}
              </span>
              <div className="flex items-center gap-1.5">
                {typeof stop.codAmount === 'number' && stop.codAmount > 0 && (
                  <span className="rounded border border-primary-200 bg-primary-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-900">
                    COD ${stop.codAmount.toFixed(2)}
                  </span>
                )}
                {stop.recipient?.phoneNumber && (
                  <span className="text-[11px] font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {formatPhoneNumber(stop.recipient.phoneNumber)}
                  </span>
                )}
              </div>
            </div>

            {stop.recipient?.name && (
              <p className="font-bold text-slate-900">
                {stop.recipient.name}
              </p>
            )}
            <p className="text-slate-600 leading-relaxed">
              {stop.dropoff?.address}
            </p>

            {note && (
              <div className="mt-1.5 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100">
                <span className="font-semibold text-slate-700">{tPayment('dropoffNoteLabel')}</span>
                {note}
                {img && (
                  <span className="flex items-center gap-1 text-brand-700 font-medium text-[10px] mt-0.5">
                    <ImageIcon className="h-3 w-3" /> {tPayment('locationPhotoAttached')}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
