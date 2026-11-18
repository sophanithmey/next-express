'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Clock, CalendarDays, CalendarPlus, Check, Lock } from 'lucide-react';
import { ScheduleDayId } from '@/features/booking/services/operation-hours-service';
import { cn } from '@/lib/cn';

interface ScheduleDaySelectorProps {
  selectedDay: ScheduleDayId;
  onSelectDay: (day: ScheduleDayId) => void;
  todayFormatted: string;
  tomorrowFormatted: string;
  dayAfterTomorrowFormatted: string;
  isTodayAvailable: boolean;
}

/**
 * Clean 3-card selector for choosing delivery day up to 2 days in advance:
 * Today (blocked 2 hrs before 9:30 PM close), Tomorrow (+1 day), In 2 Days (+2 days).
 */
export function ScheduleDaySelector({
  selectedDay,
  onSelectDay,
  todayFormatted,
  tomorrowFormatted,
  dayAfterTomorrowFormatted,
  isTodayAvailable,
}: ScheduleDaySelectorProps) {
  const t = useTranslations('Delivery');

  const days = [
    {
      id: 'today' as const,
      title: t('today'),
      badge: isTodayAvailable ? t('todayBadge') : t('todayClosedBadge'),
      formattedDate: todayFormatted,
      subtext: isTodayAvailable ? t('todaySub') : t('todayCutoffShort'),
      disabled: !isTodayAvailable,
      icon: isTodayAvailable ? Clock : Lock,
      badgeTone: isTodayAvailable
        ? 'bg-secondary-50 text-secondary-800 border-secondary-200'
        : 'bg-slate-100 text-slate-500 border-slate-200',
      iconTone: isTodayAvailable
        ? 'text-secondary-600 bg-secondary-50 border-secondary-200/80'
        : 'text-slate-400 bg-slate-100 border-slate-200',
    },
    {
      id: 'tomorrow' as const,
      title: t('tomorrow'),
      badge: t('tomorrowBadge'),
      formattedDate: tomorrowFormatted,
      subtext: t('tomorrowSub'),
      disabled: false,
      icon: CalendarDays,
      badgeTone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconTone: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
    {
      id: 'day_after_tomorrow' as const,
      title: t('dayAfterTomorrow'),
      badge: t('dayAfterTomorrowBadge'),
      formattedDate: dayAfterTomorrowFormatted,
      subtext: t('dayAfterTomorrowSub'),
      disabled: false,
      icon: CalendarPlus,
      badgeTone: 'bg-amber-50 text-amber-900 border-amber-200',
      iconTone: 'text-amber-700 bg-amber-50 border-amber-200/80',
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-[11px] font-bold text-slate-700 block">
          {t('daySelectTitle')}
        </label>
        <span className="text-[10px] font-medium text-slate-500">
          {t('advanceWindowHint')}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label={t('daySelectTitle')}
        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        {days.map((day) => {
          const isSelected = selectedDay === day.id && !day.disabled;
          const Icon = day.icon;

          return (
            <button
              key={day.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={day.disabled}
              disabled={day.disabled}
              onClick={() => onSelectDay(day.id)}
              className={cn(
                'group relative flex items-start justify-between gap-2.5 rounded-xl border p-3 text-left transition select-none',
                day.disabled
                  ? 'border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-secondary-600 bg-white ring-2 ring-secondary-600/15 shadow-2xs cursor-pointer'
                  : 'border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300 cursor-pointer',
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-colors mt-0.5',
                    !day.disabled && isSelected
                      ? 'border-secondary-200 bg-secondary-50 text-secondary-700'
                      : day.iconTone,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {day.title}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold leading-none',
                        day.badgeTone,
                      )}
                    >
                      {day.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-snug">
                    <strong className="text-slate-700 block">
                      {day.formattedDate}
                    </strong>
                    <span>{day.subtext}</span>
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition mt-0.5',
                  day.disabled
                    ? 'border-slate-200 bg-slate-100'
                    : isSelected
                    ? 'border-primary-500 bg-primary-500 text-slate-950'
                    : 'border-slate-300 bg-white group-hover:border-slate-400',
                )}
              >
                {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
