'use client';

import React, { useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DeliverySchedule,
  DeliverySpeedOption,
} from '@/features/booking/types/booking-types';
import { DELIVERY_SHIFTS } from '@/features/booking/data/delivery-schedule-options';
import {
  ScheduleDayId,
  getDefaultAvailableShift,
  isShiftAvailableForDay,
  isTimeSlotAvailableForDay,
  normalizeScheduleDayId,
} from '@/features/booking/services/operation-hours-service';
import { Calendar, Check, Clock } from 'lucide-react';
import { ScheduleDaySelector } from './schedule-day-selector';
import { ScheduleShiftSelector } from './schedule-shift-selector';

interface ScheduleSlotPickerProps {
  schedule?: DeliverySchedule;
  now: Date;
  isTodayAvailable: boolean;
  onChangeSchedule: (schedule: DeliverySchedule) => void;
  onChangeOption?: (option: DeliverySpeedOption) => void;
  instantFee?: number;
  sameDayFee?: number;
  scheduledFee?: number;
}

/**
 * Interactive scheduling panel orchestrating day (up to 2 days ahead),
 * shift, and 1-hour time window selection while enforcing operation-hours cutoffs.
 */
export function ScheduleSlotPicker({
  schedule,
  now,
  isTodayAvailable,
  onChangeSchedule,
  onChangeOption,
}: ScheduleSlotPickerProps) {
  const t = useTranslations('Delivery');
  const locale = useLocale();

  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const { todayFormatted, tomorrowFormatted, dayAfterTomorrowFormatted } =
    useMemo(() => {
      const fmt = (offsetDays: number) => {
        const d = new Date(now);
        if (offsetDays > 0) d.setDate(d.getDate() + offsetDays);
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(d);
      };
      return {
        todayFormatted: fmt(0),
        tomorrowFormatted: fmt(1),
        dayAfterTomorrowFormatted: fmt(2),
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale, dayKey]);

  const rawDay = normalizeScheduleDayId(schedule?.date);
  const activeDay: ScheduleDayId =
    rawDay === 'today' && !isTodayAvailable ? 'tomorrow' : rawDay;

  const rawShift = schedule?.shift || getDefaultAvailableShift(activeDay, now);
  const activeShift = isShiftAvailableForDay(rawShift, activeDay, now)
    ? rawShift
    : getDefaultAvailableShift(activeDay, now);

  const rawSlot = schedule?.timeSlot || '';
  const activeTimeSlot =
    rawSlot && isTimeSlotAvailableForDay(activeShift, rawSlot, activeDay, now)
      ? rawSlot
      : '';

  const buildDateLabel = (day: ScheduleDayId) => {
    if (day === 'today') return t('todayDateLabel', { date: todayFormatted });
    if (day === 'tomorrow') {
      return t('tomorrowDateLabel', { date: tomorrowFormatted });
    }
    return t('dayAfterTomorrowDateLabel', { date: dayAfterTomorrowFormatted });
  };

  // Auto-advance schedule if Today closes at 7:30 PM or chosen shift/slot elapses
  useEffect(() => {
    if (!schedule) return;
    if (
      rawDay !== activeDay ||
      rawShift !== activeShift ||
      rawSlot !== activeTimeSlot
    ) {
      onChangeSchedule({
        date: activeDay,
        dateLabel: buildDateLabel(activeDay),
        shift: activeShift,
        timeSlot: activeTimeSlot,
      });
      onChangeOption?.(activeDay === 'today' ? 'same_day' : 'scheduled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawDay, activeDay, rawShift, activeShift, rawSlot, activeTimeSlot]);

  const currentShift =
    DELIVERY_SHIFTS.find((s) => s.id === activeShift) || DELIVERY_SHIFTS[0];
  const selectedSlot = currentShift.slots.find(
    (slot) => slot.value === activeTimeSlot,
  );

  const handleDaySelect = (day: ScheduleDayId) => {
    if (day === 'today' && !isTodayAvailable) return;
    const nextShift = isShiftAvailableForDay(activeShift, day, now)
      ? activeShift
      : getDefaultAvailableShift(day, now);
    const nextSlot =
      activeTimeSlot &&
      isTimeSlotAvailableForDay(nextShift, activeTimeSlot, day, now)
        ? activeTimeSlot
        : '';

    onChangeSchedule({
      date: day,
      dateLabel: buildDateLabel(day),
      shift: nextShift,
      timeSlot: nextSlot,
    });
    onChangeOption?.(day === 'today' ? 'same_day' : 'scheduled');
  };

  const update = (patch: Partial<DeliverySchedule>) => {
    onChangeSchedule({
      date: activeDay,
      dateLabel: buildDateLabel(activeDay),
      shift: activeShift,
      timeSlot: activeTimeSlot,
      ...patch,
    });
  };

  return (
    <div className="rounded-2xl border border-secondary-200/90 bg-secondary-50/45 p-3.5 sm:p-4 space-y-3.5 animate-in fade-in duration-200">
      {!isTodayAvailable && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-[11px] font-medium text-amber-900">
          <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>{t('todayCutoffNotice')}</span>
        </div>
      )}

      {/* 1. Day Selector (Today / Tomorrow / In 2 Days) */}
      <ScheduleDaySelector
        selectedDay={activeDay}
        onSelectDay={handleDaySelect}
        todayFormatted={todayFormatted}
        tomorrowFormatted={tomorrowFormatted}
        dayAfterTomorrowFormatted={dayAfterTomorrowFormatted}
        isTodayAvailable={isTodayAvailable}
      />

      {/* 2. Shift & 1-Hour Time Window */}
      <ScheduleShiftSelector
        selectedDay={activeDay}
        now={now}
        activeShift={activeShift}
        activeTimeSlot={activeTimeSlot}
        onSelectShift={(shift) => update({ shift, timeSlot: '' })}
        onSelectTimeSlot={(slot) => update({ timeSlot: slot })}
      />

      {/* 3. Live Confirmation Strip */}
      <div className="rounded-xl bg-white/95 border border-secondary-200 p-2.5 sm:p-3 text-xs text-secondary-950 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <span className="font-medium text-[11px] sm:text-xs flex items-center gap-2">
          <Calendar className="h-4 w-4 text-secondary-600 shrink-0" />
          <span>
            {t('scheduledLabel')}{' '}
            <strong className="text-slate-900">
              {buildDateLabel(activeDay)}
            </strong>{' '}
            • {t(currentShift.shiftKey)} (
            {selectedSlot ? t(selectedSlot.labelKey) : t(currentShift.rangeKey)})
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
