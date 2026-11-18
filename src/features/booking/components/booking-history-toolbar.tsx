'use client';

import React from 'react';
import { RefreshCw, RotateCcw, Table2, Kanban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SearchInput } from '@/components/molecules/search-input';
import { BookingDatePresetFilter } from './booking-date-preset-filter';
import { BookingExportMenu } from './booking-export-menu';
import {
  BookingDatePreset,
  CustomDateRange,
} from '../services/booking-date-filter';
import { BookingOrder } from '../types/booking-types';
import { cn } from '@/lib/cn';

const STATUS_TAB_KEYS = [
  { id: 'all', labelKey: 'tabAll' },
  { id: 'pending', labelKey: 'tabPending' },
  { id: 'accepted', labelKey: 'tabAccepted' },
  { id: 'in_transit', labelKey: 'tabTransit' },
  { id: 'fulfilled', labelKey: 'tabFulfilled' },
  { id: 'cancelled', labelKey: 'tabCancelled' },
] as const;

export type BookingViewMode = 'compact' | 'table';

interface BookingHistoryToolbarProps {
  statusFilter: string;
  datePreset: BookingDatePreset;
  customDateRange?: CustomDateRange;
  search: string;
  isLoading: boolean;
  isLocalDemoMode: boolean;
  viewMode: BookingViewMode;
  orders: BookingOrder[];
  onViewModeChange: (mode: BookingViewMode) => void;
  onFilterChange: (status: string) => void;
  onDatePresetChange: (preset: BookingDatePreset) => void;
  onCustomDateRangeChange?: (range: CustomDateRange) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onResetDemoData: () => void;
}

/**
 * Modern operations toolbar with Date Presets, 3 Export formats, Search, and 2-Choice View Switcher.
 */
export function BookingHistoryToolbar({
  statusFilter,
  datePreset,
  customDateRange,
  search,
  isLoading,
  isLocalDemoMode,
  viewMode,
  orders,
  onViewModeChange,
  onFilterChange,
  onDatePresetChange,
  onCustomDateRangeChange,
  onSearchChange,
  onRefresh,
  onResetDemoData,
}: BookingHistoryToolbarProps) {
  const tHistory = useTranslations('BookingHistory');

  return (
    <div className="space-y-3">
      {/* Status Filter Tabs (Shown in table view or when quick-filtering) */}
      {viewMode === 'table' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TAB_KEYS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={cn(
                  'min-h-8 rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80',
                )}
              >
                {tHistory(tab.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      {/* Control Bar: Search + Date Presets + Active Filter + Export + 2-Choice View Switcher + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder={tHistory('searchCompactPlaceholder')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange('')}
            />
          </div>
          <BookingDatePresetFilter
            value={datePreset}
            customRange={customDateRange}
            onChange={onDatePresetChange}
            onChangeCustomRange={onCustomDateRangeChange}
            disabled={isLoading}
          />
          {statusFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              title={tHistory('resetFilters')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary-300 bg-primary-50 px-2.5 py-1.5 text-xs font-bold text-primary-950 hover:bg-primary-100 transition cursor-pointer shadow-2xs"
            >
              <span className="capitalize">{statusFilter.replace('_', ' ')}</span>
              <span className="text-slate-600 hover:text-slate-900 font-bold ml-0.5">✕</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 shrink-0">
          {/* Export Menu (PDF, XLSX, CSV) */}
          <BookingExportMenu orders={orders} disabled={isLoading} />

          {/* 2 Choices for User: Compact and Table */}
          <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange('compact')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer',
                viewMode === 'compact'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900',
              )}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>{tHistory('viewCompact')}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900',
              )}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>{tHistory('viewTable')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title={tHistory('refreshTitle')}
            aria-label={tHistory('refreshTitle')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isLoading && 'animate-spin text-secondary-600')}
            />
          </button>

          {isLocalDemoMode && (
            <button
              type="button"
              onClick={onResetDemoData}
              title={tHistory('resetDemoData')}
              aria-label={tHistory('resetDemoData')}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden md:inline">{tHistory('resetDemoData')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
