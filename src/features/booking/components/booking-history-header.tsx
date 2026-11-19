'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms/button';

interface BookingHistoryHeaderProps {
  sellerName?: string;
  totalCount: number;
  isLocalDemoMode?: boolean;
}

export function BookingHistoryHeader({
  sellerName,
  totalCount,
  isLocalDemoMode,
}: BookingHistoryHeaderProps) {
  const tHistory = useTranslations('BookingHistory');

  return (
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
  );
}
