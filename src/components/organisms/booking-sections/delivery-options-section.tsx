'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  DeliverySpeedOption,
  DeliverySchedule,
} from '@/features/booking/types/booking-types';
import { findDeliverySlotLabelKey } from '@/features/booking/data/delivery-schedule-options';
import { normalizeScheduleDayId } from '@/features/booking/services/operation-hours-service';
import { useOperationHours } from '@/features/booking/hooks/use-operation-hours';
import { FormSection } from '../../molecules/form-section';
import { Zap, Calendar, Clock } from 'lucide-react';
import { DeliverySpeedCard } from '../../molecules/delivery-speed-card';
import { ScheduleSlotPicker } from '../../molecules/schedule-slot-picker';

interface DeliveryOptionsSectionProps {
  selectedOption?: DeliverySpeedOption;
  onChangeOption: (option: DeliverySpeedOption) => void;
  schedule?: DeliverySchedule;
  onChangeSchedule?: (schedule: DeliverySchedule) => void;
  instantFee?: number;
  sameDayFee?: number;
  scheduledFee?: number;
}

/**
 * Delivery Type section enforcing operation hours:
 * - Instant: 6:00 AM – 9:30 PM
 * - Schedule: blocks Today 2 hours before close (7:30 PM), allows booking up to 2 days ahead.
 */
export function DeliveryOptionsSection({
  selectedOption = 'instant',
  onChangeOption,
  schedule,
  onChangeSchedule,
  instantFee = 1.75,
  sameDayFee = 1.25,
  scheduledFee = 1.0,
}: DeliveryOptionsSectionProps) {
  const t = useTranslations('Delivery');
  const {
    now,
    isInstantAvailable,
    isTodayScheduleAvailable,
    defaultScheduleDay,
    defaultShift,
  } = useOperationHours();

  // Auto-switch from Instant to Schedule when outside 6:00 AM – 9:30 PM
  useEffect(() => {
    if (!isInstantAvailable && selectedOption === 'instant') {
      if (onChangeSchedule && !schedule) {
        onChangeSchedule({
          date: defaultScheduleDay,
          dateLabel:
            defaultScheduleDay === 'today' ? t('today') : t('tomorrow'),
          shift: defaultShift,
          timeSlot: '',
        });
      }
      onChangeOption(defaultScheduleDay === 'today' ? 'same_day' : 'scheduled');
    }
  }, [
    isInstantAvailable,
    selectedOption,
    schedule,
    defaultScheduleDay,
    defaultShift,
    onChangeSchedule,
    onChangeOption,
    t,
  ]);

  const isScheduleSelected =
    selectedOption === 'scheduled' || selectedOption === 'same_day';
  const isInstantSelected = selectedOption === 'instant' && isInstantAvailable;

  const activeScheduleDay = schedule?.date
    ? normalizeScheduleDayId(schedule.date)
    : selectedOption === 'same_day'
    ? 'today'
    : 'tomorrow';

  const dayShortLabel =
    activeScheduleDay === 'today'
      ? t('today')
      : activeScheduleDay === 'day_after_tomorrow'
      ? t('dayAfterTomorrow')
      : t('tomorrow');

  const slotLabelKey = schedule?.shift
    ? findDeliverySlotLabelKey(schedule.shift, schedule.timeSlot)
    : null;

  const scheduledSummary = schedule?.shift
    ? [
        dayShortLabel,
        t(`${schedule.shift}Name`),
        slotLabelKey ? t(slotLabelKey) : schedule.timeSlot || null,
      ]
        .filter(Boolean)
        .join(' · ')
    : t('pickTimeWindowHint');

  const handleSelectSchedule = () => {
    if (!schedule && onChangeSchedule) {
      onChangeSchedule({
        date: defaultScheduleDay,
        dateLabel:
          defaultScheduleDay === 'today' ? t('today') : t('tomorrow'),
        shift: defaultShift,
        timeSlot: '',
      });
      onChangeOption(defaultScheduleDay === 'today' ? 'same_day' : 'scheduled');
      return;
    }
    const targetDay =
      schedule?.date === 'today' && !isTodayScheduleAvailable
        ? 'tomorrow'
        : normalizeScheduleDayId(schedule?.date);
    onChangeOption(targetDay === 'today' ? 'same_day' : 'scheduled');
  };

  return (
    <FormSection
      icon={<Zap className="h-4 w-4" />}
      iconClassName="bg-primary-100 text-primary-800 border border-primary-300/70"
      title={t('speed')}
      titleClassName="text-slate-900 font-bold"
      action={
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            isInstantAvailable
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-100 text-slate-600'
          }`}
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>{t('operationHoursBadge')}</span>
        </span>
      }
    >
      <div className="space-y-3.5">
        <div
          role="radiogroup"
          aria-label={t('optionsAriaLabel')}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Card 1: Instant Delivery (6:00 AM – 9:30 PM) */}
          <DeliverySpeedCard
            id="instant"
            title={t('instant')}
            subtitle={
              isInstantAvailable
                ? t('instantTimeframe')
                : t('instantClosedSubtitle')
            }
            icon={Zap}
            badgeLabel={
              isInstantAvailable ? t('instantBadge') : t('instantClosedBadge')
            }
            badgeTone={
              isInstantAvailable
                ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }
            iconTone="text-amber-600 bg-amber-50 border-amber-200/80"
            isSelected={isInstantSelected}
            disabled={!isInstantAvailable}
            onClick={() => {
              if (isInstantAvailable) onChangeOption('instant');
            }}
          />

          {/* Card 2: Schedule (Up to 2 days ahead, Today cutoff 7:30 PM) */}
          <DeliverySpeedCard
            id="scheduled"
            title={t('scheduled')}
            subtitle={
              isScheduleSelected ? scheduledSummary : t('scheduledTimeframe')
            }
            icon={Calendar}
            badgeLabel={t('scheduledBadge')}
            badgeTone="bg-emerald-50 text-emerald-900 border-emerald-200/80"
            iconTone="text-secondary-600 bg-secondary-50 border-secondary-200/80"
            isSelected={isScheduleSelected}
            onClick={handleSelectSchedule}
          />
        </div>

        {/* Expanded Scheduler Panel */}
        {isScheduleSelected && onChangeSchedule && (
          <ScheduleSlotPicker
            schedule={schedule}
            now={now}
            isTodayAvailable={isTodayScheduleAvailable}
            onChangeSchedule={onChangeSchedule}
            onChangeOption={onChangeOption}
            instantFee={instantFee}
            sameDayFee={sameDayFee}
            scheduledFee={scheduledFee}
          />
        )}
      </div>
    </FormSection>
  );
}
