'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PickupLocation,
  DropoffLocation,
  RecipientInfo,
  ParcelInfo,
  CodInfo,
  BookingFeeQuote,
  RecipientRecord,
} from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import {
  Search,
  ArrowRight,
  ChevronDown,
  Info,
  User,
  Phone,
  Package,
  Banknote,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/cn';

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
  onChangePickup: (pickup: PickupLocation) => void;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeParcel: (parcel: ParcelInfo) => void;
  onChangeCod: (cod: CodInfo) => void;
  onToggleBookingOnBehalf: (checked: boolean) => void;
  onChangeSenderName: (val: string) => void;
  onChangeSenderPhone: (val: string) => void;
}

const POPULAR_AREAS = [
  { label: 'BKK1, Boeng Keng Kang', lat: 11.5512, lng: 104.9256 },
  { label: 'Tuol Kouk (St 289)', lat: 11.5789, lng: 104.8964 },
  { label: 'Sen Sok, Russian Blvd', lat: 11.564, lng: 104.881 },
  { label: 'Por Senchey (St 2004)', lat: 11.545, lng: 104.862 },
  { label: 'Chaktomuk, Daun Penh', lat: 11.558, lng: 104.931 },
  { label: 'Chbar Ampov (National Rd 1)', lat: 11.531, lng: 104.945 },
];

