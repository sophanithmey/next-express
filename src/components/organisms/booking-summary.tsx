import React from 'react';
import { BookingFeeQuote, CodInfo, DropoffLocation, PickupLocation } from '@/features/booking/types/booking-types';
import { PriceRow } from '../molecules/price-row';
import { APP_CONFIG } from '@/lib/constants';
import { MapPin, Navigation, Banknote, ShieldCheck } from 'lucide-react';

interface BookingSummaryProps {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  feeQuote: BookingFeeQuote | null;
  cod: CodInfo;
  isLoadingFee?: boolean;
}

export function BookingSummary({
  pickup,
  dropoff,
  feeQuote,
  cod,
  isLoadingFee = false,
}: BookingSummaryProps) {
  const deliveryFee = feeQuote?.totalDeliveryFee || 1.6;
  const distance = feeQuote?.distanceKm || 3.2;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Delivery Summary
        </h4>
        <p className="text-xs text-slate-500">Live breakdown calculated from route distance</p>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2">
          <div className="h-5 w-5 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-[10px] mt-0.5">
            P
          </div>
          <div className="flex-1">
            <span className="font-semibold text-slate-900 block">{pickup.name}</span>
            <span className="text-slate-500 line-clamp-1">{pickup.address}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="h-5 w-5 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-[10px] mt-0.5">
            D
          </div>
          <div className="flex-1">
            <span className="font-semibold text-slate-900 block">Drop-off Point</span>
            <span className="text-slate-500 line-clamp-1">{dropoff.address}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
          <span>Route Distance:</span>
          <span className="font-semibold text-slate-700 font-mono">
            {isLoadingFee ? 'Calculating...' : `${distance} km`}
          </span>
        </div>

        <PriceRow
          label="Base Delivery Charge"
          amount={feeQuote?.baseFee || 1.25}
          subtitle="Covers first 2.0 km"
        />

        <PriceRow
          label="Distance Surcharge"
          amount={Math.max(0, deliveryFee - (feeQuote?.baseFee || 1.25))}
          subtitle="Per extra km"
        />

        <PriceRow
          label="Total Delivery Fee"
          amount={deliveryFee}
          isTotal
        />
      </div>

      {cod.isCod && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
              <Banknote className="h-3.5 w-3.5 text-emerald-700" />
              <span>COD Collection</span>
            </div>
            <span className="text-sm font-bold text-emerald-800">
              {APP_CONFIG.currencySymbol}
              {cod.amount.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-snug">
            Collected from buyer upon arrival. Not a delivery expense.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        <span>Guaranteed express dispatch upon confirmation</span>
      </div>
    </div>
  );
}

