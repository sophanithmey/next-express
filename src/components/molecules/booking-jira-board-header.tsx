'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface BookingJiraBoardHeaderProps {
  ordersCount: number;
  isDark: boolean;
  onToggleDark: () => void;
}

export function BookingJiraBoardHeader({
  ordersCount,
  isDark,
  onToggleDark,
}: BookingJiraBoardHeaderProps) {
  const tHistory = useTranslations('BookingHistory');

  return (
    <div className="flex items-center justify-between text-xs px-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700">
          {tHistory('viewCompact')} Board
        </span>
        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
          {ordersCount} cards
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleDark}
        title={isDark ? 'Switch to light board columns' : 'Switch to dark board columns'}
        aria-label={isDark ? 'Switch to light board columns' : 'Switch to dark board columns'}
        className={cn(
          'flex items-center justify-center h-7 w-7 rounded-lg border text-xs transition cursor-pointer shadow-2xs',
          isDark
            ? 'bg-[#181b20] text-amber-300 border-[#373e47] hover:bg-[#22272e]'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900',
        )}
      >
        {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
