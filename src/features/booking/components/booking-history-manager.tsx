'use client';

import React from 'react';
import { BookingOrder, DashboardStatistics } from '../types/booking-types';
import { useBookingHistory } from '../hooks/use-booking-history';
import { useBookingViewMode } from '../hooks/use-booking-view-mode';
import { BookingHistoryTable } from '@/components/organisms/booking-history-table';
import { BookingHistoryJiraBoard } from '@/components/organisms/booking-history-jira-board';
import { Button } from '@/components/atoms/button';
import { BookingOperationsStats } from './booking-operations-stats';
import { BookingHistoryToolbar } from './booking-history-toolbar';
import { BookingHistoryHeader } from './booking-history-header';
import {
  DATE_PRESET_OPTIONS,
  formatCustomDateRangeLabel,
} from '../services/booking-date-filter';
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
  const { viewMode, handleViewModeChange } = useBookingViewMode('compact');

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
    datePreset === 'custom'
      ? formatCustomDateRangeLabel(customDateRange, locale) || undefined
      : undefined;

  return (
    <div className="space-y-5">
      {/* Sleek Operations Header */}
      <BookingHistoryHeader
        sellerName={sellerName}
        totalCount={totalCount}
        isLocalDemoMode={isLocalDemoMode}
      />

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
