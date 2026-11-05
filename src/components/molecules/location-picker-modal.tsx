'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '@/features/booking/data/mock-booking-data';
import { X, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: PickupLocation) => void;
  selectedAddress: string;
  title?: string;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedAddress,
  title = 'Select Phnom Penh Location (Demo)',
}: LocationPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500">
              Pick a verified Phnom Penh demo hub or customer zone
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3.5 space-y-2 max-h-96 overflow-y-auto">
          {SAMPLE_PHNOM_PENH_LOCATIONS.map((loc) => {
            const isChosen = selectedAddress.includes(loc.name) || selectedAddress === loc.address;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onSelect(loc);
                  onClose();
                }}
                className={cn(
                  'w-full text-left p-3 rounded-xl border text-xs transition flex items-start justify-between gap-3',
                  isChosen
                    ? 'border-brand-500 bg-brand-50/50 text-brand-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
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
                {isChosen && <Check className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
