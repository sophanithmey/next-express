'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  BookingFormData,
  BookingFeeQuote,
  GeoCoordinates,
} from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { Navigation, MapPin, Zap, Clock, ShieldCheck } from 'lucide-react';

const DeliveryMap = dynamic(
  () => import('../delivery-map').then((mod) => mod.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
        Loading route map…
      </div>
    ),
  }
);

interface RoutePreviewCardProps {
  formData: BookingFormData;
  feeQuote: BookingFeeQuote | null;
  onDropoffChange: (coords: GeoCoordinates) => void;
  onReviewSubmit: () => void;
}

export function RoutePreviewCard({
  formData,
  feeQuote,
  onDropoffChange,
  onReviewSubmit,
}: RoutePreviewCardProps) {
  const deliveryFee = feeQuote?.totalDeliveryFee ?? 1.6;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Map visualizer */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Navigation className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Route &amp; Destination Map
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Courier Coverage: Phnom Penh
          </span>
        </div>

        <DeliveryMap
          pickupCoords={formData.pickup.coordinates}
          dropoffCoords={formData.dropoff.coordinates}
          onDropoffChange={onDropoffChange}
          className="h-64 sm:h-72 w-full rounded-xl overflow-hidden"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Pickup Point</span>
              <span className="font-semibold text-slate-800 block truncate">{formData.pickup.name}</span>
              <span className="text-slate-500 text-[11px] block truncate">{formData.pickup.address}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2.5">
            <Navigation className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Drop-off Destination</span>
              <span className="font-semibold text-slate-800 block truncate">
                {formData.dropoff.address || 'Select destination'}
              </span>
              <span className="text-slate-500 text-[11px] block">
                Est. distance: ~{feeQuote?.distanceKm || 3.2} km
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Guarantee Card */}
      <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>Express Dispatch</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 block">15–30 Min Pickup</span>
              <p className="text-slate-500 text-[11px]">
                Nearest courier dispatched immediately.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 block">Secure COD Remittance</span>
              <p className="text-slate-500 text-[11px]">
                Collected cash credited to your merchant balance.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Delivery Fee:</span>
            <span className="font-bold text-slate-900 text-sm">
              {APP_CONFIG.currencySymbol}{deliveryFee.toFixed(2)}
            </span>
          </div>
          {formData.cod.isCod && (
            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>Buyer COD:</span>
              <span>{APP_CONFIG.currencySymbol}{formData.cod.amount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onReviewSubmit}
          className="w-full rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 active:bg-brand-800 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Review &amp; Confirm Delivery</span>
          <Navigation className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

