'use client';

import React from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export interface OptionalFieldPill {
  key: string;
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  hasValue: boolean;
  idleClasses?: string;
  openClasses?: string;
  filledClasses?: string;
  extraBadge?: React.ReactNode;
  onToggle: () => void;
}

interface OptionalFieldPillsProps {
  pills: OptionalFieldPill[];
  prefixLabel?: string;
}

const DEFAULT_FILLED_CLASSES =
  'border-primary-300 bg-primary-50/80 text-primary-950 hover:bg-primary-100/70 font-bold';

/**
 * Shared 1-tap toggle pill bar for progressive optional fields across pickup and drop-off forms.
 */
export function OptionalFieldPills({
  pills,
  prefixLabel,
}: OptionalFieldPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
      {prefixLabel && (
        <span className="text-xs font-medium text-slate-400 select-none">
          {prefixLabel}:
        </span>
      )}
      {pills.map((pill) => {
        const stateClasses = pill.isOpen
          ? pill.openClasses ||
            'border-primary-500 bg-primary-100 text-slate-950 ring-1 ring-primary-500/20 font-bold'
          : pill.hasValue
          ? pill.filledClasses || DEFAULT_FILLED_CLASSES
          : pill.idleClasses ||
            'border-slate-200 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 font-medium';

        return (
          <button
            key={pill.key}
            type="button"
            aria-expanded={pill.isOpen}
            onClick={pill.onToggle}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition cursor-pointer select-none',
              stateClasses
            )}
          >
            {pill.icon}
            <span className="truncate max-w-36">{pill.label}</span>
            {pill.extraBadge}
            {pill.isOpen && <ChevronUp className="h-3 w-3 shrink-0 opacity-75" />}
          </button>
        );
      })}
    </div>
  );
}

