'use client';

import React from 'react';
import { Building2, Check } from 'lucide-react';
import { PickupLocation } from '../types/booking-types';

interface SavedPickupPillsProps {
  locations: (PickupLocation & { tag?: string })[];
  selectedAddress: string;
  onSelect: (loc: PickupLocation) => void;
}

/**
 * Clean, single-row quick-select chips for saved pickup hubs without noisy headers.
 */
export function SavedPickupPills({
  locations,
  selectedAddress,
  onSelect,
}: SavedPickupPillsProps) {
  if (!locations || locations.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
      {locations.map((loc) => {
        const isSelected = selectedAddress === loc.address;
        const label = loc.name.replace(/\s*\(Main\)|\s*\(Demo\)/g, '');

        return (
          <button
            key={loc.id || loc.name}
            type="button"
            onClick={() => onSelect(loc)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer border select-none ${
              isSelected
                ? 'bg-primary-50 border-primary-300 text-primary-950 shadow-2xs font-bold'
                : 'bg-slate-50/80 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {isSelected ? (
              <Check className="h-3 w-3 text-amber-700 shrink-0" />
            ) : (
              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
