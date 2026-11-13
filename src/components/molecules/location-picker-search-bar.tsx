'use client';

import React from 'react';
import { Loader2, LocateFixed, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PlaceSuggestion } from '@/features/booking/services/geocoding-service';
import { SavedLocationItem } from './location-picker-saved-list';
import { LocationPickerSearchDropdown } from './location-picker-search-dropdown';

interface LocationPickerSearchBarProps {
  linkInput: string;
  isLocating: boolean;
  isSearchingPlaces?: boolean;
  isResolvingLink: boolean;
  placeSuggestions?: PlaceSuggestion[];
  savedSuggestions?: SavedLocationItem[];
  onLinkChange: (value: string) => void;
  onClearLinkInput: () => void;
  onUseCurrentLocation: () => void;
  onSelectSaved?: (location: SavedLocationItem) => void;
  onSelectPlace?: (prediction: PlaceSuggestion) => void;
}

export function LocationPickerSearchBar({
  linkInput,
  isLocating,
  isSearchingPlaces = false,
  isResolvingLink,
  placeSuggestions = [],
  savedSuggestions = [],
  onLinkChange,
  onClearLinkInput,
  onUseCurrentLocation,
  onSelectSaved,
  onSelectPlace,
}: LocationPickerSearchBarProps) {
  const tPicker = useTranslations('LocationPicker');

  const showDropdown =
    (savedSuggestions.length > 0 || placeSuggestions.length > 0) &&
    !isResolvingLink &&
    linkInput.trim().length >= 2;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder={tPicker('pastePlaceholder')}
            aria-label={tPicker('searchLabel')}
            className="w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-white pl-8 pr-8 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all shadow-2xs"
          />
          {isResolvingLink || isSearchingPlaces ? (
            <Loader2 className="h-3.5 w-3.5 text-brand-600 animate-spin absolute left-2.5 top-1/2 -translate-y-1/2" />
          ) : (
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          )}
          {linkInput && (
            <button
              type="button"
              onClick={onClearLinkInput}
              aria-label={tPicker('clearSearch')}
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
          className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 text-brand-600 animate-spin" />
          ) : (
            <LocateFixed className="h-3.5 w-3.5 text-brand-600" />
          )}
          <span>{isLocating ? tPicker('locating') : tPicker('currentGps')}</span>
        </button>
      </div>

      {showDropdown && (
        <LocationPickerSearchDropdown
          savedSuggestions={savedSuggestions}
          placeSuggestions={placeSuggestions}
          onSelectSaved={onSelectSaved}
          onSelectPlace={onSelectPlace}
        />
      )}
    </div>
  );
}

