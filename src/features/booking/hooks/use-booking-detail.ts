'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookingOrder, BookingFormData } from '../types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { saveBookingDraft } from '../services/booking-draft-service';
import { usePaymentDetail } from '@/features/payment/hooks/use-payment-detail';
import { bookingApiService } from '../services/booking-api-service';
import { bookingKeys } from './booking-keys';
import {
  formatOrderTimestamp,
  buildDefaultTimeline,
} from '../services/booking-detail-helpers';

const FALLBACK_EMPTY_ORDER: BookingOrder = {
  id: '',
  trackingNumber: '',
  trackingUrl: '',
  status: 'pending',
  pickup: { name: '', address: '', coordinates: APP_CONFIG.defaultCoordinates },
  dropoff: { address: '', coordinates: APP_CONFIG.defaultCoordinates },
  recipient: { name: '', phoneNumber: '' },
  parcel: {},
  cod: { isCod: false, amount: 0 },
  deliveryFee: 0,
  totalSellerCharge: 0,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

/**
 * Manages booking detail state, auth gating, fee breakdown, timeline milestones, and actions.
 */
export function useBookingDetail(
  initialOrder: BookingOrder | null,
  bookingId?: string,
) {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const tCommon = useTranslations('Common');
  const tPayment = useTranslations('Payment');
  const { isAuthenticated, openAuthModal } = useAuthState();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'tracking' | 'id' | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [showFullLog, setShowFullLog] = useState(false);

  const detailKey = useMemo(
    () => [...bookingKeys.detail(bookingId || initialOrder?.id || ''), locale],
    [bookingId, initialOrder?.id, locale],
  );

  const orderQuery = useQuery({
    queryKey: detailKey,
    queryFn: ({ signal }) =>
      bookingApiService.getBookingById(bookingId!, locale, signal),
    enabled: isAuthenticated && !initialOrder && Boolean(bookingId),
    initialData: initialOrder ?? undefined,
    staleTime: 30_000,
    retry: false,
  });

  const order = orderQuery.data ?? initialOrder;
  const isLoadingOrder = orderQuery.isFetching;

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
    }
  }, [isAuthenticated, openAuthModal]);

  const activeOrder = order || FALLBACK_EMPTY_ORDER;
  const {
    paymentDetail,
    isLoadingDetail: isLoadingPaymentDetail,
    refreshDetail: refreshPaymentDetail,
  } = usePaymentDetail(order?.paymentId, isAuthenticated);

  const formattedCreatedAt = useMemo(
    () => formatOrderTimestamp(activeOrder.createdAt),
    [activeOrder.createdAt],
  );

  const timelineEvents = useMemo(
    () =>
      activeOrder.timeline?.length
        ? activeOrder.timeline
        : buildDefaultTimeline(activeOrder),
    [activeOrder],
  );

  const destinationStops = useMemo(
    () =>
      activeOrder.dropoffs?.length
        ? activeOrder.dropoffs
        : [
            {
              id: 'stop-1',
              recipient: activeOrder.recipient,
              dropoff: activeOrder.dropoff,
            },
          ],
    [activeOrder.dropoffs, activeOrder.recipient, activeOrder.dropoff],
  );

  const extraStops = Math.max(0, destinationStops.length - 1);
  const stopOneFee = Math.max(0, activeOrder.deliveryFee - extraStops * 0.75);
  const isCancelled = activeOrder.status === 'cancelled';
  const canCancel =
    !isCancelled &&
    activeOrder.status !== 'delivered' &&
    activeOrder.status !== 'out_for_delivery' &&
    (activeOrder.status === 'pending' ||
      activeOrder.status === 'assigned' ||
      activeOrder.status === 'draft');

  const isPendingPayment =
    activeOrder.paymentStatus === 'pending' ||
    ((activeOrder.status === 'pending' || activeOrder.status === 'draft') &&
      activeOrder.paymentStatus !== 'paid');

  const handleCopy = useCallback(
    async (field: 'tracking' | 'id', value: string) => {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success(`${tCommon('copied')}: ${value}`);
      setTimeout(() => setCopiedField(null), 2000);
    },
    [tCommon],
  );

  const handleBookAgain = useCallback(() => {
    const draft: BookingFormData = {
      draftOrderId: activeOrder.status === 'draft' ? activeOrder.id : undefined,
      pickup: activeOrder.pickup,
      dropoff: activeOrder.dropoff,
      recipient: activeOrder.recipient,
      isBookingOnBehalf: false,
      dropoffs: destinationStops,
      parcel: activeOrder.parcel,
      cod: activeOrder.cod || { isCod: false, amount: 0 },
    };
    saveBookingDraft(draft);
    router.push('/booking');
  }, [activeOrder, destinationStops, router]);

  const handleContinuePayment = useCallback(() => {
    handleBookAgain();
    router.push('/booking/review');
  }, [handleBookAgain, router]);

  const cancelMutation = useMutation({
    mutationFn: (vars: { id: string; reason?: string }) =>
      bookingApiService.cancelBooking({
        bookingId: vars.id,
        reason: vars.reason || 'Seller requested cancellation',
        locale,
      }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(detailKey, updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.drafts() }),
      ]);
    },
  });

  const isCancelling = cancelMutation.isPending;

  const handleConfirmCancel = useCallback(
    async (reason?: string) => {
      if (!canCancel || cancelMutation.isPending || !order) return;
      setCancelError(null);

      try {
        await cancelMutation.mutateAsync({ id: order.id, reason });
        setIsCancelModalOpen(false);
        toast.success(tPayment('cancelledTitle'));
      } catch (err: unknown) {
        setCancelError(
          err instanceof Error
            ? err.message
            : 'Unable to cancel booking right now.',
        );
      }
    },
    [canCancel, cancelMutation, order, tPayment],
  );

  return {
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
    toggleMap: () => setShowMap((v) => !v),
    showFullLog,
    toggleFullLog: () => setShowFullLog((v) => !v),
    isCancelModalOpen,
    openCancelModal: () => setIsCancelModalOpen(true),
    closeCancelModal: () => setIsCancelModalOpen(false),
    isCancelling,
    cancelError,
    handleConfirmCancel,
    handleBookAgain,
    handleContinuePayment,
    paymentDetail,
    isLoadingPaymentDetail,
    refreshPaymentDetail,
  };
}
