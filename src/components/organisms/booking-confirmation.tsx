'use client';

import React, { useState } from 'react';
import {
  BookingFormData,
  BookingFeeQuote,
} from '@/features/booking/types/booking-types';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { LoginModal } from './login-modal';
import { Button } from '../atoms/button';
import { PriceRow } from '../molecules/price-row';
import { APP_CONFIG } from '@/lib/constants';
import { UserProfile } from '@/features/auth/types/auth-types';
import {
  MapPin,
  User,
  Package,
  Banknote,
  Edit3,
  ArrowLeft,
  Check,
  ShieldCheck,
  Store,
  AlertCircle,
} from 'lucide-react';

interface BookingConfirmationProps {
  formData: BookingFormData;
  feeQuote: BookingFeeQuote | null;
  onEditStep: (stepNumber: number) => void;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export function BookingConfirmation({
  formData,
  feeQuote,
  onEditStep,
  onConfirm,
  onBack,
  isSubmitting,
  errorMessage,
}: BookingConfirmationProps) {
  const { isAuthenticated, user, login } = useAuthState();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const deliveryFee = feeQuote?.totalDeliveryFee ?? 1.6;

  const handleConfirmClick = () => {
    if (isAuthenticated) {
      onConfirm();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    login(loggedInUser);
    setShowLoginModal(false);
    // Automatically submit booking now that user is authenticated
    onConfirm();
  };

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-bold text-slate-900'>
            Review &amp; Confirm Delivery
          </h3>
          <p className='text-xs text-slate-500'>
            Please verify the route, recipient, and COD charges before
            dispatching
          </p>
        </div>

        {/* Authenticated vs Guest Status Banner */}
        {isAuthenticated ? (
          <div className='flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 shadow-2xs'>
            <div className='flex items-center gap-2.5'>
              <Store className='h-4 w-4 text-emerald-600 flex-shrink-0' />
              <span>
                Booking as{' '}
                <strong>
                  {user?.shopName || user?.name || user?.phoneNumber}
                </strong>
              </span>
            </div>
            <span className='hidden sm:inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]'>
              <Check className='h-3 w-3' /> Account Verified
            </span>
          </div>
        ) : (
          <div className='flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 p-3.5 text-xs text-brand-900 shadow-2xs'>
            <ShieldCheck className='h-4 w-4 text-brand-600 flex-shrink-0' />
            <span>
              <strong>Guest Booking:</strong> Clicking confirm will verify your
              phone number via a quick PIN. All delivery details are preserved.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className='flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Route & Locations */}
          <div className='rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-2'>
              <h4 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
                <MapPin className='h-4 w-4 text-brand-600' />
                <span>Route &amp; Locations</span>
              </h4>
              <button
                type='button'
                onClick={() => onEditStep(1)}
                className='flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium'
              >
                <Edit3 className='h-3 w-3' />
                <span>Edit</span>
              </button>
            </div>

            <div className='space-y-3 text-xs'>
              <div>
                <span className='font-semibold text-slate-700 block'>
                  Pickup Warehouse:
                </span>
                <p className='font-medium text-slate-900'>
                  {formData.pickup.name}
                </p>
                <p className='text-slate-500'>{formData.pickup.address}</p>
              </div>
              <div className='border-t border-slate-100 pt-2'>
                <span className='font-semibold text-slate-700 block'>
                  Drop-off Destination:
                </span>
                <p className='font-medium text-slate-900'>
                  {formData.dropoff.address}
                </p>
                {formData.dropoff.landmark && (
                  <p className='text-slate-500'>
                    Landmark: {formData.dropoff.landmark}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className='rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-2'>
              <h4 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
                <User className='h-4 w-4 text-brand-600' />
                <span>Recipient Details</span>
              </h4>
              <button
                type='button'
                onClick={() => onEditStep(2)}
                className='flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium'
              >
                <Edit3 className='h-3 w-3' />
                <span>Edit</span>
              </button>
            </div>

            <div className='space-y-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-slate-500'>Customer Name:</span>
                <span className='font-semibold text-slate-900'>
                  {formData.recipient.name}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-500'>Phone Number:</span>
                <span className='font-semibold text-slate-900 font-mono'>
                  {formData.recipient.phoneNumber}
                </span>
              </div>
              {formData.recipient.notes && (
                <div className='border-t border-slate-100 pt-1.5 text-slate-600'>
                  <span className='font-medium'>Instructions: </span>
                  {formData.recipient.notes}
                </div>
              )}
              {formData.isBookingOnBehalf && formData.senderName && (
                <div className='rounded bg-slate-50 p-2 text-slate-600 border border-slate-200'>
                  <span className='font-medium'>Sender on Label: </span>
                  {formData.senderName} ({formData.senderPhone})
                </div>
              )}
            </div>
          </div>

          {/* Parcel Details */}
          <div className='rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-2'>
              <h4 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
                <Package className='h-4 w-4 text-brand-600' />
                <span>Parcel Details</span>
              </h4>
              <button
                type='button'
                onClick={() => onEditStep(4)}
                className='flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium'
              >
                <Edit3 className='h-3 w-3' />
                <span>Edit</span>
              </button>
            </div>

            <div className='space-y-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-slate-500'>Order Ref:</span>
                <span className='font-mono font-semibold text-slate-900'>
                  {formData.parcel.sellerOrderRef || 'None'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-500'>Quantity:</span>
                <span className='font-semibold text-slate-900'>
                  {formData.parcel.quantity || 1}
                </span>
              </div>
              {formData.parcel.description && (
                <div className='text-slate-600'>
                  <span className='font-medium'>Description: </span>
                  {formData.parcel.description}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & COD */}
          <div className='rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-2'>
              <h4 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
                <Banknote className='h-4 w-4 text-brand-600' />
                <span>Pricing &amp; COD</span>
              </h4>
              <button
                type='button'
                onClick={() => onEditStep(5)}
                className='flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium'
              >
                <Edit3 className='h-3 w-3' />
                <span>Edit</span>
              </button>
            </div>

            <div className='space-y-1'>
              <PriceRow label='Estimated Delivery Fee' amount={deliveryFee} />
              <PriceRow
                label='Total Delivery Cost'
                amount={deliveryFee}
                isTotal
              />
              {formData.cod.isCod && (
                <div className='mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs border border-emerald-200 flex justify-between items-center text-emerald-900'>
                  <span className='font-medium'>
                    COD Collection from Buyer:
                  </span>
                  <span className='font-bold text-sm'>
                    {APP_CONFIG.currencySymbol}
                    {formData.cod.amount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center justify-between border-t border-slate-200 pt-6'>
          <Button
            type='button'
            variant='outline'
            size='md'
            onClick={onBack}
            disabled={isSubmitting}
            leftIcon={<ArrowLeft className='h-4 w-4' />}
          >
            Back to Form
          </Button>

          <Button
            type='button'
            variant='primary'
            size='lg'
            onClick={handleConfirmClick}
            isLoading={isSubmitting}
            leftIcon={<Check className='h-4 w-4' />}
          >
            {isAuthenticated
              ? 'Confirm & Dispatch Delivery'
              : 'Confirm & Book Delivery'}
          </Button>
        </div>
      </div>
    </>
  );
}
