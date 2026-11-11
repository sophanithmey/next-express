'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Navigation } from 'lucide-react';
import { DropoffLocation, DropoffStop } from '@/features/booking/types/booking-types';
import { formatPhoneNumber } from '@/lib/phone-number';

interface BookingSummaryStopListProps {
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
}

/**
 * Displays either a single drop-off address or a connected 2-line multi-stop timeline
 * so full recipient names and phone numbers never clip against street addresses.
 */
export function BookingSummaryStopList({
  dropoff,
  dropoffs,
}: BookingSummaryStopListProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const tRecipient = useTranslations('Recipient');

  const isMultiDrop = Boolean(dropoffs && dropoffs.length > 1);

  return (
    <div className='flex items-start gap-2.5'>
      <Navigation className='h-4 w-4 text-brand-600 mt-0.5 shrink-0' />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[11px] font-medium text-slate-400 uppercase tracking-wider'>
            {tRecipient('title')}
          </span>
          {isMultiDrop && dropoffs && (
            <span className='shrink-0 rounded-full border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-[10px] font-bold text-secondary-700'>
              {dropoffs.length} {tCommon('stops')}
            </span>
          )}
        </div>

        {isMultiDrop && dropoffs ? (
          <div className='mt-2.5 space-y-2.5 pl-6 relative'>
            {dropoffs.map((stop, idx) => {
              const isLast = idx === dropoffs.length - 1;
              const formattedPhone = stop.recipient.phoneNumber
                ? formatPhoneNumber(stop.recipient.phoneNumber)
                : '';
              const hasName = Boolean(stop.recipient.name?.trim());
              const primaryLabel = hasName
                ? stop.recipient.name!.trim()
                : formattedPhone || tBooking('defaultRecipientName');

              return (
                <div key={stop.id || idx} className='relative'>
                  {!isLast && (
                    <span
                      className='pointer-events-none absolute -left-3.5 top-5 -bottom-2.5 w-px bg-slate-200'
                      aria-hidden='true'
                    />
                  )}
                  <span className='absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-brand-200 bg-brand-50 font-mono text-[10px] font-black text-brand-700'>
                    {idx + 1}
                  </span>

                  <div className='flex items-center justify-between gap-2'>
                    <span className='min-w-0 truncate text-xs font-bold text-slate-900'>
                      {primaryLabel}
                    </span>
                    <div className='flex items-center gap-1.5 shrink-0'>
                      {typeof stop.codAmount === 'number' && stop.codAmount > 0 && (
                        <span className='rounded border border-primary-200 bg-primary-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary-900'>
                          ${stop.codAmount.toFixed(2)}
                        </span>
                      )}
                      {hasName && formattedPhone && (
                        <span className='font-mono text-[10px] font-medium text-slate-500'>
                          {formattedPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className='truncate text-[11px] leading-snug text-slate-500'>
                    {stop.dropoff.address || tBooking('addressPending')}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className='mt-0.5 font-semibold text-slate-900 truncate'>
            {dropoff.address || tBooking('enterDestinationPlaceholder')}
          </p>
        )}
      </div>
    </div>
  );
}
