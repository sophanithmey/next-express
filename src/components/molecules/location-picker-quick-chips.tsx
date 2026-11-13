'use client';

import React from 'react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';

export interface QuickChipItem {
  label: string;
  coords: GeoCoordinates;
  addr: string;
}

export const QUICK_CHIPS: QuickChipItem[] = [
  { label: 'BKK1', coords: { lat: 11.5512, lng: 104.9256 }, addr: 'BKK1, Khan Boeng Keng Kang, Phnom Penh' },
  { label: 'Toul Kouk', coords: { lat: 11.5835, lng: 104.899 }, addr: 'TK Avenue, Khan Tuol Kouk, Phnom Penh' },
  { label: 'Russian Mkt', coords: { lat: 11.5406, lng: 104.9149 }, addr: 'Russian Market, Khan Chamkarmon, Phnom Penh' },
  { label: 'AEON 2', coords: { lat: 11.5977, lng: 104.8828 }, addr: 'AEON Mall 2, Khan Sen Sok, Phnom Penh' },
  { label: 'St 2004', coords: { lat: 11.545, lng: 104.862 }, addr: 'St 2004, Khan Por Senchey, Phnom Penh' },
  { label: 'Peng Huoth', coords: { lat: 11.528, lng: 104.965 }, addr: 'Peng Huoth Star Platinum, Khan Chbar Ampov' },
];

interface LocationPickerQuickChipsProps {
  onSelectChip: (chip: { name: string; address: string; coords: GeoCoordinates }) => void;
}

export function LocationPickerQuickChips({ onSelectChip }: LocationPickerQuickChipsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
      {QUICK_CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onSelectChip({ name: chip.label, address: chip.addr, coords: chip.coords })}
          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 font-medium whitespace-nowrap transition text-xs cursor-pointer"
        >
          📍 {chip.label}
        </button>
      ))}
    </div>
  );
}

