'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { BookingOrder, DashboardStatistics } from '../types/booking-types';
import { useBookingHistory } from '../hooks/use-booking-history';
import { BookingHistoryTable } from '@/components/organisms/booking-history-table';
import { SearchInput } from '@/components/molecules/search-input';
import { Button } from '@/components/atoms/button';
import { BookingOperationsStats } from './booking-operations-stats';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

interface BookingHistoryManagerProps {
  initialOrders: BookingOrder[];
  initialTotal: number;
  initialTotalPages: number;
  stats?: DashboardStatistics;
  sellerName?: string;
}

const STATUS_TAB_KEYS = [
  { id: 'all', labelKey: 'tabAll' },
  { id: 'draft', labelKey: 'tabDraft' },
  { id: 'pending', labelKey: 'tabPending' },
  { id: 'assigned', labelKey: 'tabAssigned' },
  { id: 'out_for_delivery', labelKey: 'tabTransit' },
  { id: 'delivered', labelKey: 'tabDelivered' },
  { id: 'cancelled', labelKey: 'tabCancelled' },
] as const;

export function BookingHistoryManager({
  initialOrders,
  initialTotal,
  initialTotalPages,
  stats: initialStats,
  sellerName,
}: BookingHistoryManagerProps) {
  const tHistory = useTranslations('BookingHistory');
  const {
    orders,
    stats,
    totalCount,
    search,
    statusFilter,
    page,
    totalPages,
    isLoading,
    isAuthenticated,
    openAuthModal,
    copiedItem,
    setPage,
    handleFilterChange,
    handleSearchChange,
    handleClearFilters,
    handleRefresh,
    handleCopyTrackingId,
    handleCopyLiveLink,
    handleRepeatBooking,
    handleNavigateDetail,
  } = useBookingHistory({
    initialOrders,
    initialTotal,
    initialTotalPages,
    initialStats,
  });

  return (
    <div className="space-y-6">
      {/* Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {sellerName
                ? tHistory('operationsSellerHeader', { seller: sellerName })
                : tHistory('operationsHeader')}
            </h1>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-slate-600">
              {tHistory('ordersCountBadge', { count: totalCount })}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {tHistory('operationsSubtitle')}
          </p>
        </div>

        <Link href="/booking" prefetch={true}>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            className="bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl shadow-xs"
          >
            {tHistory('newDeliveryButton')}
          </Button>
        </Link>
      </div>

      {/* Interactive Live Operations Metrics */}
      {stats && (
        <BookingOperationsStats
          stats={stats}
          activeFilter={statusFilter}
          onSelectFilter={handleFilterChange}
        />
      )}

      {/* Filter Tabs, Search & Refresh Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {STATUS_TAB_KEYS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterChange(tab.id)}
              className={cn(
                'min-h-9 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
              onChange={(e) => handleSearchChange(e.target.value)}
              onClear={() => handleSearchChange('')}
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            title={tHistory('refreshTitle')}
            aria-label={tHistory('refreshTitle')}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <RefreshCw
              className={cn('h-4 w-4', isLoading && 'animate-spin text-secondary-600')}
            />
          </button>
        </div>
      </div>

      {/* Sign-in Prompt when browsing Bookings unauthenticated */}
      {!isAuthenticated && orders.length === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-secondary-200 bg-secondary-50/70 px-5 py-4">
          <p className="text-xs sm:text-sm font-medium text-secondary-900">
            Sign in with your Wing account to view your live courier orders and saved drafts.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openAuthModal()}
            className="bg-secondary-600 hover:bg-secondary-700 text-white shrink-0"
          >
            Log In
          </Button>
        </div>
      )}

      {/* Responsive Bookings List / Table */}
      <BookingHistoryTable
        orders={orders}
        isLoading={isLoading}
        copiedItem={copiedItem}
        onCopyId={handleCopyTrackingId}
        onCopyLink={handleCopyLiveLink}
        onRepeatBooking={handleRepeatBooking}
        onNavigateDetail={handleNavigateDetail}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
