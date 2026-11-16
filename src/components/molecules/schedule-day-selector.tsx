'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Clock, CalendarDays, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ScheduleDaySelectorProps {
  selectedDay: 'today' | 'tomorrow';
  onSelectDay: (day: 'today' | 'tomorrow') => void;
  todayFormatted: string;
  tomorrowFormatted: string;
}

/**
 * Clean, un-priced 2-card selector for choosing delivery day (Today vs Tomorrow).
 */
export function ScheduleDaySelector({
  selectedDay,
  onSelectDay,
  todayFormatted,
  tomorrowFormatted,
}: ScheduleDaySelectorProps) {
  const t = useTranslations('Delivery');

  const days = [
    {
      id: 'today' as const,
      title: t('today'),
      badge: t('todayBadge'),
      formattedDate: todayFormatted,
      subtext: t('todaySub'),
      icon: Clock,
      badgeTone: 'bg-secondary-50 text-secondary-800 border-secondary-200',
      iconTone: 'text-secondary-600 bg-secondary-50 border-secondary-200/80',
    },
    {
      id: 'tomorrow' as const,
      title: t('tomorrow'),
      badge: t('tomorrowBadge'),
      formattedDate: tomorrowFormatted,
      subtext: t('tomorrowSub'),
      icon: CalendarDays,
      badgeTone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconTone: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
  ];

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-700 block">
        {t('daySelectTitle')}
      </label>

      <div
        role="radiogroup"
        aria-label={t('daySelectTitle')}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {days.map((day) => {
          const isSelected = selectedDay === day.id;
          const Icon = day.icon;

          return (
            <button
              key={day.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectDay(day.id)}
              className={cn(
                'group relative flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition cursor-pointer select-none',
                isSelected
                  ? 'border-secondary-600 bg-white ring-2 ring-secondary-600/15 shadow-2xs'
                  : 'border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300'
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-colors mt-0.5',
                    isSelected
                      ? 'border-secondary-200 bg-secondary-50 text-secondary-700'
                      : day.iconTone
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
                        day.badgeTone
                      )}
                    >
                      {day.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-normal">
                    <strong className="text-slate-700">{day.formattedDate}</strong> • {day.subtext}
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition mt-0.5',
                  isSelected
                    ? 'border-primary-500 bg-primary-500 text-slate-950'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
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
