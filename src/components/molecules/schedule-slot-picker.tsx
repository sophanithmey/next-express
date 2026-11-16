'use client';

import React, { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DeliverySchedule, DeliverySpeedOption } from '@/features/booking/types/booking-types';
import { DELIVERY_SHIFTS } from '@/features/booking/data/delivery-schedule-options';
import { Calendar, Check } from 'lucide-react';
import { ScheduleDaySelector } from './schedule-day-selector';
import { ScheduleShiftSelector } from './schedule-shift-selector';

interface ScheduleSlotPickerProps {
  schedule?: DeliverySchedule;
  onChangeSchedule: (schedule: DeliverySchedule) => void;
  onChangeOption?: (option: DeliverySpeedOption) => void;
  instantFee?: number;
  sameDayFee?: number;
  scheduledFee?: number;
}

/**
 * Interactive scheduling panel orchestrating day, shift, and time window selection.
 */
export function ScheduleSlotPicker({
  schedule,
  onChangeSchedule,
  onChangeOption,
}: ScheduleSlotPickerProps) {
  const t = useTranslations('Delivery');
  const locale = useLocale();

  const formatDate = (offsetDays: number) => {
    const d = new Date();
    if (offsetDays > 0) d.setDate(d.getDate() + offsetDays);
    return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(d);
  };

  const todayFormatted = useMemo(() => formatDate(0), [locale]);
  const tomorrowFormatted = useMemo(() => formatDate(1), [locale]);

  const activeDay: 'today' | 'tomorrow' = schedule?.date === 'today' ? 'today' : 'tomorrow';
  const activeShift = schedule?.shift || 'morning';
  const activeTimeSlot = schedule?.timeSlot || '';

  const currentShift =
    DELIVERY_SHIFTS.find((s) => s.id === activeShift) || DELIVERY_SHIFTS[0];
  const selectedSlot = currentShift.slots.find((slot) => slot.value === activeTimeSlot);

  const handleDaySelect = (day: 'today' | 'tomorrow') => {
    const dateLabel =
      day === 'today'
        ? t('todayDateLabel', { date: todayFormatted })
        : t('tomorrowDateLabel', { date: tomorrowFormatted });

    onChangeSchedule({
      date: day,
      dateLabel,
      shift: activeShift,
      timeSlot: activeTimeSlot,
    });
    onChangeOption?.(day === 'today' ? 'same_day' : 'scheduled');
  };

  const update = (patch: Partial<DeliverySchedule>) => {
    const dateLabel =
      activeDay === 'today'
        ? t('todayDateLabel', { date: todayFormatted })
        : t('tomorrowDateLabel', { date: tomorrowFormatted });

    onChangeSchedule({
      date: activeDay,
      dateLabel,
      shift: activeShift,
      timeSlot: activeTimeSlot,
      ...patch,
    });
  };

  return (
    <div className="rounded-2xl border border-secondary-200/90 bg-secondary-50/45 p-3.5 sm:p-4 space-y-3.5 animate-in fade-in duration-200">
      {/* 1. Day Selector (Today vs Tomorrow) */}
      <ScheduleDaySelector
        selectedDay={activeDay}
        onSelectDay={handleDaySelect}
        todayFormatted={todayFormatted}
        tomorrowFormatted={tomorrowFormatted}
      />

      {/* 2. Shift & 1-Hour Time Window */}
      <ScheduleShiftSelector
        activeShift={activeShift}
        activeTimeSlot={activeTimeSlot}
        onSelectShift={(shift) => update({ shift, timeSlot: '' })}
        onSelectTimeSlot={(slot) => update({ timeSlot: slot })}
      />

      {/* 3. Live Confirmation Strip (Un-priced) */}
      <div className="rounded-xl bg-white/95 border border-secondary-200 p-2.5 sm:p-3 text-xs text-secondary-950 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <span className="font-medium text-[11px] sm:text-xs flex items-center gap-2">
          <Calendar className="h-4 w-4 text-secondary-600 shrink-0" />
          <span>
            {t('scheduledLabel')}{' '}
            <strong className="text-slate-900">
              {activeDay === 'today'
                ? t('todayDateLabel', { date: todayFormatted })
                : t('tomorrowDateLabel', { date: tomorrowFormatted })}
            </strong>{' '}
            • {t(currentShift.shiftKey)}{' '}
            ({selectedSlot ? t(selectedSlot.labelKey) : t(currentShift.rangeKey)})
          </span>
        </span>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary-800 bg-secondary-100 border border-secondary-200 px-2 py-0.5 rounded-full shrink-0">
          <Check className="h-2.5 w-2.5 stroke-3" />
          {t('scheduledConfirmedTag')}
        </span>
      </div>
    </div>
  );
}
