'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DeliverySpeedOption, DeliverySchedule } from '@/features/booking/types/booking-types';
import { findDeliverySlotLabelKey } from '@/features/booking/data/delivery-schedule-options';
import { FormSection } from '../../molecules/form-section';
import { Zap, Calendar } from 'lucide-react';
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
 * Modern Delivery Speed & Scheduling section:
 * Revamped 2-card selector without price clutter, highlighting urgency & timing.
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

  const isScheduleSelected = selectedOption === 'scheduled' || selectedOption === 'same_day';
  const isInstantSelected = selectedOption === 'instant';

  const activeScheduleDay =
    schedule?.date === 'today' || selectedOption === 'same_day' ? 'today' : 'tomorrow';

  const slotLabelKey = schedule?.shift
    ? findDeliverySlotLabelKey(schedule.shift, schedule.timeSlot)
    : null;

  const scheduledSummary = schedule?.shift
    ? [
        activeScheduleDay === 'today' ? t('today') : t('tomorrow'),
        t(`${schedule.shift}Name`),
        slotLabelKey ? t(slotLabelKey) : schedule.timeSlot || null,
      ]
        .filter(Boolean)
        .join(' · ')
    : t('pickTimeWindowHint');

  const handleSelectSchedule = () => {
    if (!schedule && onChangeSchedule) {
      onChangeSchedule({
        date: 'today',
        dateLabel: t('today'),
        shift: 'morning',
        timeSlot: '',
      });
      onChangeOption('same_day');
      return;
    }
    onChangeOption(schedule?.date === 'today' ? 'same_day' : 'scheduled');
  };

  return (
    <FormSection
      icon={<Zap className="h-4 w-4" />}
      iconClassName="bg-primary-100 text-primary-800 border border-primary-300/70"
      title={t('speed')}
      titleClassName="text-slate-900 font-bold"
    >
      <div className="space-y-3.5">
        <div
          role="radiogroup"
          aria-label={t('optionsAriaLabel')}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Card 1: Instant Delivery */}
          <DeliverySpeedCard
            id="instant"
            title={t('instant')}
            subtitle={t('instantTimeframe')}
            icon={Zap}
            badgeLabel={t('instantBadge')}
            badgeTone="bg-amber-50 text-amber-900 border-amber-200/80"
            iconTone="text-amber-600 bg-amber-50 border-amber-200/80"
            isSelected={isInstantSelected}
            onClick={() => onChangeOption('instant')}
          />

          {/* Card 2: Schedule (Today / Tomorrow) */}
          <DeliverySpeedCard
            id="scheduled"
            title={t('scheduled')}
            subtitle={isScheduleSelected ? scheduledSummary : t('scheduledTimeframe')}
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
