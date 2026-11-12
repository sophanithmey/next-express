'use client';

import React from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SearchInput } from '@/components/molecules/search-input';
import { cn } from '@/lib/cn';

const STATUS_TAB_KEYS = [
  { id: 'all', labelKey: 'tabAll' },
  { id: 'draft', labelKey: 'tabDraft' },
  { id: 'pending', labelKey: 'tabPending' },
  { id: 'assigned', labelKey: 'tabAssigned' },
  { id: 'out_for_delivery', labelKey: 'tabTransit' },
  { id: 'delivered', labelKey: 'tabDelivered' },
  { id: 'cancelled', labelKey: 'tabCancelled' },
] as const;

interface BookingHistoryToolbarProps {
  statusFilter: string;
  search: string;
  isLoading: boolean;
  isLocalDemoMode: boolean;
  onFilterChange: (status: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onResetDemoData: () => void;
}

export function BookingHistoryToolbar({
  statusFilter,
  search,
  isLoading,
  isLocalDemoMode,
  onFilterChange,
  onSearchChange,
  onRefresh,
  onResetDemoData,
}: BookingHistoryToolbarProps) {
  const tHistory = useTranslations('BookingHistory');

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
        {STATUS_TAB_KEYS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={cn(
              'min-h-9 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
            )}
          >
            {tHistory(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto">
        <div className="flex-1 lg:w-72">
          <SearchInput
            placeholder={tHistory('searchCompactPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title={tHistory('refreshTitle')}
          aria-label={tHistory('refreshTitle')}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <RefreshCw
            className={cn('h-4 w-4', isLoading && 'animate-spin text-secondary-600')}
          />
        </button>

        {isLocalDemoMode && (
          <button
            type="button"
            onClick={onResetDemoData}
            title={tHistory('resetDemoData')}
            aria-label={tHistory('resetDemoData')}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tHistory('resetDemoData')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