export function ExpressSearchBookingBar({
  pickup,
  dropoff,
  recipient,
  parcel,
  cod,
  isBookingOnBehalf,
  senderName,
  senderPhone,
  savedLocations,
  feeQuote,
  isLoadingFee,
  isSubmitting,
  onSearchSubmit,
  onChangePickup,
  onChangeDropoff,
  onChangeRecipient,
  onChangeParcel,
  onChangeCod,
  onToggleBookingOnBehalf,
  onChangeSenderName,
  onChangeSenderPhone,
}: ExpressSearchBookingBarProps) {
  const [showPickupMenu, setShowPickupMenu] = useState(false);
  const [showDropoffMenu, setShowDropoffMenu] = useState(false);
  const [showRecipientMenu, setShowRecipientMenu] = useState(false);
  const [showParcelMenu, setShowParcelMenu] = useState(false);
  const [matchingRecipients, setMatchingRecipients] = useState<RecipientRecord[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPickupMenu(false);
        setShowDropoffMenu(false);
        setShowRecipientMenu(false);
        setShowParcelMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search past recipients
  useEffect(() => {
    const q = recipient.phoneNumber || recipient.name;
    if (!q || q.length < 3) {
      setMatchingRecipients([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recipients?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const list = await res.json();
          setMatchingRecipients(list.slice(0, 3));
        }
      } catch {
        setMatchingRecipients([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [recipient.phoneNumber, recipient.name]);

  const handleSelectPastRecipient = (r: RecipientRecord) => {
    onChangeRecipient({
      ...recipient,
      name: r.name,
      phoneNumber: r.phoneNumber,
    });
    if (r.lastAddress && r.lastCoordinates) {
      onChangeDropoff({
        ...dropoff,
        address: r.lastAddress,
        coordinates: r.lastCoordinates,
      });
    }
    setMatchingRecipients([]);
    setShowRecipientMenu(false);
  };

  return (
    <div ref={containerRef} className="w-full space-y-3">
      {/* Top Options Bar (Checkbox row as shown in reference) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
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

        {/* Live quote badge */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Est. Fee:</span>
          <span className="font-bold text-brand-700">
            {isLoadingFee ? (
              <span className="animate-pulse">Calculating…</span>
            ) : (
              `${APP_CONFIG.currencySymbol}${(feeQuote?.totalDeliveryFee ?? 1.6).toFixed(2)}`
            )}
          </span>
        </div>
      </div>

      {/* Main Single-Bar Travel-Style Widget */}
      <div className="relative rounded-xl border border-slate-300 bg-white shadow-sm flex flex-col md:flex-row items-stretch overflow-visible">
        {/* Segment 1: Pick-up & Drop-off Location */}
        <div className="flex-1 flex flex-col sm:flex-row items-stretch border-b md:border-b-0 md:border-r border-slate-200">
          {/* Pick-up Location */}
          <div className="relative flex-1 p-3 sm:px-4 sm:py-3.5 hover:bg-slate-50/70 transition-colors">
            <label className="block text-[11px] font-medium text-slate-400 tracking-tight leading-none mb-1">
              Pick-up location
            </label>
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowPickupMenu(!showPickupMenu);
                setShowDropoffMenu(false);
                setShowRecipientMenu(false);
                setShowParcelMenu(false);
              }}
            >
              <span className="text-sm font-semibold text-slate-900 block truncate leading-snug">
                {pickup.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate block">
                {pickup.address}
              </span>
            </div>

            {/* Pick-up Dropdown Menu */}
            {showPickupMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Select Pickup Warehouse
                </span>
                <div className="space-y-1">
                  {savedLocations.map((loc) => (
                    <button
                      key={loc.id || loc.name}
                      type="button"
                      onClick={() => {
                        onChangePickup(loc);
                        setShowPickupMenu(false);
                      }}
                      className={cn(
                        'w-full text-left p-2 rounded-lg text-xs transition flex items-start gap-2',
                        loc.name === pickup.name
                          ? 'bg-brand-50 text-brand-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-brand-600 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{loc.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{loc.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Central Arrow divider */}
          <div className="hidden sm:flex items-center justify-center px-1 text-slate-400">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Drop-off Location */}
          <div className="relative flex-1 p-3 sm:px-4 sm:py-3.5 hover:bg-slate-50/70 transition-colors border-t sm:border-t-0 sm:border-l border-slate-100">
            <label className="block text-[11px] font-medium text-slate-400 tracking-tight leading-none mb-1">
              Drop-off location
            </label>
            <input
              type="text"
              value={dropoff.address}
              onChange={(e) => onChangeDropoff({ ...dropoff, address: e.target.value })}
              onFocus={() => {
                setShowDropoffMenu(true);
                setShowPickupMenu(false);
                setShowRecipientMenu(false);
                setShowParcelMenu(false);
              }}
              placeholder="Airport, city, station, street..."
              className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
            />
            <span className="text-[11px] text-slate-400 block truncate">
              {dropoff.landmark ? `Near ${dropoff.landmark}` : 'Customer delivery destination'}
            </span>

            {/* Drop-off Suggested Popular Zones */}
            {showDropoffMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Quick Drop-off Zones
                </span>
                <div className="space-y-0.5">
                  {POPULAR_AREAS.map((area) => (
                    <button
                      key={area.label}
                      type="button"
                      onClick={() => {
                        onChangeDropoff({
                          ...dropoff,
                          address: area.label,
                          coordinates: { lat: area.lat, lng: area.lng },
                        });
                        setShowDropoffMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition"
                    >
                      <span>{area.label}</span>
                      <span className="text-[10px] text-slate-400">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Segment 2: Recipient Details */}
        <div className="relative flex-1 p-3 sm:px-4 sm:py-3.5 border-b md:border-b-0 md:border-r border-slate-200 hover:bg-slate-50/70 transition-colors">
          <label className="block text-[11px] font-medium text-slate-400 tracking-tight leading-none mb-1">
            Recipient &amp; Phone
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={recipient.name}
              onChange={(e) => onChangeRecipient({ ...recipient, name: e.target.value })}
              onFocus={() => {
                setShowRecipientMenu(true);
                setShowPickupMenu(false);
                setShowDropoffMenu(false);
                setShowParcelMenu(false);
              }}
              placeholder="Full name"
              className="w-1/2 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
            />
            <span className="text-slate-300">|</span>
            <input
              type="tel"
              value={recipient.phoneNumber}
              onChange={(e) => onChangeRecipient({ ...recipient, phoneNumber: e.target.value })}
              onFocus={() => {
                setShowRecipientMenu(true);
                setShowPickupMenu(false);
                setShowDropoffMenu(false);
                setShowParcelMenu(false);
              }}
              placeholder="012 998 877"
              className="w-1/2 text-sm font-semibold text-slate-900 font-mono placeholder:text-slate-300 focus:outline-none bg-transparent"
            />
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            {recipient.notes || 'Driver notes (optional)'}
          </span>

          {/* Recipient Suggestions Autocomplete */}
          {showRecipientMenu && matchingRecipients.length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 w-80 rounded-xl border border-brand-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-800 uppercase tracking-wider px-2 py-1">
                <Sparkles className="h-3 w-3 text-brand-600" />
                <span>Recent Customer Matches</span>
              </div>
              <div className="space-y-1">
                {matchingRecipients.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => handleSelectPastRecipient(rec)}
                    className="w-full text-left p-2 rounded-lg text-xs hover:bg-brand-50 text-slate-800 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{rec.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{rec.phoneNumber}</div>
                    </div>
                    <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded font-medium">
                      Autofill
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Segment 3: Parcel & COD Details */}
        <div className="relative flex-1 p-3 sm:px-4 sm:py-3.5 hover:bg-slate-50/70 transition-colors">
          <label className="block text-[11px] font-medium text-slate-400 tracking-tight leading-none mb-1">
            Parcel description &amp; COD
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={parcel.description || ''}
              onChange={(e) => onChangeParcel({ ...parcel, description: e.target.value })}
              placeholder="e.g. Clothes, Food"
              className="w-1/2 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
            />
            <span className="text-slate-300">|</span>
            <div className="w-1/2 flex items-center gap-1">
              <span className="text-xs font-bold text-emerald-600">$</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={cod.amount || ''}
                onChange={(e) =>
                  onChangeCod({
                    isCod: Number(e.target.value) > 0,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="COD $0.00"
                className="w-full text-sm font-bold text-emerald-700 placeholder:text-slate-300 focus:outline-none bg-transparent"
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            {cod.isCod ? `COD: $${cod.amount.toFixed(2)} to collect` : 'Prepaid (No COD)'}
          </span>
        </div>

        {/* Segment 4: Solid Blue Search / Confirm Action Button (Matching screenshot 1:1) */}
        <button
          type="button"
          onClick={onSearchSubmit}
          disabled={isSubmitting}
          aria-label="Confirm and dispatch delivery"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center p-4 sm:px-7 md:rounded-r-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer flex-shrink-0"
        >
          <Search className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Options / Info Row (As seen below the search bar in the reference UI) */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 pt-1">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
          <span className="text-slate-400">Warehouse location:</span>
          <Info className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800">{pickup.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
          <span className="text-slate-400">Vehicle type:</span>
          <Info className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800">Express Motorbike (Under 5kg)</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1 text-slate-400 ml-auto">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span>Real-time courier dispatch</span>
        </div>
      </div>

      {/* If booking on behalf of another store */}
      {isBookingOnBehalf && (
        <div className="mt-2 p-3 rounded-xl border border-brand-200 bg-brand-50/60 text-xs flex flex-wrap items-center gap-3">
          <span className="font-semibold text-brand-900">Custom Sender Contact:</span>
          <input
            type="text"
            value={senderName || ''}
            onChange={(e) => onChangeSenderName(e.target.value)}
            placeholder="Partner Shop Name"
            className="rounded border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <input
            type="tel"
            value={senderPhone || ''}
            onChange={(e) => onChangeSenderPhone(e.target.value)}
            placeholder="012 000 000"
            className="rounded border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      )}
    </div>
  );
}
