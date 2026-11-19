'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check, Copy, Package, RefreshCw } from 'lucide-react';
import { Button } from '../atoms/button';

interface BulkOrderResultActionsCardProps {
  failedCount: number;
  succeededCount: number;
  copiedAll: boolean;
  onRetryFailed: () => void;
  onCopyAllTracking: () => void;
  onStartNewBatch: () => void;
}

export function BulkOrderResultActionsCard({
  failedCount,
  succeededCount,
  copiedAll,
  onRetryFailed,
  onCopyAllTracking,
  onStartNewBatch,
}: BulkOrderResultActionsCardProps) {
  const tBooking = useTranslations('Booking');
  const tPayment = useTranslations('Payment');
  const tCommon = useTranslations('Common');

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2.5">
      {failedCount > 0 && (
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onRetryFailed}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="w-full"
        >
          {tBooking('bulkRetryFailedButton', { count: failedCount })}
        </Button>
      )}

      <Link
        href="/bookings"
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-2xs transition"
      >
        <span>{tPayment('viewAll')}</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      {succeededCount > 0 && (
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCopyAllTracking}
          leftIcon={
            copiedAll ? (
              <Check className="h-4 w-4 text-success-600" />
            ) : (
              <Copy className="h-4 w-4 text-slate-500" />
            )
          }
          className="w-full"
        >
          {copiedAll
            ? tCommon('copied')
            : tBooking('bulkResultCopyAllTracking')}
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={onStartNewBatch}
        leftIcon={<Package className="h-4 w-4 text-slate-500" />}
        className="w-full"
      >
        {tBooking('bulkStartNewBatch')}
      </Button>
    </div>
  );
}
