'use client';

import React, { useMemo, useState } from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { PHNOM_PENH_ZONES, PhnomPenhZone, toPickupLocation } from '@/features/booking/data/phnom-penh-zones';
import { MapPin, Search, Compass, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LocationPickerPresetsProps {
  selectedAddress: string;
  onSelect: (location: PickupLocation) => void;
  onPreviewOnMap?: (location: PickupLocation) => void;
  onClose: () => void;
}

type CategoryFilter = 'all' | 'commercial' | 'mall' | 'market' | 'hub' | 'residential';

export function LocationPickerPresets({
  selectedAddress,
  onSelect,
  onPreviewOnMap,
  onClose,
}: LocationPickerPresetsProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filteredZones = useMemo(() => {
    return PHNOM_PENH_ZONES.filter((z) => {
      const matchCat = category === 'all' || z.category === category;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        z.name.toLowerCase().includes(q) ||
        z.district.toLowerCase().includes(q) ||
        z.address.toLowerCase().includes(q) ||
        z.tag.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, category]);

  const handleSelectZone = (zone: PhnomPenhZone) => {
    const loc = toPickupLocation(zone);
    if (onPreviewOnMap) {
      onPreviewOnMap(loc);
    } else {
      onSelect(loc);
      onClose();
    }
  };

  return (
    <div className="p-3.5 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Khan, Sangkat, Mall, or Market..."
          className="w-full rounded-xl border border-slate-300 hover:border-slate-400 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all shadow-2xs"
        />
        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
        {(
          [
            { id: 'all', label: 'All Zones' },
            { id: 'commercial', label: 'Commercial' },
            { id: 'mall', label: 'Malls' },
            { id: 'market', label: 'Markets' },
            { id: 'hub', label: 'Depots' },
            { id: 'residential', label: 'Residential' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={cn(
              'px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap',
              category === tab.id
                ? 'bg-brand-600 text-white shadow-2xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Zones List */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
        {filteredZones.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No locations found matching &ldquo;{search}&rdquo;. Try another keyword.
          </div>
        ) : (
          filteredZones.map((zone) => {
            const isChosen =
              selectedAddress.includes(zone.name) || selectedAddress === zone.address;

            return (
              <div
                key={zone.id}
                className={cn(
                  'p-2.5 rounded-xl border text-xs transition flex items-start justify-between gap-3 group',
                  isChosen
                    ? 'border-brand-500 bg-brand-50/50 text-brand-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                )}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs truncate">{zone.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {zone.district}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                      {zone.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectZone(zone)}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white transition"
                    title="Pin this location on Google Map"
                  >
                    <Compass className="h-3 w-3" />
                    <span>Pin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(toPickupLocation(zone));
                      onClose();
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-slate-100 transition"
                    title="Select and confirm immediately"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
