'use client';

import React from 'react';
import { DashboardStatistics } from '../types/booking-types';
import { BookingOperationsCodCard } from './booking-operations-cod-card';
import { BookingOperationsPipeline } from './booking-operations-pipeline';

interface BookingOperationsStatsProps {
  stats: DashboardStatistics;
  activeFilter?: string;
  activeDateLabel?: string;
  onSelectFilter?: (status: string) => void;
}

/**
 * Operations Metrics Strip reflecting the active date filter:
 * - Left: Total COD Finance Card (excludes cancelled/draft orders)
 * - Right: 5-Stage Pipeline (Pending -> Accepted -> In Transit -> Fulfilled | Cancelled)
 */
export function BookingOperationsStats({
  stats,
  activeFilter = 'all',
  activeDateLabel,
  onSelectFilter,
}: BookingOperationsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <BookingOperationsCodCard
        totalCod={stats.codCollection}
        activeDateLabel={activeDateLabel}
      />
      <BookingOperationsPipeline
        stats={stats}
        activeFilter={activeFilter}
        activeDateLabel={activeDateLabel}
        onSelectFilter={onSelectFilter}
      />
    </div>
  );
}
