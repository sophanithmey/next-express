'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  BookingDatePreset,
  CustomDateRange,
  DATE_PRESET_OPTIONS,
  formatCustomDateRangeLabel,
  getTodayDateKey,
} from '../services/booking-date-filter';
import { cn } from '@/lib/cn';
import { BookingDateCustomPopover } from './booking-date-custom-popover';

interface BookingDatePresetFilterProps {
  value: BookingDatePreset;
  customRange?: CustomDateRange;
  onChange: (preset: BookingDatePreset) => void;
  onChangeCustomRange?: (range: CustomDateRange) => void;
  disabled?: boolean;
}

/**
 * Filter dropdown offering quick date presets (Today, Yesterday, This Month,
 * Last Month, All Dates) plus an inline Custom Date (From / To) range picker.
 */
export function BookingDatePresetFilter({
  value,
  customRange,
  onChange,
  onChangeCustomRange,
  disabled = false,
}: BookingDatePresetFilterProps) {
  const tHistory = useTranslations('BookingHistory');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInputs, setShowCustomInputs] = useState(value === 'custom');
  const [draftStart, setDraftStart] = useState(
    customRange?.startDate || getTodayDateKey(),
  );
  const [draftEnd, setDraftEnd] = useState(
    customRange?.endDate || getTodayDateKey(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customRange?.startDate) setDraftStart(customRange.startDate);
    if (customRange?.endDate) setDraftEnd(customRange.endDate);
  }, [customRange?.startDate, customRange?.endDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeOption =
    DATE_PRESET_OPTIONS.find((opt) => opt.id === value) ||
    DATE_PRESET_OPTIONS[0];
  const customLabel =
    value === 'custom'
      ? formatCustomDateRangeLabel(customRange, locale)
      : null;
  const triggerLabel = customLabel || tHistory(activeOption.labelKey);
  const isFiltered = value !== 'all';

  const handleApplyCustom = () => {
    onChangeCustomRange?.({
      startDate: draftStart || undefined,
      endDate: draftEnd || undefined,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setShowCustomInputs(value === 'custom');
          setIsOpen((prev) => !prev);
        }}
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
        <Calendar
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            isFiltered ? 'text-amber-600' : 'text-slate-400',
          )}
        />
        <span>{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-slate-400 transition-transform duration-150',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-1.5 z-30 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95',
            showCustomInputs ? 'w-72' : 'w-48',
          )}
        >
          <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {tHistory('filterByDateTitle')}
          </div>
          <div className="space-y-0.5">
            {DATE_PRESET_OPTIONS.map((opt) => {
              const isSelected =
                opt.id === 'custom'
                  ? value === 'custom' || showCustomInputs
                  : opt.id === value && !showCustomInputs;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (opt.id === 'custom') {
                      setShowCustomInputs(true);
                      return;
                    }
                    setShowCustomInputs(false);
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
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showCustomInputs && (
            <BookingDateCustomPopover
              draftStart={draftStart}
              draftEnd={draftEnd}
              onChangeStart={setDraftStart}
              onChangeEnd={setDraftEnd}
              onApply={handleApplyCustom}
              onCancel={() => setIsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
