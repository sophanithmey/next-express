'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  BookmarkPlus,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { Button } from '../atoms/button';
import { SavedLocationItem } from './location-picker-saved-list';

const DeliveryMap = dynamic(
  () => import('../organisms/delivery-map').then((mod) => mod.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-52 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
        Loading Google Map…
      </div>
    ),
  },
);

const NUDGE_CONTROLS = [
  { label: 'North', dLat: 0.0008, dLng: 0, Icon: ChevronUp },
  { label: 'South', dLat: -0.0008, dLng: 0, Icon: ChevronDown },
  { label: 'West', dLat: 0, dLng: -0.0008, Icon: ChevronLeft },
  { label: 'East', dLat: 0, dLng: 0.0008, Icon: ChevronRight },
];

const QUICK_CHIPS = [
  { label: 'BKK1', coords: { lat: 11.5512, lng: 104.9256 }, addr: 'BKK1, Khan Boeng Keng Kang, Phnom Penh' },
  { label: 'Toul Kouk', coords: { lat: 11.5835, lng: 104.899 }, addr: 'TK Avenue, Khan Tuol Kouk, Phnom Penh' },
  { label: 'Russian Mkt', coords: { lat: 11.5406, lng: 104.9149 }, addr: 'Russian Market, Khan Chamkarmon, Phnom Penh' },
  { label: 'AEON 2', coords: { lat: 11.5977, lng: 104.8828 }, addr: 'AEON Mall 2, Khan Sen Sok, Phnom Penh' },
  { label: 'St 2004', coords: { lat: 11.545, lng: 104.862 }, addr: 'St 2004, Khan Por Senchey, Phnom Penh' },
  { label: 'Peng Huoth', coords: { lat: 11.528, lng: 104.965 }, addr: 'Peng Huoth Star Platinum, Khan Chbar Ampov' },
];

interface LocationPickerMapTabProps {
  pinnedCoords: GeoCoordinates;
  pinAddress: string;
  linkInput: string;
  suggestions: SavedLocationItem[];
  isLocating: boolean;
  isResolvingLink: boolean;
  detectedStatus: string | null;
  linkError: string | null;
  isPickingForNewLocation?: boolean;
  onLinkChange: (value: string) => void;
  onPinAddressChange: (value: string) => void;
  onClearLinkInput: () => void;
  onSelectSuggestion: (location: SavedLocationItem) => void;
  onUseCurrentLocation: () => void;
  onNudge: (deltaLat: number, deltaLng: number) => void;
  onQuickChipSelect: (chip: { label: string; coords: GeoCoordinates; addr: string }) => void;
  onConfirmPin: () => void;
  onSavePinToLocations?: () => void;
}

/**
 * Google Map pinning tab with Google Maps link / coordinate detection, GPS locator,
 * and pin nudging.
 */
export function LocationPickerMapTab({
  pinnedCoords,
  pinAddress,
  linkInput,
  suggestions,
  isLocating,
  isResolvingLink,
  detectedStatus,
  linkError,
  isPickingForNewLocation = false,
  onLinkChange,
  onPinAddressChange,
  onClearLinkInput,
  onSelectSuggestion,
  onUseCurrentLocation,
  onNudge,
  onQuickChipSelect,
  onConfirmPin,
  onSavePinToLocations,
}: LocationPickerMapTabProps) {
  return (
    <div className="p-4 space-y-2.5 overflow-y-auto">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={linkInput}
              onChange={(e) => onLinkChange(e.target.value)}
              placeholder="Paste Google Maps link, lat,lng (11.55, 104.92), or search..."
              className="w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-white pl-8 pr-8 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all shadow-2xs"
            />
            {isResolvingLink ? (
              <Loader2 className="h-3.5 w-3.5 text-brand-600 animate-spin absolute left-2.5 top-1/2 -translate-y-1/2" />
            ) : (
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            )}
            {linkInput && (
              <button
                type="button"
                onClick={onClearLinkInput}
                aria-label="Clear link or search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition shrink-0 cursor-pointer disabled:opacity-60"
          >
            <span>🎯</span>
            <span>{isLocating ? 'Locating…' : 'GPS'}</span>
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden text-xs">
            {suggestions.map((s, index) => (
              <button
                key={`${s.id || s.name}-${index}`}
                type="button"
                onClick={() => onSelectSuggestion(s)}
                className="w-full text-left px-3 py-2 hover:bg-brand-50 hover:text-brand-900 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="font-semibold truncate">
                  {s.name}
                  {s.tag ? ` (${s.tag})` : ''}
                </span>
                <span className="text-xs text-slate-400 shrink-0">Pin here</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isResolvingLink && (
        <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>Detecting pin coordinates from Google Maps link…</span>
        </div>
      )}

      {!isResolvingLink && detectedStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-medium text-success-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-success-600 shrink-0" />
          <span>{detectedStatus}</span>
        </div>
      )}

      {!isResolvingLink && linkError && (
        <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700">
          {linkError}
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => onQuickChipSelect(chip)}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 font-medium whitespace-nowrap transition text-xs cursor-pointer"
          >
            📍 {chip.label}
          </button>
        ))}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200">
        <DeliveryMap dropoffCoords={pinnedCoords} isDraggableDropoff={false} className="h-56 sm:h-64 w-full" />
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs rounded-lg p-1 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 px-1">Nudge Pin:</span>
          {NUDGE_CONTROLS.map(({ label, dLat, dLng, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onNudge(dLat, dLng)}
              title={label}
              className="p-1 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              <Icon className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-0.5 gap-2">
          <span className="truncate">
            Pin: <strong className="font-mono text-slate-800">{pinnedCoords.lat.toFixed(5)}, {pinnedCoords.lng.toFixed(5)}</strong>
          </span>
          <span className="text-brand-700 font-semibold shrink-0 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Google Maps</span>
          </span>
        </div>
        <input
          type="text"
          value={pinAddress}
          onChange={(e) => onPinAddressChange(e.target.value)}
          placeholder="Confirm street address or landmark label..."
          aria-label="Confirmed address label"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {!isPickingForNewLocation && onSavePinToLocations && (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isResolvingLink}
            onClick={onSavePinToLocations}
            className="sm:w-auto py-2.5 px-3.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
          >
            <BookmarkPlus className="h-3.5 w-3.5 text-brand-600" />
            <span>Save Location</span>
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={isResolvingLink}
          onClick={onConfirmPin}
          className="flex-1 py-2.5 font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
        >
          {isResolvingLink
            ? 'Resolving Link…'
            : isPickingForNewLocation
            ? 'Apply Pin to New Location'
            : 'Confirm Pinned Location'}
        </Button>
      </div>
    </div>
  );
}
