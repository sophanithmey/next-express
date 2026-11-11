'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Radio } from 'lucide-react';
import { TrackingShareActions } from './tracking-share-actions';

interface ShareTrackingCardProps {
  tracking: string;
  recipient: string;
  dropoff: string;
  codAmount: number;
}

export function ShareTrackingCard({
  tracking,
  recipient,
  dropoff,
  codAmount,
}: ShareTrackingCardProps) {
  const tPayment = useTranslations('Payment');

  return (
    <div className="rounded-2xl border border-brand-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-100">
          <Radio className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {tPayment('shareTrackingTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {tPayment('shareTrackingSubtitle')}
          </p>
        </div>
      </div>

      <TrackingShareActions
        tracking={tracking}
        recipient={recipient}
        dropoff={dropoff}
        codAmount={codAmount}
        layout="stacked"
      />
    </div>
  );
}
