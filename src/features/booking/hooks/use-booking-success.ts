'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BookingOrder } from '../types/booking-types';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { usePaymentDetail } from '@/features/payment/hooks/use-payment-detail';

/**
 * Manages booking confirmation metadata, live order status syncing,
 * and pre-acceptance cancellation workflow on the booking success page.
 */
export function useBookingSuccess() {
  const searchParams = useSearchParams();
  const tPayment = useTranslations('Payment');

  const refCode = searchParams.get('ref') || 'REF-84920';
  const orderIdParam = searchParams.get('orderId') || refCode;
  const tracking = searchParams.get('tracking') || 'EXP-88239012';
  const paymentRedirectUrl = searchParams.get('paymentUrl');
  const pickup = searchParams.get('pickup') || 'Central Warehouse (Main)';
  const dropoff =
    searchParams.get('dropoff') || 'BKK1, Khan Boeng Keng Kang, Phnom Penh';
  const recipient = searchParams.get('recipient') || 'Sokha Chan';
  const codAmount = parseFloat(searchParams.get('cod') || '0') || 0;
  const tipAmount = parseFloat(searchParams.get('tip') || '0') || 0;
  const feePaid = parseFloat(searchParams.get('fee') || '1.75') || 0;
  const stopsCount = parseInt(searchParams.get('stops') || '1', 10) || 1;
  const paymentMethod = searchParams.get('payment');
  const deliverySpeed = searchParams.get('speed');
  const paymentIdParam = searchParams.get('paymentId');

  const { isAuthenticated } = useAuthState();
  const [resolvedPaymentId, setResolvedPaymentId] = useState<string | null>(paymentIdParam);
  const [orderStatus, setOrderStatus] = useState<BookingOrder['status']>('pending');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { paymentDetail, isLoadingDetail, refreshDetail } = usePaymentDetail(
    resolvedPaymentId,
    isAuthenticated,
  );

  const lookupId = orderIdParam || tracking;

  useEffect(() => {
    let active = true;
    fetch(`/api/bookings/${encodeURIComponent(lookupId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BookingOrder | null) => {
        if (!active || !data) return;
        if (data.status) setOrderStatus(data.status);
        if (data.paymentId) setResolvedPaymentId(data.paymentId);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lookupId]);

  // Cancel allowed strictly before rider accepts or order is confirmed
  const canCancel = orderStatus === 'pending';
  const isCancelled = orderStatus === 'cancelled';

  const handleConfirmCancel = useCallback(
    async (reason?: string) => {
      if (!canCancel || isCancelling) return;

      setIsCancelling(true);
      setCancelError(null);

      try {
        const res = await fetch(`/api/bookings/${encodeURIComponent(lookupId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'cancel',
            reason: reason || 'Cancelled by seller before courier acceptance',
          }),
        });

      if (res.ok) {
        const updated = (await res.json()) as BookingOrder;
        setOrderStatus(updated.status || 'cancelled');
        setIsCancelModalOpen(false);
        toast.success(tPayment('cancelledTitle'));
        return;
      }

      if (res.status === 400 || res.status === 401) {
        const errBody = await res.json().catch(() => ({}));
        setCancelError(
          errBody.message || 'Cannot cancel this booking in its current state.'
        );
        return;
      }

      setCancelError('Unable to cancel booking right now. Please try again.');
    } catch {
      setCancelError('Unable to reach cancellation service. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  }, [canCancel, isCancelling, lookupId, tPayment]);

  return {
    refCode,
    tracking,
    paymentRedirectUrl,
    pickup,
    dropoff,
    recipient,
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
    isLoadingPaymentDetail: isLoadingDetail,
    refreshPaymentDetail: refreshDetail,
  };
}

