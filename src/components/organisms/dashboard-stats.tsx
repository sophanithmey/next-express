import React from 'react';
import { DashboardStatistics } from '@/features/booking/types/booking-types';
import { Package, Clock, Truck, CheckCircle, Banknote } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface DashboardStatsProps {
  stats: DashboardStatistics;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      label: "Today's Deliveries",
      value: stats.todayBookings,
      icon: Package,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      label: 'Pending Pickup',
      value: stats.pendingPickup,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Out in Transit',
      value: stats.inTransit,
      icon: Truck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Total COD Remittance',
      value: `${APP_CONFIG.currencySymbol}${stats.codCollection.toFixed(2)}`,
      icon: Banknote,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {c.label}
              </span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${c.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {c.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

