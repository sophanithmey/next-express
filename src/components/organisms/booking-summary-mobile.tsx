'use client';

import React, { useState } from 'react';
import {
  PickupLocation,
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
  CodInfo,
  DeliverySpeedOption,
} from '@/features/booking/types/booking-types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingSummaryMobileProps {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  recipient: RecipientInfo;
  deliveryOption?: DeliverySpeedOption;
  cod: CodInfo;
  deliveryFee: number;
}

export function BookingSummaryMobile({
  pickup,
  dropoff,
  dropoffs,
  recipient,
  deliveryOption = 'instant',
  cod,
  deliveryFee,
}: BookingSummaryMobileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const tDelivery = useTranslations('Delivery');
  const tParcel = useTranslations('Parcel');
  const isMultiDrop = Boolean(dropoffs && dropoffs.length > 1);

  return (
    <div className='lg:hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between text-left cursor-pointer'
      >
        <div>
          <span className='text-[11px] font-bold uppercase tracking-wider text-slate-400 block'>
            {tBooking('estimatedFee')}
          </span>
          <span className='text-lg font-black text-slate-950 font-mono'>
            ${deliveryFee.toFixed(2)}
          </span>
        </div>
        <div className='flex items-center gap-1 text-xs font-semibold text-amber-800'>
          <span>{isExpanded ? tCommon('close') : tCommon('details')}</span>
          {isExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className='mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 animate-in fade-in'>
          <div className='flex justify-between'>
            <span className='text-slate-400'>{tDelivery('speed')}:</span>
            <span className='font-semibold text-slate-800'>
              {deliveryOption === 'scheduled' || deliveryOption === 'same_day'
                ? `${tDelivery('scheduled')} (${deliveryOption === 'same_day' ? tDelivery('today') : tDelivery('tomorrow')})`
                : tDelivery('instant')}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-400'>{tBooking('mobilePickupLabel')}</span>
            <span className='font-semibold text-slate-800 truncate max-w-50'>
              {pickup.name || pickup.address || tBooking('pendingLabel')}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-400'>{tBooking('mobileDropoffLabel')}</span>
            <span className='font-semibold text-slate-800 truncate max-w-50'>
              {isMultiDrop && dropoffs
                ? `${dropoffs.length} ${tCommon('stops')}`
                : dropoff.address || tBooking('pendingLabel')}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-400'>
              {isMultiDrop
                ? `${tBooking('recipientsSummaryLabel')}:`
                : tBooking('mobileRecipientLabel')}
            </span>
            <span className='font-semibold text-slate-800 truncate max-w-50'>
              {isMultiDrop && dropoffs
                ? tBooking('recipientsCountValue', { count: dropoffs.length })
                : recipient.name || tBooking('pendingLabel')}
            </span>
          </div>
          {cod.isCod && (
            <div className='flex justify-between text-primary-800 font-bold'>
              <span>{tParcel('codToggle')}:</span>
              <span>${cod.amount.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
