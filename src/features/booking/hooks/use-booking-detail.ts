'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BookingOrder, BookingFormData } from '../types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { saveBookingDraft } from '../services/booking-draft-service';
import { usePaymentDetail } from '@/features/payment/hooks/use-payment-detail';
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
  const tCommon = useTranslations('Common');
  const tPayment = useTranslations('Payment');
  const { isAuthenticated, openAuthModal } = useAuthState();

  const [order, setOrder] = useState<BookingOrder | null>(initialOrder);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'tracking' | 'id' | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [showFullLog, setShowFullLog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
    }
  }, [isAuthenticated, openAuthModal]);

  useEffect(() => {
    if (!isAuthenticated || order || !bookingId) return;
    let active = true;
    setIsLoadingOrder(true);
    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      headers: { 'Accept-Language': locale.toUpperCase() },
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((fetched: BookingOrder | null) => {
        if (active && fetched) setOrder(fetched);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoadingOrder(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, order, bookingId, locale]);

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

  const handleConfirmCancel = useCallback(
    async (reason?: string) => {
      if (!canCancel || isCancelling || !order) return;
      setIsCancelling(true);
      setCancelError(null);

      try {
        const res = await fetch(`/api/bookings/${encodeURIComponent(order.id)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': locale.toUpperCase(),
          },
          body: JSON.stringify({
            action: 'cancel',
            reason: reason || 'Seller requested cancellation',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order || (data.id ? data : { ...order, status: 'cancelled' }));
          setIsCancelModalOpen(false);
          toast.success(tPayment('cancelledTitle'));
          return;
        }
        const err = await res.json().catch(() => ({}));
        setCancelError(err.message || 'Unable to cancel booking right now.');
      } catch {
        setCancelError('Unable to reach cancellation service. Please try again.');
      } finally {
        setIsCancelling(false);
      }
    },
    [canCancel, isCancelling, order, locale, tPayment],
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
