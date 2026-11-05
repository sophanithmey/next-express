'use client';

import React, { useState } from 'react';
import {
  PickupLocation,
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
  ParcelInfo,
  CodInfo,
  BookingFeeQuote,
} from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import {
  MapPin,
  Navigation,
  User,
  Package,
  DollarSign,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface BookingSummaryProps {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  recipient: RecipientInfo;
  parcel: ParcelInfo;
  cod: CodInfo;
  feeQuote: BookingFeeQuote | null;
  isLoadingFee?: boolean;
}

export function BookingSummary({
  pickup,
  dropoff,
  dropoffs,
  recipient,
  parcel,
  cod,
  feeQuote,
  isLoadingFee,
}: BookingSummaryProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const deliveryFee = feeQuote?.totalDeliveryFee ?? 1.75;
  const isMultiDrop = dropoffs && dropoffs.length > 1;

  return (
    <div className="w-full">
      {/* Desktop Sticky Card */}
      <div className="hidden lg:block sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Delivery Summary</h3>
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
            Live Estimate
          </span>
        </div>

        {/* Route Details */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                Pickup Point
              </span>
              <p className="font-semibold text-slate-900 truncate">{pickup.name}</p>
              <p className="text-slate-500 text-[11px] truncate">{pickup.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Navigation className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                {isMultiDrop
                  ? `Drop-off Destinations (${dropoffs.length} Stops)`
                  : 'Drop-off Destination'}
              </span>
              {isMultiDrop ? (
                <div className="mt-1 space-y-1">
                  {dropoffs.map((stop, idx) => (
                    <div
                      key={stop.id || idx}
                      className="text-[11px] text-slate-700 flex items-start gap-1"
                    >
                      <span className="font-bold text-emerald-700 font-mono flex-shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {stop.recipient.name || 'Recipient'}:
                      </span>
                      <span className="text-slate-500 truncate">
                        {stop.dropoff.address || 'Address pending'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-semibold text-slate-900 truncate">
                  {dropoff.address || 'Enter destination address'}
                </p>
              )}
              <p className="text-slate-500 text-[11px] mt-0.5">
                Est. Distance: ~{feeQuote?.distanceKm || 3.5} km
                {isMultiDrop && ` • ${dropoffs.length} sequential stops`}
              </p>
            </div>
          </div>
        </div>

        {/* Recipient & Parcel Info */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" /> Recipient:
            </span>
            <span className="font-semibold text-slate-800 truncate max-w-[150px]">
              {recipient.name || 'Not provided'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-slate-400" /> Order Ref:
            </span>
            <span className="font-mono text-slate-800">
              {parcel.sellerOrderRef || 'None'}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Estimated Delivery Fee:</span>
            <span className="font-bold text-slate-900 font-mono">
              {isLoadingFee ? '…' : `${APP_CONFIG.currencySymbol}${deliveryFee.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
            <span>Total Delivery Charge:</span>
            <span className="text-base text-brand-700 font-mono">
              {isLoadingFee ? '…' : `${APP_CONFIG.currencySymbol}${deliveryFee.toFixed(2)}`}
            </span>
          </div>

          {/* COD Notice */}
          {cod.isCod && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Buyer COD to Collect:
                </span>
                <span className="text-sm font-mono">${cod.amount.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-emerald-700">
                * COD is collected from recipient and is NOT added to the delivery fee.
              </p>
            </div>
          )}
        </div>

        {/* Delivery Guarantee Notes */}
        <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
            <span>Average courier dispatch within 15–30 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <span>Real-time tracking provided upon confirmation</span>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Compact Bar */}
      <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Estimated Total Charge
            </span>
            <span className="text-lg font-bold text-brand-700 font-mono">
              ${deliveryFee.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-brand-600">
            <span>{isMobileExpanded ? 'Hide Details' : 'View Summary'}</span>
            {isMobileExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {isMobileExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 animate-in fade-in">
            <div className="flex justify-between">
              <span className="text-slate-400">Pickup:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{pickup.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Drop-off:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {isMultiDrop ? `${dropoffs.length} Destinations (Multi-Drop)` : dropoff.address || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient:</span>
              <span className="font-semibold text-slate-800">{recipient.name || 'Pending'}</span>
            </div>
            {cod.isCod && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>COD to Collect:</span>
                <span>${cod.amount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
