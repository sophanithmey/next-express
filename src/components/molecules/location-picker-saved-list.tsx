'use client';

import React, { useMemo, useState } from 'react';
import { Bookmark, Check, Compass, MapPin, Plus, Search, X } from 'lucide-react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { cn } from '@/lib/cn';

export type SavedLocationItem = PickupLocation & { tag?: string };

interface LocationPickerSavedListProps {
  locations: SavedLocationItem[];
  selectedAddress: string;
  highlightedLocationId?: string;
  onSelect: (location: SavedLocationItem) => void;
  onPreviewOnMap: (location: SavedLocationItem) => void;
  onAddNew?: () => void;
  onClose: () => void;
}

/**
 * Searchable list of all saved locations returned by the API response.
 * Supports instant selection, creating a new location, and previewing coordinates on the map tab.
 */
export function LocationPickerSavedList({
  locations,
  selectedAddress,
  highlightedLocationId,
  onSelect,
  onPreviewOnMap,
  onAddNew,
  onClose,
}: LocationPickerSavedListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return locations;
    return locations.filter((loc) =>
      [loc.name, loc.address, loc.tag, loc.riderNote, loc.senderPhone]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query)),
    );
  }, [locations, searchQuery]);

  if (locations.length === 0) {
    return (
      <div className="p-4 sm:p-5">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
          <Bookmark className="h-7 w-7 text-slate-300" />
          <p className="mt-2.5 text-sm font-semibold text-slate-700">No saved locations found</p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            Saved addresses from your Wing account will appear here for quick selection.
          </p>
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Location</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 sm:p-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved locations by name, address, or note..."
          aria-label="Search saved locations"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear saved location search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 px-0.5">
        <span>
          Showing {filteredLocations.length} of {locations.length}{' '}
          {locations.length === 1 ? 'location' : 'locations'}
        </span>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Location</span>
          </button>
        )}
      </div>

      {filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
          <p className="text-xs font-medium text-slate-600">
            No saved locations match &ldquo;{searchQuery}&rdquo;
          </p>
          <button type="button" onClick={() => setSearchQuery('')} className="mt-2 text-xs font-semibold text-brand-700 hover:underline cursor-pointer">
            Clear search
          </button>
        </div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
          {filteredLocations.map((loc, index) => {
            const isSelected = Boolean(selectedAddress && selectedAddress === loc.address);
            const isHighlighted = Boolean(highlightedLocationId && loc.id === highlightedLocationId);
            const displayName = loc.name || `Saved Location ${index + 1}`;

            return (
              <div
                key={`${loc.id || displayName}-${index}`}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border p-3 transition',
                  isSelected || isHighlighted
                    ? 'border-brand-400 bg-brand-50/40 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(loc);
                    onClose();
                  }}
                  className="flex min-w-0 flex-1 items-start gap-2.5 text-left cursor-pointer"
                >
                  <MapPin className={cn('mt-0.5 h-4 w-4 shrink-0', isSelected ? 'text-brand-600' : 'text-slate-400')} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">{displayName}</span>
                      {loc.tag && (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {loc.tag}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {loc.address || 'No street address provided'}
                    </p>
                    {(loc.riderNote || loc.senderPhone) && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                        {[loc.riderNote, loc.senderPhone].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPreviewOnMap(loc)}
                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-brand-600" />
                    <span>Pin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(loc);
                      onClose();
                    }}
                    aria-label={`Select ${displayName}`}
                    className={cn(
                      'inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg transition cursor-pointer',
                      isSelected ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-brand-50 hover:text-brand-700',
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
