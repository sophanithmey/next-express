'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { PlusCircle } from 'lucide-react';
import { BookingOrder, DashboardStatistics } from '../types/booking-types';
import { useBookingHistory } from '../hooks/use-booking-history';
import { BookingHistoryTable } from '@/components/organisms/booking-history-table';
import { Button } from '@/components/atoms/button';
import { BookingOperationsStats } from './booking-operations-stats';
import { BookingHistoryToolbar } from './booking-history-toolbar';
import { useTranslations } from 'next-intl';

interface BookingHistoryManagerProps {
  initialOrders: BookingOrder[];
  initialTotal: number;
  initialTotalPages: number;
  stats?: DashboardStatistics;
  sellerName?: string;
}

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
    isLocalDemoMode,
    isAuthenticated,
    openAuthModal,
    copiedItem,
    setPage,
    handleFilterChange,
    handleSearchChange,
    handleClearFilters,
    handleRefresh,
    handleResetDemoData,
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
            {isLocalDemoMode && (
              <span className="rounded-full border border-secondary-200 bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
                {tHistory('localDemoBadge')}
              </span>
            )}
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
      <BookingHistoryToolbar
        statusFilter={statusFilter}
        search={search}
        isLoading={isLoading}
        isLocalDemoMode={isLocalDemoMode}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        onResetDemoData={handleResetDemoData}
      />

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
