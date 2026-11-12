'use client';

import React, { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DeliverySchedule } from '@/features/booking/types/booking-types';
import { DELIVERY_SHIFTS } from '@/features/booking/data/delivery-schedule-options';
import { Check, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ScheduleSlotPickerProps {
  schedule?: DeliverySchedule;
  onChangeSchedule: (schedule: DeliverySchedule) => void;
  scheduledFee?: number;
}

export function ScheduleSlotPicker({
  schedule,
  onChangeSchedule,
  scheduledFee = 1.0,
}: ScheduleSlotPickerProps) {
  const t = useTranslations('Delivery');
  const locale = useLocale();

  const tomorrowLabel = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(d);
  }, [locale]);

  const activeShift = schedule?.shift || 'morning';
  const activeTimeSlot = schedule?.timeSlot || '';
  const currentShift =
    DELIVERY_SHIFTS.find((s) => s.id === activeShift) || DELIVERY_SHIFTS[0];
  const selectedSlot = currentShift.slots.find((slot) => slot.value === activeTimeSlot);

  const update = (patch: Partial<DeliverySchedule>) => {
    onChangeSchedule({
      date: 'tomorrow',
      dateLabel: t('tomorrowDateLabel', { date: tomorrowLabel }),
      shift: activeShift,
      timeSlot: activeTimeSlot,
      ...patch,
    });
  };

  return (
    <div className='rounded-xl border border-secondary-200/80 bg-secondary-50/40 p-4 space-y-3.5 animate-in fade-in duration-200'>
      {/* Tomorrow Header Banner */}
      <div className='flex items-center justify-between border-b border-secondary-200/60 pb-2.5'>
        <div className='flex items-center gap-2'>
          <span className='flex h-6 w-6 items-center justify-center rounded-md bg-secondary-100 text-secondary-700'>
            <Calendar className='h-3.5 w-3.5' />
          </span>
          <div>
            <span className='text-xs font-bold text-slate-900 block leading-snug'>
              {t('tomorrowScheduleTitle')}
            </span>
            <span className='text-[10px] text-slate-500 font-medium'>
              {t('tomorrowScheduleSubtitle', { date: tomorrowLabel })}
            </span>
          </div>
        </div>

        <span className='text-[10px] font-bold text-secondary-800 bg-secondary-100/80 border border-secondary-200 px-2 py-0.5 rounded-full'>
          {t('tomorrowOnlyBadge')}
        </span>
      </div>

      {/* Step 1: Pick up at */}
      <div className='space-y-1'>
        <label className='text-[11px] font-bold text-slate-700 flex items-center gap-1.5'>
          <Clock className='h-3.5 w-3.5 text-secondary-600' />
          <span>{t('choosePreferredShift')}</span>
        </label>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          {DELIVERY_SHIFTS.map((shift) => {
            const isSelected = activeShift === shift.id;
            const Icon = shift.icon;
            return (
              <button
                key={shift.id}
                type='button'
                onClick={() => update({ shift: shift.id, timeSlot: '' })}
                className={cn(
                  'rounded-lg border p-2 text-left transition cursor-pointer',
                  isSelected
                    ? 'border-secondary-600 bg-white shadow-2xs ring-1 ring-secondary-600/30'
                    : 'border-slate-200 bg-white/70 hover:bg-white',
                )}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5'>
                    <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-secondary-600' : 'text-slate-400')} />
                    <span className={cn('text-xs font-bold', isSelected ? 'text-slate-900' : 'text-slate-700')}>
                      {t(shift.nameKey)}
                    </span>
                  </div>
                  {isSelected && <Check className='h-3 w-3 text-secondary-600 stroke-3' />}
                </div>
                <span className='text-[10px] text-slate-500 block mt-0.5'>
                  {t(shift.rangeKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Optional 1-Hour Delivery Window */}
      <div className='space-y-1.5 pt-1 border-t border-secondary-200/50'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[11px] font-bold text-slate-700'>
            {t('timeWindowLabel')}{' '}
            <span className='text-[10px] text-slate-400 font-normal'>
              {t('optionalLabel')}
            </span>
          </span>
          <span className='text-[10px] text-slate-500'>
            {t('strictDropoffHint')}
          </span>
        </div>
        <div className='flex flex-wrap gap-1.5'>
          <button
            type='button'
            onClick={() => update({ timeSlot: '' })}
            className={cn(
              'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer',
              !activeTimeSlot
                ? 'border-secondary-600 bg-secondary-600 text-white shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            )}
          >
            {t(currentShift.anytimeKey)}
          </button>
          {currentShift.slots.map((slot) => (
            <button
              key={slot.value}
              type='button'
              onClick={() => update({ timeSlot: slot.value })}
              className={cn(
                'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer',
                activeTimeSlot === slot.value
                  ? 'border-secondary-600 bg-secondary-600 text-white shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
              )}
            >
              {t(slot.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Banner */}
      <div className='rounded-lg bg-white/90 border border-secondary-200 p-2 text-xs text-secondary-950 flex flex-wrap items-center justify-between gap-2 shadow-2xs'>
        <span className='font-medium text-[11px] flex items-center gap-1.5'>
          <Check className='h-3.5 w-3.5 text-secondary-600 stroke-3 shrink-0' />
          <span>
            {t('scheduledLabel')} <strong>{t('tomorrowDateLabel', { date: tomorrowLabel })}</strong> •{' '}
            {t(currentShift.shiftKey)}{' '}
            ({selectedSlot ? t(selectedSlot.labelKey) : t(currentShift.rangeKey)})
          </span>
        </span>
        <span className='font-mono font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'>
          {t('ecoRateTag', { price: `$${scheduledFee.toFixed(2)}` })}
        </span>
      </div>
    </div>
  );
}
