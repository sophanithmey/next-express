'use client';

import React from 'react';
import {
  PickupLocation,
  DropoffLocation,
  RecipientInfo,
  ParcelInfo,
  CodInfo,
  BookingFeeQuote,
} from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { LocationInputGroup } from './express-search-bar/location-input-group';
import { RecipientInputGroup } from './express-search-bar/recipient-input-group';
import { ParcelCodInputGroup } from './express-search-bar/parcel-cod-input-group';
import { Search, ChevronDown, Info, Check, Loader2 } from 'lucide-react';

interface ExpressSearchBookingBarProps {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  recipient: RecipientInfo;
  parcel: ParcelInfo;
  cod: CodInfo;
  isBookingOnBehalf: boolean;
  senderName?: string;
  senderPhone?: string;
  savedLocations: PickupLocation[];
  feeQuote: BookingFeeQuote | null;
  isLoadingFee: boolean;
  isSubmitting: boolean;
  onSearchSubmit: () => void;
  onChangePickup: (p: PickupLocation) => void;
  onChangeDropoff: (d: DropoffLocation) => void;
  onChangeRecipient: (r: RecipientInfo) => void;
  onChangeParcel: (p: ParcelInfo) => void;
  onChangeCod: (c: CodInfo) => void;
  onToggleBookingOnBehalf: (checked: boolean) => void;
  onChangeSenderName: (val: string) => void;
  onChangeSenderPhone: (val: string) => void;
}

export function ExpressSearchBookingBar({
  pickup, dropoff, recipient, parcel, cod, isBookingOnBehalf,
  senderName, senderPhone, savedLocations, feeQuote, isLoadingFee,
  isSubmitting, onSearchSubmit, onChangePickup, onChangeDropoff,
  onChangeRecipient, onChangeParcel, onChangeCod, onToggleBookingOnBehalf,
  onChangeSenderName, onChangeSenderPhone,
}: ExpressSearchBookingBarProps) {
  const deliveryFee = feeQuote?.totalDeliveryFee ?? 1.6;

  return (
    <div className="w-full space-y-3">
      {/* Top Options Bar (Matching reference checkboxes) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 px-1">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-800 hover:text-slate-900">
            <input
              type="checkbox"
              checked={cod.isCod}
              onChange={(e) =>
                onChangeCod({
                  isCod: e.target.checked,
                  amount: e.target.checked ? (cod.amount || 25) : 0,
                })
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Collect Cash on Delivery (COD)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={isBookingOnBehalf}
              onChange={(e) => onToggleBookingOnBehalf(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Book on behalf of partner store</span>
          </label>
        </div>

        {/* Live quote pill */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Est. Fee:</span>
          <span className="font-bold text-brand-700 font-mono">
            {isLoadingFee ? (
              <span className="animate-pulse">…</span>
            ) : (
              `${APP_CONFIG.currencySymbol}${deliveryFee.toFixed(2)}`
            )}
          </span>
        </div>
      </div>

      {/* Main Responsive Single-Bar Travel Widget */}
      <div className="rounded-2xl border border-slate-300/90 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row items-stretch overflow-hidden">
        {/* Route Segment */}
        <div className="flex-[1.4] border-b lg:border-b-0 lg:border-r border-slate-200">
          <LocationInputGroup
            pickup={pickup}
            dropoff={dropoff}
            savedLocations={savedLocations}
            onChangePickup={onChangePickup}
            onChangeDropoff={onChangeDropoff}
          />
        </div>

        {/* Recipient Segment */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-200">
          <RecipientInputGroup
            recipient={recipient}
            onChangeRecipient={onChangeRecipient}
            onAutofillAddress={(addr, coords) =>
              onChangeDropoff({ ...dropoff, address: addr, coordinates: coords })
            }
          />
        </div>

        {/* Parcel & COD Segment */}
        <div className="flex-1 border-b lg:border-b-0 border-slate-200">
          <ParcelCodInputGroup
            parcel={parcel}
            cod={cod}
            onChangeParcel={onChangeParcel}
            onChangeCod={onChangeCod}
          />
        </div>

        {/* Prominent Action Button (Full-height on desktop) */}
        <button
          type="button"
          onClick={onSearchSubmit}
          disabled={isSubmitting}
          aria-label="Confirm and dispatch delivery"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center p-4 lg:px-8 transition-colors shadow-sm disabled:opacity-60 cursor-pointer flex-shrink-0 group"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Search className="h-6 w-6 stroke-[2.5] text-white group-hover:scale-105 transition-transform" />
          )}
        </button>
      </div>

      {/* Bottom Information Row (Matching reference pills) */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 px-1 pt-0.5">
        <div className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer">
          <span className="text-slate-400">Warehouse location:</span>
          <Info className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-700">{pickup.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer">
          <span className="text-slate-400">Vehicle type:</span>
          <Info className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-700">Express Motorbike (Under 5kg)</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1 text-slate-400 ml-auto">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span>Real-time courier dispatch</span>
        </div>
      </div>

      {/* Custom Sender contact (if booking on behalf of partner) */}
      {isBookingOnBehalf && (
        <div className="p-3.5 rounded-xl border border-brand-200 bg-brand-50/70 text-xs flex flex-wrap items-center gap-3 animate-in fade-in">
          <span className="font-semibold text-brand-900">Custom Sender Contact on Label:</span>
          <input
            type="text"
            value={senderName || ''}
            onChange={(e) => onChangeSenderName(e.target.value)}
            placeholder="Partner Shop Name"
            className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="tel"
            value={senderPhone || ''}
            onChange={(e) => onChangeSenderPhone(e.target.value)}
            placeholder="012 000 000"
            className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      )}
    </div>
  );
}
