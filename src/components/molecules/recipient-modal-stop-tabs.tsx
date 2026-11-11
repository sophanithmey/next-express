'use client';

import React from 'react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RecipientModalStopTabsProps {
  stops: DropoffStop[];
  activeTab: number;
  hasStopError: (index: number) => boolean;
  onSelectTab: (index: number) => void;
  onRequestRemoveStop: (index: number) => void;
  onAddStop: () => void;
}

/**
 * Scrollable multi-drop tab bar displaying stop error indicators and delete triggers.
 */
export function RecipientModalStopTabs({
  stops,
  activeTab,
  hasStopError,
  onSelectTab,
  onRequestRemoveStop,
  onAddStop,
}: RecipientModalStopTabsProps) {
  const tCommon = useTranslations('Common');
  const tRecipient = useTranslations('Recipient');

  if (stops.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 px-5 sm:px-6 pt-3 pb-2 border-b border-slate-100 overflow-x-auto scrollbar-none">
      {stops.map((stop, idx) => {
        const invalid = hasStopError(idx);
        return (
          <div
            key={stop.id}
            className={`flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
              activeTab === idx
                ? invalid
                  ? 'bg-danger-50 border-danger-300 text-danger-800 shadow-2xs'
                  : 'bg-brand-50 border-brand-200 text-brand-800 shadow-2xs'
                : invalid
                ? 'bg-danger-50/60 border-danger-200 text-danger-700 hover:bg-danger-50'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectTab(idx)}
              className="inline-flex items-center gap-1.5 cursor-pointer"
            >
              {invalid && (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-danger-600 shrink-0"
                  aria-hidden="true"
                />
              )}
              <span>
                {tCommon('stop')} {idx + 1}
              </span>
            </button>
            {idx > 0 && (
              <button
                type="button"
                onClick={() => onRequestRemoveStop(idx)}
                className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                title={tCommon('remove')}
                aria-label={tCommon('remove')}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={onAddStop}
        className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-dashed border-brand-300 whitespace-nowrap transition cursor-pointer"
      >
        <Plus className="h-3 w-3" />
        <span>{tRecipient('addStopShort')}</span>
      </button>
    </div>
  );
}

