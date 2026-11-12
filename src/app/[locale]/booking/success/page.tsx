'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useBookingSuccess } from '@/features/booking/hooks/use-booking-success';
import { BookingSuccessReceipt } from '@/components/organisms/booking-success-receipt';
import { ShareTrackingCard } from '@/components/molecules/share-tracking-card';
import { BookingSuccessPaymentCard } from '@/components/molecules/booking-success-payment-card';
import { BookingSuccessActions } from '@/components/molecules/booking-success-actions';
import { PaymentDetailCard } from '@/components/molecules/payment-detail-card';

function BookingSuccessContent() {
  const tPayment = useTranslations('Payment');
  const {
    bookingId,
    refCode,
    tracking,
    paymentRedirectUrl,
    pickup,
    dropoff,
    recipient,
    stops,
    codAmount,
    tipAmount,
    feePaid,
    stopsCount,
    paymentMethod,
    deliverySpeed,
    orderStatus,
    canCancel,
    isCancelled,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isCancelling,
    cancelError,
    handleConfirmCancel,
    paymentDetail,
    isLoadingPaymentDetail,
    refreshPaymentDetail,
  } = useBookingSuccess();

  const activeStep =
    orderStatus === 'delivered'
      ? 3
      : orderStatus === 'out_for_delivery'
      ? 2
      : 1;

  return (
    <div className="mx-auto max-w-7xl w-full space-y-5">
      {/* Compact Horizontal Status Hero */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          {isCancelled ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger-100 text-danger-600">
              <XCircle className="h-7 w-7" />
            </div>
          ) : (
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-success-200/60 animate-ping"
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>
          )}

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              {isCancelled ? tPayment('cancelledTitle') : tPayment('successTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isCancelled
                ? tPayment('cancelledSubtitle')
                : tPayment('successSubtitle')}
            </p>
          </div>
        </div>

        <span
          className={
            isCancelled
              ? 'inline-flex items-center gap-1.5 rounded-full border border-danger-200 bg-danger-50 px-3 py-1 text-xs font-bold text-danger-700'
              : 'inline-flex items-center gap-1.5 rounded-full border border-success-200 bg-success-50 px-3 py-1 text-xs font-bold text-success-800'
          }
        >
          {isCancelled ? (
            <>
              <XCircle className="h-3.5 w-3.5 text-danger-600" />
              <span>{tPayment('statusCancelled')}</span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-success-600" />
              <span>
                {canCancel ? tPayment('statusPending') : tPayment('stepConfirmed')}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Left & Right Two-Column Desktop Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Dispatch Receipt & Route Breakdown */}
        <div className="lg:col-span-7 xl:col-span-8">
          <BookingSuccessReceipt
            refCode={refCode}
            tracking={tracking}
            pickup={pickup}
            dropoff={dropoff}
            recipient={recipient}
            stops={stops}
            stopsCount={stopsCount}
            deliverySpeed={deliverySpeed}
            isCancelled={isCancelled}
            activeStep={activeStep}
          />
        </div>

        {/* Right Side: Summary + Share Hub (Single-stop only) + Actions */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-4">
          {!isCancelled && stops.length <= 1 && (
            <ShareTrackingCard
              tracking={tracking}
              recipient={recipient}
              dropoff={dropoff}
              codAmount={codAmount}
            />
          )}

          <BookingSuccessPaymentCard
            paymentMethod={paymentMethod}
            feePaid={feePaid}
            tipAmount={tipAmount}
            codAmount={codAmount}
          />

          <BookingSuccessActions
            bookingId={bookingId}
            tracking={tracking}
            paymentRedirectUrl={paymentRedirectUrl}
            canCancel={canCancel}
            isCancelled={isCancelled}
            isCancelModalOpen={isCancelModalOpen}
            onOpenCancelModal={() => setIsCancelModalOpen(true)}
            onCloseCancelModal={() => setIsCancelModalOpen(false)}
            onConfirmCancel={handleConfirmCancel}
            isCancelling={isCancelling}
            cancelError={cancelError}
          />

          <PaymentDetailCard
            detail={paymentDetail}
            isLoading={isLoadingPaymentDetail}
            onRefresh={refreshPaymentDetail}
          />
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="flex-1 bg-slate-50/60 flex flex-col antialiased font-sans">
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl w-full p-12 text-center text-xs text-slate-400">
              Loading booking status…
            </div>
          }
        >
          <BookingSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
