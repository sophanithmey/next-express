'use client';

import React from 'react';
import { DashboardStatistics } from '../types/booking-types';
import { Package, Clock, Truck, CheckCircle2, Banknote } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

interface BookingOperationsStatsProps {
  stats: DashboardStatistics;
  activeFilter?: string;
  onSelectFilter?: (status: string) => void;
}

export function BookingOperationsStats({
  stats,
  activeFilter = 'all',
  onSelectFilter,
}: BookingOperationsStatsProps) {
  const tHistory = useTranslations('BookingHistory');

  const filterCards = [
    {
      filterKey: 'all',
      label: tHistory('statToday'),
      value: stats.todayBookings,
      icon: Package,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      filterKey: 'pending',
      label: tHistory('statPending'),
      value: stats.pendingPickup,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      filterKey: 'out_for_delivery',
      label: tHistory('statTransit'),
      value: stats.inTransit,
      icon: Truck,
      color: 'text-secondary-600 bg-secondary-50 border-secondary-200',
    },
    {
      filterKey: 'delivered',
      label: tHistory('statDelivered'),
      value: stats.delivered,
      icon: CheckCircle2,
      color: 'text-success-600 bg-success-50 border-success-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {filterCards.map((c) => {
        const Icon = c.icon;
        const isActive = activeFilter === c.filterKey && c.filterKey !== 'all';
        const handleClick = () => {
          if (!onSelectFilter) return;
          onSelectFilter(isActive ? 'all' : c.filterKey);
        };

        return (
          <button
            key={c.filterKey}
            type="button"
            onClick={handleClick}
            className={cn(
              'flex flex-col justify-between rounded-2xl border bg-white p-4 text-left shadow-2xs transition cursor-pointer',
              isActive
                ? 'border-secondary-600 ring-2 ring-secondary-600/15 bg-secondary-50/20'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {c.label}
              </span>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${c.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl font-black font-mono tracking-tight text-slate-900">
                {c.value}
              </span>
              {isActive && (
                <span className="text-xs font-semibold text-secondary-700">
                  {tHistory('filteredBadge')}
                </span>
              )}
            </div>
          </button>
        );
      })}

      {/* Total COD Remittance Summary Card */}
      <div className="col-span-2 sm:col-span-1 flex flex-col justify-between rounded-2xl border border-primary-200 bg-primary-50/60 p-4 shadow-2xs">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-900/80">
            {tHistory('statTotalCod')}
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-white text-primary-700">
            <Banknote className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-xl font-black font-mono tracking-tight text-primary-950">
            {APP_CONFIG.currencySymbol}
            {stats.codCollection.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
