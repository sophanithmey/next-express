'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DeliverySpeedOption, DeliverySchedule } from '@/features/booking/types/booking-types';
import { findDeliverySlotLabelKey } from '@/features/booking/data/delivery-schedule-options';
import { FormSection } from '../../molecules/form-section';
import { Zap, Clock, Calendar, Check } from 'lucide-react';
import { ScheduleSlotPicker } from '../../molecules/schedule-slot-picker';
import { cn } from '@/lib/cn';

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
 * Compact delivery speed selector designed for fast price-and-urgency scanning:
 * compact horizontal rows on mobile, scannable 3-column cards on desktop.
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

  const options = [
    { id: 'instant' as const, title: t('instant'), timeframe: t('instantTimeframe'), icon: Zap, badgeTone: 'bg-primary-100 text-primary-900 border-primary-300/70', fee: instantFee },
    { id: 'same_day' as const, title: t('sameDay'), timeframe: t('sameDayTimeframe'), icon: Clock, badgeTone: 'bg-secondary-50 text-secondary-800 border-secondary-200', fee: sameDayFee },
    { id: 'scheduled' as const, title: t('scheduled'), timeframe: t('scheduledTimeframe'), icon: Calendar, badgeTone: 'bg-emerald-50 text-emerald-800 border-emerald-200', fee: scheduledFee },
  ];

  const slotLabelKey = schedule?.shift
    ? findDeliverySlotLabelKey(schedule.shift, schedule.timeSlot)
    : null;
  const scheduledSummary = schedule?.shift
    ? [t(`${schedule.shift}Name`), slotLabelKey ? t(slotLabelKey) : schedule.timeSlot || null]
        .filter(Boolean)
        .join(' · ')
    : t('pickTimeWindowHint');

  return (
    <FormSection
      icon={<Zap className="h-4 w-4" />}
      iconClassName="bg-primary-100 text-primary-800 border border-primary-300/70"
      title={t('speed')}
      titleClassName="text-slate-900 font-bold"
      subtitle={t('speedSubtitle')}
    >
      <div className="space-y-3.5">
        <div
          role="radiogroup"
          aria-label={t('optionsAriaLabel')}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
        >
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const Icon = option.icon;
            const savings = instantFee - option.fee;
            const tagLabel =
              savings >= 0.05
                ? t('saveAmountBadge', { amount: savings.toFixed(2) })
                : t('instantBadge');

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChangeOption(option.id)}
                className={cn(
                  'group relative flex sm:flex-col items-center sm:items-stretch justify-between gap-3 rounded-xl border p-3 sm:p-3.5 text-left transition cursor-pointer select-none min-h-14',
                  isSelected
                    ? 'border-secondary-600 bg-secondary-50/45 ring-2 ring-secondary-600/15 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                )}
              >
                <div className="flex items-center sm:items-start justify-between gap-2.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-colors',
                        isSelected
                          ? 'border-secondary-200 bg-white text-secondary-700 shadow-2xs'
                          : 'border-slate-200/80 bg-slate-50 text-slate-500 group-hover:text-slate-700'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight leading-snug truncate">
                        {option.title}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500 block truncate">
                        {option.id === 'scheduled' && isSelected
                          ? scheduledSummary
                          : option.timeframe}
                      </span>
                    </div>
                  </div>

                  {/* Desktop top-right radio dot */}
                  <span
                    className={cn(
                      'hidden sm:flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition mt-0.5',
                      isSelected
                        ? 'border-secondary-600 bg-secondary-600 text-white'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    )}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                </div>

                {/* Price + Value Tag (+ Mobile Radio Dot) */}
                <div className="flex items-center sm:justify-between gap-2.5 sm:pt-2.5 sm:border-t sm:border-slate-100 shrink-0">
                  <span
                    className={cn(
                      'hidden sm:inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold',
                      option.badgeTone
                    )}
                  >
                    {tagLabel}
                  </span>

                  <span
                    className={cn(
                      'font-mono text-sm sm:text-base font-extrabold tracking-tight',
                      isSelected ? 'text-secondary-700' : 'text-slate-900'
                    )}
                  >
                    ${option.fee.toFixed(2)}
                  </span>

                  <span
                    className={cn(
                      'flex sm:hidden h-4 w-4 shrink-0 items-center justify-center rounded-full border transition',
                      isSelected
                        ? 'border-secondary-600 bg-secondary-600 text-white'
                        : 'border-slate-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedOption === 'scheduled' && onChangeSchedule && (
          <ScheduleSlotPicker
            schedule={schedule}
            onChangeSchedule={onChangeSchedule}
            scheduledFee={scheduledFee}
          />
        )}
      </div>
    </FormSection>
  );
}
