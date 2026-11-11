'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  DeliverySpeedOption,
  DeliverySchedule,
} from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Zap, Clock, Calendar, CheckCircle2 } from 'lucide-react';
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
    {
      id: 'instant' as const,
      title: t('instant'),
      timeframe: t('instantTimeframe'),
      tag: t('instantBadge'),
      description: t('instantDesc'),
      icon: Zap,
      accentColor: 'text-amber-500',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
      fee: instantFee,
    },
    {
      id: 'same_day' as const,
      title: t('sameDay'),
      timeframe: t('sameDayTimeframe'),
      tag: t('sameDayBadge'),
      description: t('sameDayDesc'),
      icon: Clock,
      accentColor: 'text-secondary-600',
      badgeBg: 'bg-secondary-50 text-secondary-900 border-secondary-200/80',
      fee: sameDayFee,
    },
    {
      id: 'scheduled' as const,
      title: t('scheduled'),
      timeframe: t('scheduledTimeframe'),
      tag: t('scheduledBadge'),
      description: t('scheduledDesc'),
      icon: Calendar,
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
      fee: scheduledFee,
    },
  ];

  return (
    <FormSection
      icon={<Zap className="h-4 w-4" />}
      iconClassName="bg-amber-50 text-amber-600 border border-amber-200"
      title={t('speed')}
      titleClassName="text-amber-950 font-bold"
      subtitle={t('speedSubtitle')}
    >
      <div className="space-y-4">
        <div
          role="radiogroup"
          aria-label={t('optionsAriaLabel')}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChangeOption(option.id)}
                className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition cursor-pointer select-none ${
                  isSelected
                    ? 'border-secondary-600 bg-secondary-50/40 ring-2 ring-secondary-600/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="space-y-2">
                  {/* Header: Icon, Title, and Radio Indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                          isSelected
                            ? 'border-secondary-200 bg-white shadow-2xs'
                            : 'border-slate-100 bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${option.accentColor}`} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 tracking-tight leading-snug">
                          {option.title}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-500 block">
                          {option.timeframe}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition mt-0.5 ${
                        isSelected
                          ? 'border-secondary-600 bg-secondary-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    {option.description}
                  </p>
                </div>

                {/* Footer: Badge & Base Fee */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2 text-xs">
                  <span
                    className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${option.badgeBg}`}
                  >
                    {option.tag}
                  </span>

                  <span className="font-mono text-xs font-black text-slate-900">
                    ${option.fee.toFixed(2)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Schedule & Shift Picker when "Scheduled" is selected */}
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
