'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookingOrder, DropoffStop } from '../types/booking-types';
import { loadLastBookedStops } from '../services/booking-draft-service';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { usePaymentDetail } from '@/features/payment/hooks/use-payment-detail';
import { bookingApiService } from '../services/booking-api-service';
import { bookingKeys } from './booking-keys';

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

  const locale = useLocale();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthState();
  const [cancelledStatusOverride, setCancelledStatusOverride] =
    useState<BookingOrder['status'] | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const lookupId = orderIdParam || tracking;

  const orderQuery = useQuery({
    queryKey: [...bookingKeys.detail(lookupId), locale],
    queryFn: ({ signal }) =>
      bookingApiService.getBookingById(lookupId, locale, signal),
    enabled: Boolean(lookupId),
    retry: false,
    staleTime: 15_000,
  });

  const orderStatus =
    cancelledStatusOverride ?? orderQuery.data?.status ?? 'pending';
  const resolvedPaymentId = orderQuery.data?.paymentId ?? paymentIdParam;

  const { paymentDetail, isLoadingDetail, refreshDetail } = usePaymentDetail(
    resolvedPaymentId,
    isAuthenticated,
  );

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) =>
      bookingApiService.cancelBooking({
        bookingId: lookupId,
        reason: reason || 'Cancelled by seller before courier acceptance',
        locale,
      }),
    onSuccess: async (updated) => {
      queryClient.setQueryData([...bookingKeys.detail(lookupId), locale], updated);
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });

  // Cancel allowed strictly before rider accepts or order is confirmed
  const canCancel = orderStatus === 'pending';
  const isCancelled = orderStatus === 'cancelled';

  const handleConfirmCancel = useCallback(
    async (reason?: string) => {
      if (!canCancel || cancelMutation.isPending) return;

      setCancelError(null);

      try {
        const updated = await cancelMutation.mutateAsync(reason);
        setCancelledStatusOverride(updated.status || 'cancelled');
        setIsCancelModalOpen(false);
        toast.success(tPayment('cancelledTitle'));
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to cancel booking right now. Please try again.';
        setCancelError(message);
      }
    },
    [canCancel, cancelMutation, tPayment],
  );

  const stops: DropoffStop[] = useMemo(() => {
    const apiStops = orderQuery.data?.dropoffs;
    if (apiStops && apiStops.length > 0) return apiStops;
    const cachedStops = loadLastBookedStops(tracking);
    if (cachedStops && cachedStops.length > 0) return cachedStops;
    return [
      {
        id: 'stop-1',
        recipient: { name: recipient, phoneNumber: '' },
        dropoff: { address: dropoff, coordinates: { lat: 11.5564, lng: 104.9282 } },
        codAmount,
      },
    ];
  }, [orderQuery.data?.dropoffs, tracking, recipient, dropoff, codAmount]);

  const bookingId = orderQuery.data?.id || lookupId;

  return {
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
    stopsCount: Math.max(stopsCount, stops.length),
    paymentMethod,
    deliverySpeed,
    orderStatus,
    canCancel,
    isCancelled,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isCancelling: cancelMutation.isPending,
    cancelError,
    handleConfirmCancel,
    paymentDetail,
    isLoadingPaymentDetail: isLoadingDetail,
    refreshPaymentDetail: refreshDetail,
  };
}

