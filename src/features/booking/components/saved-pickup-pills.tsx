'use client';

import React from 'react';
import { Building2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PickupLocation } from '../types/booking-types';

interface SavedPickupPillsProps {
  locations: (PickupLocation & { tag?: string })[];
  selectedAddress: string;
  onSelect: (loc: PickupLocation) => void;
}

export function SavedPickupPills({
  locations,
  selectedAddress,
  onSelect,
}: SavedPickupPillsProps) {
  const tPickup = useTranslations('Pickup');

  if (!locations || locations.length === 0) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
        <span className="uppercase tracking-wider">{tPickup('savedWarehousesTitle')}</span>
        <span className="text-[10px] text-slate-400">{tPickup('oneTapPrefill')}</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {locations.map((loc) => {
          const isSelected = selectedAddress === loc.address;
          const label = loc.name.replace(/\s*\(Main\)|\s*\(Demo\)/g, '');

          return (
            <button
              key={loc.id || loc.name}
              type="button"
              onClick={() => onSelect(loc)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                isSelected
                  ? 'bg-secondary-50 border-secondary-300 text-secondary-800 shadow-2xs font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {isSelected ? (
                <Check className="h-3 w-3 text-secondary-600 shrink-0" />
              ) : (
                <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
