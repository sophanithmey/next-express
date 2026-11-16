'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BookingDatePreset, DATE_PRESET_OPTIONS } from '../services/booking-date-filter';
import { cn } from '@/lib/cn';

interface BookingDatePresetFilterProps {
  value: BookingDatePreset;
  onChange: (preset: BookingDatePreset) => void;
  disabled?: boolean;
}

/**
 * Filter dropdown offering quick date presets: All Time, Today, Yesterday, This Month, Last Month.
 */
export function BookingDatePresetFilter({
  value,
  onChange,
  disabled = false,
}: BookingDatePresetFilterProps) {
  const tHistory = useTranslations('BookingHistory');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeOption = DATE_PRESET_OPTIONS.find((opt) => opt.id === value) || DATE_PRESET_OPTIONS[0];
  const isFiltered = value !== 'all';

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition cursor-pointer shadow-2xs whitespace-nowrap',
          isFiltered
            ? 'border-primary-300 bg-primary-50 text-primary-950 font-bold shadow-2xs'
            : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-label="Filter by date preset"
        aria-expanded={isOpen}
      >
        <Calendar className={cn('h-3.5 w-3.5', isFiltered ? 'text-amber-600' : 'text-slate-400')} />
        <span>{tHistory(activeOption.labelKey)}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {tHistory('filterByDateTitle')}
          </div>
          <div className="space-y-0.5">
            {DATE_PRESET_OPTIONS.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer text-left',
                    isSelected
                      ? 'bg-primary-50 text-primary-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-100',
                  )}
                >
                  <span>{tHistory(opt.labelKey)}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
