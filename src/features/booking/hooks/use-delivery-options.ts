'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  DeliverySpeedOption,
  DeliverySchedule,
} from '@/features/booking/types/booking-types';
import { findDeliverySlotLabelKey } from '@/features/booking/data/delivery-schedule-options';
import { normalizeScheduleDayId } from '@/features/booking/services/operation-hours-service';
import { useOperationHours } from './use-operation-hours';

interface UseDeliveryOptionsProps {
  selectedOption?: DeliverySpeedOption;
  onChangeOption: (option: DeliverySpeedOption) => void;
  schedule?: DeliverySchedule;
  onChangeSchedule?: (schedule: DeliverySchedule) => void;
}

export function useDeliveryOptions({
  selectedOption = 'instant',
  onChangeOption,
  schedule,
  onChangeSchedule,
}: UseDeliveryOptionsProps) {
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

  return {
    now,
    isInstantAvailable,
    isTodayScheduleAvailable,
    isScheduleSelected,
    isInstantSelected,
    scheduledSummary,
    handleSelectSchedule,
  };
}
