'use client';

import React from 'react';
import { DashboardStatistics } from '../types/booking-types';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Banknote,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

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
  const tHistory = useTranslations('BookingHistory');

  const pipelineStages = [
    {
      filterKey: 'pending',
      label: tHistory('statPending'),
      value: stats.pendingPickup,
      icon: Clock,
      dotColor: 'bg-amber-500',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40',
    },
    {
      filterKey: 'accepted',
      label: tHistory('statAccepted'),
      value: stats.accepted ?? 0,
      icon: Package,
      dotColor: 'bg-sky-500',
      activeBorder: 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40',
    },
    {
      filterKey: 'in_transit',
      label: tHistory('statTransit'),
      value: stats.inTransit,
      icon: Truck,
      dotColor: 'bg-purple-500',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40',
    },
    {
      filterKey: 'fulfilled',
      label: tHistory('statFulfilled'),
      value: stats.delivered,
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
      activeBorder:
        'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
    },
    {
      filterKey: 'cancelled',
      label: tHistory('statCancelled'),
      value: stats.cancelled ?? 0,
      icon: XCircle,
      dotColor: 'bg-rose-500',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40',
    },
  ];

  const totalPipelineOrders =
    (stats.pendingPickup || 0) +
    (stats.accepted || 0) +
    (stats.inTransit || 0) +
    (stats.delivered || 0) +
    (stats.cancelled || 0);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      {/* 1. Left: Total COD Finance Card */}
      <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-amber-200/90 bg-linear-to-b from-amber-50/80 via-white to-amber-50/30 p-4 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-900/80">
                {tHistory('statTotalCod')}
              </span>
              {activeDateLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  <Calendar className="h-2.5 w-2.5" />
                  <span>{activeDateLabel}</span>
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-amber-800/70">
              {tHistory('remittanceDesc')}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-2xs shrink-0">
            <Banknote className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-amber-100/90">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-950">
            {APP_CONFIG.currencySymbol}
            {stats.codCollection.toFixed(2)}
          </span>
          <span className="text-[11px] font-semibold text-amber-700/80">
            USD Currency
          </span>
        </div>
      </div>

      {/* 2. Right: 5-Stage Order Summary Pipeline */}
      <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              {tHistory('pipelineTitle')}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
              {tHistory('ordersCountBadge', { count: totalPipelineOrders })}
            </span>
            {activeDateLabel && (
              <span className="rounded-full bg-primary-50 border border-primary-200 px-2 py-0.5 text-[10px] font-bold text-primary-950">
                {activeDateLabel}
              </span>
            )}
          </div>
          {activeFilter !== 'all' && onSelectFilter && (
            <button
              type="button"
              onClick={() => onSelectFilter('all')}
              className="text-[11px] font-semibold text-secondary-600 hover:text-secondary-700 transition cursor-pointer"
            >
              {tHistory('resetAllStages')}
            </button>
          )}
        </div>

        {/* 5 Interactive Stages: Pending, Accepted, In Transit, Fulfilled, Cancelled */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeFilter === stage.filterKey;
            const handleClick = () => {
              if (!onSelectFilter) return;
              onSelectFilter(isActive ? 'all' : stage.filterKey);
            };

            return (
              <div key={stage.filterKey} className="relative flex items-center">
                <button
                  type="button"
                  onClick={handleClick}
                  className={cn(
                    'group w-full flex flex-col justify-between rounded-xl border p-2.5 text-left transition cursor-pointer',
                    isActive
                      ? stage.activeBorder
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-2xs',
                  )}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 transition truncate">
                      {stage.label}
                    </span>
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        stage.dotColor,
                      )}
                    />
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
                      {stage.value}
                    </span>
                    <div className="p-1 rounded-md text-slate-400 group-hover:text-slate-600 transition">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>

                {/* Progression connector between active delivery stages (up to Fulfilled) */}
                {idx < 3 && (
                  <div className="hidden xl:flex absolute -right-2 z-10 items-center justify-center pointer-events-none text-slate-300">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
