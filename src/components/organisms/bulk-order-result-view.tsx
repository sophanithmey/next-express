'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { BulkBatchSubmissionItem } from '@/features/booking/services/bulk-batch-submitter';
import {
  DeliverySpeedOption,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { useBulkOrderResult } from '@/features/booking/hooks/use-bulk-order-result';
import { cn } from '@/lib/cn';
import { BulkOrderResultHero } from '../molecules/bulk-order-result-hero';
import { BulkOrderResultRow } from '../molecules/bulk-order-result-row';
import { BulkOrderResultSidebar } from '../molecules/bulk-order-result-sidebar';

interface BulkOrderResultViewProps {
  results: BulkBatchSubmissionItem[];
  pickup?: PickupLocation;
  deliveryOption?: DeliverySpeedOption;
  paymentMethod?: string;
  onRetryFailed: () => void;
  onStartNewBatch: () => void;
}

export function BulkOrderResultView({
  results,
  pickup,
  deliveryOption,
  paymentMethod,
  onRetryFailed,
  onStartNewBatch,
}: BulkOrderResultViewProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  const {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    clearSearch,
    copiedAll,
    succeeded,
    failed,
    metrics,
    filteredEntries,
    filterTabs,
    handleCopyAllTracking,
  } = useBulkOrderResult(results);

  return (
    <div className='space-y-5'>
      <BulkOrderResultHero
        succeededCount={succeeded.length}
        failedCount={failed.length}
        totalOrders={results.length}
        totalStops={metrics.totalStops}
        totalFee={metrics.totalFee}
        totalCod={metrics.totalCod}
      />

      {/* Two-Column Content: Dispatched Orders + Sticky Summary Sidebar */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 items-start'>
        <div className='lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-sm sm:text-base font-extrabold text-slate-900'>
                {tBooking('bulkResultOrdersHeading')}
              </h3>

              {failed.length > 0 && (
                <div className='flex items-center gap-1 rounded-xl bg-slate-100 p-0.5'>
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type='button'
                      onClick={() => setStatusFilter(tab.id)}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer',
                        statusFilter === tab.id
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-800',
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {results.length > 3 && (
              <div className='relative w-full sm:w-64'>
                <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tBooking('bulkResultSearchPlaceholder')}
                  className='h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500/20'
                />
                {searchQuery && (
                  <button
                    type='button'
                    onClick={clearSearch}
                    aria-label={tCommon('clear')}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredEntries.length === 0 ? (
            <div className='rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-500'>
              {tBooking('bulkResultNoMatches')}
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredEntries.map(({ item, idx }) => (
                <BulkOrderResultRow
                  key={item.draft.id}
                  item={item}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>

        <div className='lg:col-span-4'>
          <BulkOrderResultSidebar
            pickup={pickup}
            deliveryOption={deliveryOption}
            paymentMethod={paymentMethod}
            succeededCount={succeeded.length}
            failedCount={failed.length}
            totalStops={metrics.totalStops}
            totalFee={metrics.totalFee}
            totalCod={metrics.totalCod}
            copiedAll={copiedAll}
            onCopyAllTracking={() => void handleCopyAllTracking()}
            onRetryFailed={onRetryFailed}
            onStartNewBatch={onStartNewBatch}
          />
        </div>
      </div>
    </div>
  );
}
