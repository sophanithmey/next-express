'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { useBookingDetail } from '../hooks/use-booking-detail';
import { BookingDetailOverview } from './booking-detail-overview';
import { BookingDetailRoute } from './booking-detail-route';
import { BookingDetailParcel } from './booking-detail-parcel';
import { BookingDetailTimeline } from './booking-detail-timeline';
import { BookingDetailSidebar } from './booking-detail-sidebar';
import { CancelOrderModal } from '@/components/molecules/cancel-order-modal';
import { Button } from '@/components/atoms/button';
import { useTranslations } from 'next-intl';

interface BookingDetailViewProps {
  order: BookingOrder | null;
  bookingId?: string;
}

export function BookingDetailView({
  order: initialOrder,
  bookingId,
}: BookingDetailViewProps) {
  const tDetails = useTranslations('BookingDetails');
  const {
    order,
    isLoadingOrder,
    isAuthenticated,
    openAuthModal,
    formattedCreatedAt,
    timelineEvents,
    destinationStops,
    extraStops,
    stopOneFee,
    isCancelled,
    canCancel,
    isPendingPayment,
    copiedField,
    handleCopy,
    showMap,
    toggleMap,
    showFullLog,
    toggleFullLog,
    isCancelModalOpen,
    openCancelModal,
    closeCancelModal,
    isCancelling,
    cancelError,
    handleConfirmCancel,
    handleBookAgain,
    handleContinuePayment,
    paymentDetail,
    isLoadingPaymentDetail,
    refreshPaymentDetail,
  } = useBookingDetail(initialOrder, bookingId);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600 border border-secondary-200">
          <Lock className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            {tDetails('signInTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {tDetails('signInDesc')}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => openAuthModal()}
          className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-xl px-6 py-2.5"
        >
          {tDetails('logInToContinue')}
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 text-center text-xs text-slate-500">
        {isLoadingOrder ? 'Loading booking details…' : 'Booking details unavailable.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookingDetailOverview
        order={order}
        formattedCreatedAt={formattedCreatedAt}
        stopsCount={destinationStops.length}
        copiedField={copiedField}
        onCopy={handleCopy}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Live Progress, Stops/Map & Parcel Info */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <BookingDetailTimeline
            order={order}
            timelineEvents={timelineEvents}
            showFullLog={showFullLog}
            onToggleLog={toggleFullLog}
          />

          <BookingDetailRoute
            order={order}
            destinationStops={destinationStops}
            showMap={showMap}
            onToggleMap={toggleMap}
          />

          <BookingDetailParcel order={order} />
        </div>

        {/* Right Sticky Column: Share Tracking, Payment Summary & Actions */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6">
          <BookingDetailSidebar
            order={order}
            extraStops={extraStops}
            stopOneFee={stopOneFee}
            isPendingPayment={isPendingPayment}
            canCancel={canCancel}
            isCancelled={isCancelled}
            onBookAgain={handleBookAgain}
            onContinuePayment={handleContinuePayment}
            onRequestCancel={openCancelModal}
            isCancelling={isCancelling}
            paymentDetail={paymentDetail}
            isLoadingPaymentDetail={isLoadingPaymentDetail}
            onRefreshPaymentDetail={refreshPaymentDetail}
          />
        </div>
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        tracking={order.trackingNumber || order.id}
        isCancelling={isCancelling}
        cancelError={cancelError}
        onClose={closeCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
