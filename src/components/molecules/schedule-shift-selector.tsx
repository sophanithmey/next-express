'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DELIVERY_SHIFTS } from '@/features/booking/data/delivery-schedule-options';
import { DeliveryShift } from '@/features/booking/types/booking-types';
import {
  ScheduleDayId,
  isShiftAvailableForDay,
  isTimeSlotAvailableForDay,
} from '@/features/booking/services/operation-hours-service';
import { Clock, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ScheduleShiftSelectorProps {
  selectedDay: ScheduleDayId;
  now: Date;
  activeShift: DeliveryShift;
  activeTimeSlot: string;
  onSelectShift: (shift: DeliveryShift) => void;
  onSelectTimeSlot: (slot: string) => void;
}

/**
 * Shift and optional 1-hour time window picker for scheduled deliveries.
 * Automatically disables elapsed shifts and time slots when scheduling for Today.
 */
export function ScheduleShiftSelector({
  selectedDay,
  now,
  activeShift,
  activeTimeSlot,
  onSelectShift,
  onSelectTimeSlot,
}: ScheduleShiftSelectorProps) {
  const t = useTranslations('Delivery');

  const currentShift =
    DELIVERY_SHIFTS.find((s) => s.id === activeShift) || DELIVERY_SHIFTS[0];

  return (
    <div className="space-y-3 pt-1 border-t border-secondary-200/50">
      {/* Shift Cards */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-secondary-600" />
          <span>{t('choosePreferredShift')}</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DELIVERY_SHIFTS.map((shift) => {
            const isAvailable = isShiftAvailableForDay(shift.id, selectedDay, now);
            const isSelected = activeShift === shift.id && isAvailable;
            const Icon = shift.icon;
            return (
              <button
                key={shift.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectShift(shift.id)}
                className={cn(
                  'rounded-lg border p-2 text-left transition select-none',
                  !isAvailable
                    ? 'border-slate-200 bg-slate-50/70 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'border-secondary-600 bg-white shadow-2xs ring-1 ring-secondary-600/30 cursor-pointer'
                    : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300 cursor-pointer',
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        isSelected ? 'text-secondary-600' : 'text-slate-400',
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isSelected ? 'text-slate-900' : 'text-slate-700',
                      )}
                    >
                      {t(shift.nameKey)}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-3 w-3 text-secondary-600 stroke-3" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                  {t(shift.rangeKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional 1-Hour Delivery Window */}
      <div className="space-y-1.5 pt-1 border-t border-secondary-200/50">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-700">
            {t('timeWindowLabel')}{' '}
            <span className="text-[10px] text-slate-400 font-normal">
              {t('optionalLabel')}
            </span>
          </span>
          <span className="text-[10px] text-slate-500">
            {t('strictDropoffHint')}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectTimeSlot('')}
            className={cn(
              'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer',
              !activeTimeSlot
                ? 'border-primary-500 bg-primary-500 text-slate-950 font-bold shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            )}
          >
            {t(currentShift.anytimeKey)}
          </button>
          {currentShift.slots.map((slot) => {
            const slotAvailable = isTimeSlotAvailableForDay(
              currentShift.id,
              slot.value,
              selectedDay,
              now,
            );
            return (
              <button
                key={slot.value}
                type="button"
                disabled={!slotAvailable}
                onClick={() => onSelectTimeSlot(slot.value)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition',
                  !slotAvailable
                    ? 'border-slate-200 bg-slate-50 text-slate-300 line-through cursor-not-allowed'
                    : activeTimeSlot === slot.value
                    ? 'border-primary-500 bg-primary-500 text-slate-950 font-bold shadow-2xs cursor-pointer'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 cursor-pointer',
                )}
              >
                {t(slot.labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
