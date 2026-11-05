'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '@/features/booking/data/mock-booking-data';
import { MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LocationPickerPresetsProps {
  selectedAddress: string;
  onSelect: (location: PickupLocation) => void;
  onClose: () => void;
}

export function LocationPickerPresets({
  selectedAddress,
  onSelect,
  onClose,
}: LocationPickerPresetsProps) {
  return (
    <div className="p-3.5 space-y-1.5 max-h-80 overflow-y-auto">
      {SAMPLE_PHNOM_PENH_LOCATIONS.map((loc) => {
        const isChosen =
          selectedAddress.includes(loc.name) || selectedAddress === loc.address;
        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => {
              onSelect(loc);
              onClose();
            }}
            className={cn(
              'w-full text-left p-2.5 rounded-xl border text-xs transition flex items-start justify-between gap-3',
              isChosen
                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            )}
          >
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-xs">{loc.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                    {loc.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{loc.address}</p>
              </div>
            </div>
            {isChosen && <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
