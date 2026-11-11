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
  filledClasses?: string;
  extraBadge?: React.ReactNode;
  onToggle: () => void;
}

interface OptionalFieldPillsProps {
  pills: OptionalFieldPill[];
  prefixLabel?: string;
}

const DEFAULT_FILLED_CLASSES =
  'border-brand-200 bg-brand-50/80 text-brand-800 hover:bg-brand-100/70 font-semibold';

/**
 * Shared 1-tap toggle pill bar for progressive optional fields across pickup and drop-off forms.
 */
export function OptionalFieldPills({
  pills,
  prefixLabel,
}: OptionalFieldPillsProps) {
  const tCommon = useTranslations('Common');
  const resolvedPrefix = prefixLabel ?? tCommon('optional');

  return (
    <div className="flex flex-wrap items-center gap-2 pt-0.5">
      {resolvedPrefix && (
        <span className="text-xs font-medium text-slate-400 select-none">
          {resolvedPrefix}:
        </span>
      )}
      {pills.map((pill) => {
        const stateClasses = pill.isOpen
          ? 'border-secondary-500 bg-secondary-50 text-secondary-800 ring-1 ring-secondary-500/20 font-semibold'
          : pill.hasValue
          ? pill.filledClasses || DEFAULT_FILLED_CLASSES
          : 'border-slate-200 bg-slate-50/90 text-slate-600 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700 font-medium';

        return (
          <button
            key={pill.key}
            type="button"
            aria-expanded={pill.isOpen}
            onClick={pill.onToggle}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 text-xs transition cursor-pointer select-none min-h-10 sm:min-h-0 sm:h-8',
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

