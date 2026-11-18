'use client';

import React from 'react';
import { PhoneCall, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { APP_CONFIG } from '@/lib/constants';

interface CancelHotlineCalloutProps {
  trackingNumber?: string;
}

/**
 * Shown when a rider has already been assigned so the sender knows
 * to contact the WingExpress hotline to request order cancellation.
 */
export function CancelHotlineCallout({
  trackingNumber,
}: CancelHotlineCalloutProps) {
  const tPayment = useTranslations('Payment');

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 space-y-2.5 text-left">
      <div className="flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-bold text-amber-950">
            {tPayment('cancelHotlineTitle')}
          </p>
          <p className="text-[11px] leading-relaxed text-amber-900/90">
            {tPayment('cancelHotlineDesc', { phone: APP_CONFIG.supportPhone })}
          </p>
          {trackingNumber && (
            <p className="text-[10px] font-mono text-amber-800/90 pt-0.5">
              {tPayment('trackingRef')}: {trackingNumber}
            </p>
          )}
        </div>
      </div>

      <a
        href={`tel:${APP_CONFIG.supportPhoneRaw}`}
        className="flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-bold text-slate-950 transition shadow-2xs"
      >
        <PhoneCall className="h-3.5 w-3.5 shrink-0" />
        <span>
          {tPayment('cancelHotlineCta', { phone: APP_CONFIG.supportPhone })}
        </span>
      </a>
    </div>
  );
}
