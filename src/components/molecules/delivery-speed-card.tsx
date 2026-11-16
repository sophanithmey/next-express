'use client';

import React from 'react';
import { LucideIcon, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DeliverySpeedCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badgeLabel?: string;
  badgeTone?: string;
  iconTone?: string;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Modern, un-priced card for selecting delivery dispatch mode (Instant vs Schedule).
 */
export function DeliverySpeedCard({
  id,
  title,
  subtitle,
  icon: Icon,
  badgeLabel,
  badgeTone = 'bg-primary-100 text-primary-900 border-primary-300/70',
  iconTone = 'text-amber-600 bg-amber-50 border-amber-200/80',
  isSelected,
  onClick,
}: DeliverySpeedCardProps) {
  return (
    <button
      key={id}
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onClick}
      className={cn(
        'group relative flex items-start justify-between gap-3.5 rounded-2xl border p-3.5 sm:p-4 text-left transition cursor-pointer select-none',
        isSelected
          ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20 shadow-2xs'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 transition-colors mt-0.5',
            isSelected
              ? 'border-primary-300 bg-white text-primary-900 shadow-2xs'
              : iconTone
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              {title}
            </h3>
            {badgeLabel && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none',
                  badgeTone
                )}
              >
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 leading-snug">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Radio checkmark circle */}
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition mt-0.5',
          isSelected
            ? 'border-primary-500 bg-primary-500 text-slate-950 shadow-2xs font-black'
            : 'border-slate-300 bg-white group-hover:border-slate-400'
        )}
      >
        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );
}
