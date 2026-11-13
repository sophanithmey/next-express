'use client';

import React from 'react';
import { BookmarkPlus, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { PlaceSuggestion } from '@/features/booking/services/geocoding-service';
import { GeolocationErrorReason } from '@/features/booking/hooks/use-location-geocoder';
import { SavedLocationItem } from './location-picker-saved-list';
import { Button } from '../atoms/button';
import { LocationMap } from '@/features/booking/components/location-map';
import { LocationPickerQuickChips } from './location-picker-quick-chips';
import { LocationPickerNudgeOverlay } from './location-picker-nudge-overlay';
import { LocationPickerSearchBar } from './location-picker-search-bar';

interface LocationPickerMapTabProps {
  pinnedCoords: GeoCoordinates;
  pinAddress: string;
  linkInput: string;
  placeSuggestions?: PlaceSuggestion[];
  savedSuggestions?: SavedLocationItem[];
  isLocating: boolean;
  isSearchingPlaces?: boolean;
  isReverseGeocoding?: boolean;
  geolocationError?: GeolocationErrorReason | null;
  isResolvingLink: boolean;
  detectedStatus: string | null;
  linkError: string | null;
  isPickingForNewLocation?: boolean;
  onLinkChange: (value: string) => void;
  onPinAddressChange: (value: string) => void;
  onClearLinkInput: () => void;
  onSelectPlace?: (prediction: PlaceSuggestion) => void;
  onSelectSaved?: (location: SavedLocationItem) => void;
  onSelectCoordinates?: (coords: GeoCoordinates) => void;
  onUseCurrentLocation: () => void;
  onNudge: (deltaLat: number, deltaLng: number) => void;
  onQuickChipSelect: (chip: { name: string; address: string; coords: GeoCoordinates }) => void;
  onConfirmPin: () => void;
  onSavePinToLocations?: () => void;
}

export function LocationPickerMapTab({
  pinnedCoords,
  pinAddress,
  linkInput,
  placeSuggestions = [],
  savedSuggestions = [],
  isLocating,
  isSearchingPlaces = false,
  isReverseGeocoding = false,
  geolocationError,
  isResolvingLink,
  detectedStatus,
  linkError,
  isPickingForNewLocation = false,
  onLinkChange,
  onPinAddressChange,
  onClearLinkInput,
  onSelectPlace,
  onSelectSaved,
  onSelectCoordinates,
  onUseCurrentLocation,
  onNudge,
  onQuickChipSelect,
  onConfirmPin,
  onSavePinToLocations,
}: LocationPickerMapTabProps) {
  const tPicker = useTranslations('LocationPicker');

  const displayError =
    linkError ||
    (geolocationError === 'permission_denied'
      ? tPicker('permissionDenied')
      : geolocationError === 'timeout'
      ? tPicker('locationTimeout')
      : geolocationError === 'unavailable'
      ? tPicker('unableRetrieveLocation')
      : null);

  return (
    <div className="p-4 space-y-2.5 overflow-y-auto">
      {/* 1. Search Bar + Current GPS Button */}
      <LocationPickerSearchBar
        linkInput={linkInput}
        isLocating={isLocating}
        isSearchingPlaces={isSearchingPlaces}
        isResolvingLink={isResolvingLink}
        placeSuggestions={placeSuggestions}
        savedSuggestions={savedSuggestions}
        onLinkChange={onLinkChange}
        onClearLinkInput={onClearLinkInput}
        onUseCurrentLocation={onUseCurrentLocation}
        onSelectSaved={onSelectSaved}
        onSelectPlace={onSelectPlace}
      />

      {/* 2. Status banners */}
      {isResolvingLink && (
        <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>{tPicker('resolvingLink')}</span>
        </div>
      )}

      {!isResolvingLink && detectedStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-medium text-success-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-success-600 shrink-0" />
          <span>{detectedStatus}</span>
        </div>
      )}

      {!isResolvingLink && displayError && (
        <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700">
          {displayError}
        </div>
      )}

      {/* 3. Quick Chips */}
      <LocationPickerQuickChips onSelectChip={onQuickChipSelect} />

      {/* 4. Map with Nudge Pin Overlay */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <LocationMap
          coordinates={pinnedCoords}
          addressLabel={pinAddress}
          onSelectCoordinates={onSelectCoordinates || (() => {})}
          className="h-56 sm:h-64 w-full"
        />
        <LocationPickerNudgeOverlay onNudge={onNudge} />
      </div>

      {/* 5. Pin Coordinate readout & editable Address input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-0.5 gap-2">
          <span className="truncate">
            {tPicker('pinCoordinates')}{' '}
            <strong className="font-mono text-slate-800">
              {pinnedCoords.lat.toFixed(5)}, {pinnedCoords.lng.toFixed(5)}
            </strong>
          </span>
          {isReverseGeocoding ? (
            <span className="text-brand-700 text-xs font-semibold flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{tPicker('gettingAddress')}</span>
            </span>
          ) : (
            <span className="text-brand-700 font-semibold shrink-0 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Google Maps</span>
            </span>
          )}
        </div>
        <input
          type="text"
          value={pinAddress}
          onChange={(e) => onPinAddressChange(e.target.value)}
          placeholder={tPicker('confirmAddressPlaceholder')}
          aria-label={tPicker('selectedAddress')}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"
        />
      </div>

      {/* 6. Buttons: Save Location & Confirm Pinned Location */}
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
            <span>{tPicker('saveLocation')}</span>
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
            ? tPicker('resolvingLink')
            : isPickingForNewLocation
            ? tPicker('applyPinToNewLocation')
            : tPicker('confirmPinnedLocation')}
        </Button>
      </div>
    </div>
  );
}
