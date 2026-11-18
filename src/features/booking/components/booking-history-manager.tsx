'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { PlusCircle } from 'lucide-react';
import { BookingOrder, DashboardStatistics } from '../types/booking-types';
import { useBookingHistory } from '../hooks/use-booking-history';
import { BookingHistoryTable } from '@/components/organisms/booking-history-table';
import { BookingHistoryJiraBoard } from '@/components/organisms/booking-history-jira-board';
import { Button } from '@/components/atoms/button';
import { BookingOperationsStats } from './booking-operations-stats';
import { BookingHistoryToolbar, BookingViewMode } from './booking-history-toolbar';
import {
  DATE_PRESET_OPTIONS,
  formatCustomDateRangeLabel,
} from '../services/booking-date-filter';
import { useLocale, useTranslations } from 'next-intl';

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
  const locale = useLocale();
  const [viewMode, setViewMode] = useState<BookingViewMode>('compact');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wing_booking_view_mode') as BookingViewMode;
      if (saved === 'table' || saved === 'compact') {
        setViewMode(saved);
      }
    } catch {
      // LocalStorage access may be restricted
    }
  }, []);

  const handleViewModeChange = (mode: BookingViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('wing_booking_view_mode', mode);
    } catch {
      // Ignore
    }
  };

  const {
    orders,
    stats,
    totalCount,
    search,
    statusFilter,
    datePreset,
    customDateRange,
    page,
    totalPages,
    isLoading,
    isLocalDemoMode,
    isAuthenticated,
    openAuthModal,
    copiedItem,
    setPage,
    handleFilterChange,
    handleDatePresetChange,
    handleCustomDateRangeChange,
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
    rpp: viewMode === 'compact' ? 50 : 10,
  });

  const activeDatePresetOption =
    DATE_PRESET_OPTIONS.find((opt) => opt.id === datePreset) ||
    DATE_PRESET_OPTIONS[0];
  const activeDateLabel =
    (datePreset === 'custom'
      ? formatCustomDateRangeLabel(customDateRange, locale)
      : null) || tHistory(activeDatePresetOption.labelKey);

  return (
    <div className="space-y-5">
      {/* Sleek Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {tHistory('operationsHeader')}
            </h1>
            {sellerName && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{sellerName}</span>
              </span>
            )}
            <span className="rounded-full border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600">
              {tHistory('ordersCountBadge', { count: totalCount })}
            </span>
            {isLocalDemoMode && (
              <span className="rounded-full border border-primary-300 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-950">
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
            leftIcon={<PlusCircle className="h-4 w-4 text-slate-950" />}
            className="bg-primary-500 hover:bg-primary-400 text-slate-950 rounded-xl shadow-xs font-bold"
          >
            {tHistory('newDeliveryButton')}
          </Button>
        </Link>
      </div>

      {/* Streamlined Operations Metrics Strip */}
      {stats && (
        <BookingOperationsStats
          stats={stats}
          activeFilter={statusFilter}
          activeDateLabel={activeDateLabel}
          onSelectFilter={handleFilterChange}
        />
      )}

      {/* 2-Choice View Controls (Compact vs Table), Search, Date Presets & Export */}
      <BookingHistoryToolbar
        statusFilter={statusFilter}
        datePreset={datePreset}
        customDateRange={customDateRange}
        search={search}
        isLoading={isLoading}
        isLocalDemoMode={isLocalDemoMode}
        viewMode={viewMode}
        orders={orders}
        onViewModeChange={handleViewModeChange}
        onFilterChange={handleFilterChange}
        onDatePresetChange={handleDatePresetChange}
        onCustomDateRangeChange={handleCustomDateRangeChange}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        onResetDemoData={handleResetDemoData}
      />

      {/* Unauthenticated Notification */}
      {!isAuthenticated && orders.length === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-3.5">
          <p className="text-xs sm:text-sm font-medium text-amber-950">
            Sign in with your Wing account to view your live courier orders and saved drafts.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openAuthModal()}
            className="bg-primary-500 hover:bg-primary-400 text-slate-950 font-bold shrink-0"
          >
            Log In
          </Button>
        </div>
      )}

      {/* 2 Views: Compact (Kanban Board) vs Table */}
      {viewMode === 'compact' ? (
        <BookingHistoryJiraBoard
          orders={orders}
          isLoading={isLoading}
          copiedItem={copiedItem}
          onCopyId={handleCopyTrackingId}
          onCopyLink={handleCopyLiveLink}
          onBookAgain={handleRepeatBooking}
          onClearFilters={handleClearFilters}
        />
      ) : (
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
      )}
    </div>
  );
}
