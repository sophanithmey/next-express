'use client';

import React from 'react';
import Link from 'next/link';
import { BookingFormData } from '@/features/booking/types/booking-types';
import { MapPin, Navigation, Package, Banknote, Edit3, Image as ImageIcon } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface BookingReviewSummaryProps {
  formData: BookingFormData;
}

export function BookingReviewSummary({ formData }: BookingReviewSummaryProps) {
  const stops =
    formData.dropoffs && formData.dropoffs.length > 0
      ? formData.dropoffs
      : [
          {
            id: 'stop-1',
            recipient: formData.recipient,
            dropoff: formData.dropoff,
          },
        ];

  return (
    <div className="space-y-4">
      {/* Pickup Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
              A
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pickup Warehouse
            </h4>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </Link>
        </div>

        <div className="text-xs space-y-1.5">
          <p className="font-bold text-slate-900 text-sm">{formData.pickup.name || 'Warehouse'}</p>
          <p className="text-slate-600 flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>{formData.pickup.address}</span>
          </p>
          {formData.pickup.senderPhone && (
            <p className="text-slate-500 text-[11px]">
              Contact: {formData.pickup.senderName || 'Seller'} • {formData.pickup.senderPhone}
            </p>
          )}

          {formData.pickup.riderNote && (
            <div className="mt-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
              <span className="font-semibold text-slate-800 block">Pickup Instructions for Courier:</span>
              <p className="text-slate-600">{formData.pickup.riderNote}</p>
              {formData.pickup.imageUrl && (
                <div className="pt-1 flex items-center gap-1.5 text-emerald-700 font-medium text-[10px]">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Pickup location photo attached</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drop-off Stops Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
              B
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Drop-off Destinations ({stops.length} Stop{stops.length > 1 ? 's' : ''})
            </h4>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </Link>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {stops.map((stop, idx) => (
            <div key={stop.id || idx} className={idx > 0 ? 'pt-3' : ''}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>Stop {idx + 1}</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {stop.recipient.phoneNumber}
                </span>
              </div>

              <div className="text-xs space-y-1">
                {stop.recipient.name && (
                  <p className="font-medium text-slate-700">Recipient: {stop.recipient.name}</p>
                )}
                <p className="text-slate-600 flex items-start gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{stop.dropoff.address}</span>
                </p>

                {stop.recipient.notes && (
                  <div className="mt-1.5 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100 space-y-1">
                    <span className="font-medium text-slate-700">Driver Note: {stop.recipient.notes}</span>
                    {(stop.recipient.imageUrl || stop.imageUrl) && (
                      <div className="flex items-center gap-1 text-emerald-700 text-[10px] font-medium">
                        <ImageIcon className="h-3 w-3" />
                        <span>Drop-off gate/house photo attached</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parcel & COD Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Parcel Details &amp; COD
            </h4>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Seller Order Reference
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm block mt-0.5">
              {formData.parcel.sellerOrderRef || 'N/A'}
            </span>
            {formData.parcel.description && (
              <span className="text-slate-500 text-[11px] block mt-1">
                {formData.parcel.description}
              </span>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Cash on Delivery (COD)
            </span>
            {formData.cod.isCod && formData.cod.amount > 0 ? (
              <div className="mt-0.5">
                <span className="font-bold text-emerald-700 text-sm font-mono block">
                  {APP_CONFIG.currencySymbol}{formData.cod.amount.toFixed(2)} USD
                </span>
                <span className="text-[10px] text-emerald-800 font-medium block">
                  ✓ Remitted directly to seller balance
                </span>
              </div>
            ) : (
              <span className="text-slate-500 text-xs block mt-0.5 font-medium">
                No COD collection requested
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
