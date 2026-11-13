'use client';

import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

const NUDGE_CONTROLS = [
  { label: 'North', dLat: 0.0008, dLng: 0, Icon: ChevronUp },
  { label: 'South', dLat: -0.0008, dLng: 0, Icon: ChevronDown },
  { label: 'West', dLat: 0, dLng: -0.0008, Icon: ChevronLeft },
  { label: 'East', dLat: 0, dLng: 0.0008, Icon: ChevronRight },
];

interface LocationPickerNudgeOverlayProps {
  onNudge: (deltaLat: number, deltaLng: number) => void;
}

export function LocationPickerNudgeOverlay({ onNudge }: LocationPickerNudgeOverlayProps) {
  const tPicker = useTranslations('LocationPicker');

  return (
    <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs rounded-lg p-1 border border-slate-200 shadow-xs">
      <span className="text-xs font-semibold text-slate-600 px-1">{tPicker('nudgePinLabel')}</span>
      {NUDGE_CONTROLS.map(({ label, dLat, dLng, Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onNudge(dLat, dLng)}
          title={label}
          aria-label={label}
          className="p-1 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

