'use client';

import React from 'react';
import {
  PickupLocation, DropoffLocation, DropoffStop, RecipientInfo,
  ParcelInfo, CodInfo, BookingFeeQuote, DeliverySpeedOption,
} from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import {
  User, Users, Package, DollarSign,
  ShieldCheck, Clock, Zap, MapPinHouse, Calendar,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BookingSummaryMobile } from './booking-summary-mobile';
import { BookingSummaryStopList } from '../molecules/booking-summary-stop-list';

interface BookingSummaryProps {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  recipient: RecipientInfo;
  deliveryOption?: DeliverySpeedOption;
  parcel: ParcelInfo;
  cod: CodInfo;
  feeQuote: BookingFeeQuote | null;
  isLoadingFee?: boolean;
}

/**
 * Clean, uncluttered booking summary card with progressive disclosure of parcel/recipient metadata.
 */
export function BookingSummary({
  pickup, dropoff, dropoffs, recipient,
  deliveryOption = 'instant', parcel, cod,
  feeQuote, isLoadingFee,
}: BookingSummaryProps) {
  const tBooking = useTranslations('Booking');
  const tPickup = useTranslations('Pickup');
  const tDelivery = useTranslations('Delivery');
  const tCommon = useTranslations('Common');
  const tRecipient = useTranslations('Recipient');
  const tParcel = useTranslations('Parcel');

  const deliveryFee = feeQuote?.totalDeliveryFee ?? 1.75;
  const isMultiDrop = Boolean(dropoffs && dropoffs.length > 1);
  const hasRecipientName = Boolean(recipient.name?.trim());
  const hasParcelDetails = Boolean(parcel.description?.trim() || parcel.sellerOrderRef?.trim());

  return (
    <div className='w-full'>
      {/* Desktop Sticky Card */}
      <div className='hidden lg:block sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4'>
        <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
          <h3 className='text-sm font-bold text-slate-900 tracking-tight'>
            {tBooking('routePreview')}
          </h3>
          <span className='text-[10px] font-bold text-primary-950 bg-primary-100/90 px-2 py-0.5 rounded-full border border-primary-300'>
            {tBooking('readyToBook')}
          </span>
        </div>

        {/* Route Details with Connected Stepper */}
        <div className='space-y-1 text-xs'>
          <div className='flex items-start gap-2.5'>
            <MapPinHouse className='h-4 w-4 text-amber-600 mt-0.5 shrink-0' />
            <div className='min-w-0'>
              <span className='text-xs font-semibold text-slate-600 block'>
                {tCommon('stop')} 1 · {pickup.name || tPickup('origin')}
              </span>
              <p className='text-slate-500 text-[11px] truncate mt-0.5'>
                {pickup.address || tBooking('addressPending')}
              </p>
            </div>
          </div>

          {/* Dotted connecting route line */}
          <div className='ml-2 w-px h-3 bg-slate-200 my-0.5' />

          <BookingSummaryStopList dropoff={dropoff} dropoffs={dropoffs} />
        </div>

        {/* Dispatch Metadata (Only shows non-empty fields) */}
        <div className='rounded-xl bg-slate-50/80 p-3 border border-slate-100 space-y-2 text-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-slate-500 flex items-center gap-1.5'>
              {deliveryOption === 'scheduled' || deliveryOption === 'same_day' ? (
                <Calendar className='h-3.5 w-3.5 text-amber-600' />
              ) : (
                <Zap className='h-3.5 w-3.5 text-amber-500' />
              )}
              {tDelivery('scheduled')}:
            </span>
            <span className='font-semibold text-slate-800'>
              {deliveryOption === 'scheduled' || deliveryOption === 'same_day'
                ? `${tDelivery('scheduled')} (${deliveryOption === 'same_day' ? tDelivery('today') : tDelivery('tomorrow')})`
                : tDelivery('instant')}
            </span>
          </div>

          {(isMultiDrop || hasRecipientName) && (
            <div className='flex items-center justify-between'>
              <span className='text-slate-500 flex items-center gap-1.5'>
                {isMultiDrop ? (
                  <>
                    <Users className='h-3.5 w-3.5 text-slate-400' />
                    {tBooking('recipientsSummaryLabel')}:
                  </>
                ) : (
                  <>
                    <User className='h-3.5 w-3.5 text-slate-400' />
                    {tRecipient('nameLabel')}:
                  </>
                )}
              </span>
              <span className='font-semibold text-slate-800 truncate max-w-37.5'>
                {isMultiDrop && dropoffs
                  ? tBooking('recipientsCountValue', { count: dropoffs.length })
                  : recipient.name}
              </span>
            </div>
          )}

          {hasParcelDetails && (
            <div className='flex items-center justify-between'>
              <span className='text-slate-500 flex items-center gap-1.5'>
                <Package className='h-3.5 w-3.5 text-slate-400' /> {tParcel('description')}:
              </span>
              <span className='font-medium text-slate-800 truncate max-w-37.5'>
                {parcel.description || parcel.sellerOrderRef}
              </span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className='border-t border-slate-100 pt-3 text-xs'>
          <div className='flex justify-between items-center text-sm font-bold text-slate-900'>
            <span>{tBooking('estimatedFee')}:</span>
            <span className='text-xl text-slate-950 font-black font-mono'>
              {isLoadingFee
                ? '…'
                : `${APP_CONFIG.currencySymbol}${deliveryFee.toFixed(2)}`}
            </span>
          </div>

          {/* COD Notice */}
          {cod.isCod && (
            <div className='mt-3 rounded-xl bg-primary-50/70 p-3 border border-primary-200 text-xs text-primary-950 space-y-1'>
              <div className='flex items-center justify-between font-bold'>
                <span className='flex items-center gap-1'>
                  <DollarSign className='h-3.5 w-3.5' /> {tParcel('codToggle')}:
                </span>
                <span className='text-sm font-mono'>
                  ${cod.amount.toFixed(2)}
                </span>
              </div>
              <p className='text-[10px] text-primary-800 font-medium'>
                {tBooking('codDisclaimerNote')}
              </p>
            </div>
          )}
        </div>

        {/* Delivery Guarantee Notes */}
        <div className='border-t border-slate-100 pt-3 flex flex-col gap-1.5 text-[11px] text-slate-500'>
          <div className='flex items-center gap-2'>
            <Clock className='h-3.5 w-3.5 text-amber-600 shrink-0' />
            <span>{tBooking('guaranteeDispatchTime')}</span>
          </div>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='h-3.5 w-3.5 text-emerald-600 shrink-0' />
            <span>{tBooking('guaranteeLiveTracking')}</span>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Compact Bar */}
      <BookingSummaryMobile
        pickup={pickup}
        dropoff={dropoff}
        dropoffs={dropoffs}
        recipient={recipient}
        deliveryOption={deliveryOption}
        cod={cod}
        deliveryFee={deliveryFee}
      />
    </div>
  );
}
