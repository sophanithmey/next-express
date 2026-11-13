'use client';

import React from 'react';
import { Bookmark, MapPin } from 'lucide-react';
import { SavedLocationItem } from './location-picker-saved-list';
import { PlaceSuggestion } from '@/features/booking/services/geocoding-service';

interface LocationPickerSearchDropdownProps {
  savedSuggestions: SavedLocationItem[];
  placeSuggestions: PlaceSuggestion[];
  onSelectSaved?: (location: SavedLocationItem) => void;
  onSelectPlace?: (prediction: PlaceSuggestion) => void;
}

export function LocationPickerSearchDropdown({
  savedSuggestions,
  placeSuggestions,
  onSelectSaved,
  onSelectPlace,
}: LocationPickerSearchDropdownProps) {
  return (
    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg text-xs divide-y divide-slate-100">
      {savedSuggestions.map((s, idx) => (
        <button
          key={`saved-${s.id || s.name}-${idx}`}
          type="button"
          onClick={() => onSelectSaved?.(s)}
          className="w-full text-left px-3 py-2 hover:bg-slate-50 transition flex items-center justify-between gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Bookmark className="h-3.5 w-3.5 text-brand-600 shrink-0" />
            <span className="font-semibold truncate">
              {s.name}
              {s.tag ? ` (${s.tag})` : ''}
            </span>
          </div>
          <span className="text-xs text-slate-400 shrink-0">Pin here</span>
        </button>
      ))}
      {placeSuggestions.map((item) => (
        <button
          key={item.placeId}
          type="button"
          onClick={() => onSelectPlace?.(item)}
          className="w-full text-left px-3 py-2 hover:bg-slate-50 transition flex items-center justify-between gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold truncate text-slate-900">{item.primaryText}</p>
              {item.secondaryText && (
                <p className="text-[11px] text-slate-500 truncate">{item.secondaryText}</p>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-400 shrink-0">Select</span>
        </button>
      ))}
    </div>
  );
}

