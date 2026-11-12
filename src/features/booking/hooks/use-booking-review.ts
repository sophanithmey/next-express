'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/axios/client-axios';
import { bookingApiService, CreateBookingSubmission } from '../services/booking-api-service';
import { bookingKeys } from './booking-keys';
import {
  BookingFormData,
  BookingFeeQuote,
  BookingOrder,
} from '../types/booking-types';
import {
  loadBookingDraft,
  clearBookingDraft,
  saveLastBookedStops,
} from '../services/booking-draft-service';
import { syncCodWithDropoffs } from '../services/booking-form-helpers';
import {
  calculateMockFee,
  generateMockReference,
  generateMockTracking,
} from '../data/mock-booking-data';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { PromoCode } from '../services/promo-service';
import { PaymentMethodType } from '@/components/organisms/payment-method-selector';
import { usePaymentOptions } from '@/features/payment/hooks/use-payment-options';
import { usePaymentCards } from '@/features/payment/hooks/use-payment-cards';
import {
  isCardPaymentProvider,
  normalizePaymentKind,
} from '@/features/payment/utils/payment-provider-helpers';

/**
 * Manages booking review state, dynamic payment options, saved cards, auth gating, and submission.
 */
export function useBookingReview() {
  const router = useRouter();
  const locale = useLocale();
  const tPayment = useTranslations('Payment');
  const { isAuthenticated, user, openAuthModal } = useAuthState();

  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('khqr');
  const [isPaying, setIsPaying] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);

  const {
    options: paymentOptions,
    isLoadingOptions,
    checkAvailability,
  } = usePaymentOptions(isAuthenticated, 'ST_EXPRESS');

  const paymentCardsState = usePaymentCards(isAuthenticated);

  useEffect(() => {
    const draft = loadBookingDraft();
    if (!draft || !draft.pickup.address) {
      router.replace('/booking');
      return;
    }
    const effectiveCod = draft.dropoffs?.length
      ? syncCodWithDropoffs(draft.dropoffs, draft.cod)
      : draft.cod;
    setFormData({ ...draft, cod: effectiveCod });
  }, [router]);

  useEffect(() => {
    if (paymentOptions.length === 0) return;
    setSelectedPayment((current) => {
      const currentMatch = paymentOptions.find(
        (opt) => opt.providerCode === current && opt.isAvailable,
      );
      if (currentMatch) return currentMatch.providerCode;

      const kindMatch = paymentOptions.find(
        (opt) =>
          opt.isAvailable &&
          normalizePaymentKind(opt.providerCode) === normalizePaymentKind(current),
      );
      if (kindMatch) return kindMatch.providerCode;

      const defaultOpt =
        paymentOptions.find((opt) => opt.isDefault && opt.isAvailable) ||
        paymentOptions.find((opt) => opt.isAvailable);
      return defaultOpt?.providerCode || current;
    });
  }, [paymentOptions]);

  const additionalStops = useMemo(
    () => Math.max(0, (formData?.dropoffs?.length || 1) - 1),
    [formData?.dropoffs],
  );

  const feeQuote: BookingFeeQuote | null = useMemo(() => {
    if (!formData) return null;
    return calculateMockFee(
      formData.pickup.coordinates,
      formData.dropoff.coordinates,
      additionalStops,
      formData.deliveryOption || 'instant',
    );
  }, [formData, additionalStops]);

  const totalFee = feeQuote?.totalDeliveryFee ?? 0;
  const discountedFee = Math.max(0, totalFee - discountAmount);
  const netPayableFee = discountedFee + tipAmount;

  const handleApplyPromo = useCallback((promo: PromoCode, discount: number) => {
    setAppliedPromo(promo);
    setDiscountAmount(discount);
  }, []);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setDiscountAmount(0);
  }, []);

  const handleAddCard = useCallback(async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const provider = isCardPaymentProvider(selectedPayment)
      ? selectedPayment
      : 'card';
    const redirectUrl = await paymentCardsState.createCard(provider, 'ST_EXPRESS');
    if (redirectUrl && typeof window !== 'undefined') {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      toast.info(tPayment('cardRedirectOpened'));
    }
  }, [isAuthenticated, openAuthModal, selectedPayment, paymentCardsState, tPayment]);

  const queryClient = useQueryClient();

  const createBookingMutation = useMutation({
    mutationFn: (payload: CreateBookingSubmission) =>
      bookingApiService.createBooking(payload, { locale }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.drafts() }),
      ]);
    },
  });

  const handleFinalPayment = useCallback(async () => {
    if (!formData || isPaying || createBookingMutation.isPending) return;

    setIsPaying(true);

    const availability = await checkAvailability(selectedPayment);
    if (availability && !availability.isAvailable) {
      toast.error(
        availability.unavailableReason ||
          'Selected payment method is currently unavailable.',
      );
      setIsPaying(false);
      return;
    }

    const fallbackRef = generateMockReference();
    const fallbackTracking = generateMockTracking();
    const stopsCount = formData.dropoffs?.length || 1;
    const dropoffSummary =
      stopsCount > 1
        ? `${formData.dropoff.address} (+${stopsCount - 1} more)`
        : formData.dropoff.address;

    try {
      const data = await createBookingMutation.mutateAsync({
        ...formData,
        trackingNumber: fallbackTracking,
        paymentMethod: selectedPayment,
        paymentCardId:
          isCardPaymentProvider(selectedPayment) && paymentCardsState.selectedCardId
            ? paymentCardsState.selectedCardId
            : undefined,
        promoCode: appliedPromo?.code,
        discountAmount,
        tipAmount,
        finalFee: netPayableFee,
      } as CreateBookingSubmission & { trackingNumber?: string });

      const orderId = data.id || fallbackRef;
      const tracking = data.trackingNumber || fallbackTracking;
      const resolvedFee =
        typeof data.deliveryFee === 'number' ? data.deliveryFee : netPayableFee;

      const query = new URLSearchParams({
        orderId,
        ref: data.orderNumber || orderId,
        tracking,
        pickup: formData.pickup.name || formData.pickup.address,
        dropoff: dropoffSummary,
        recipient: formData.recipient.name || 'Recipient',
        stops: String(stopsCount),
        cod: formData.cod.isCod ? String(formData.cod.amount) : '0',
        payment: selectedPayment.toUpperCase(),
        fee: String(resolvedFee),
        promo: appliedPromo?.code || '',
        discount: String(discountAmount),
        tip: String(tipAmount),
        speed: formData.deliveryOption || 'instant',
        ...(data.paymentId ? { paymentId: data.paymentId } : {}),
        ...(data.paymentRedirectUrl ? { paymentUrl: data.paymentRedirectUrl } : {}),
      });

      const resolvedStops =
        data.dropoffs && data.dropoffs.length > 0
          ? data.dropoffs
          : formData.dropoffs || [];
      saveLastBookedStops(tracking, resolvedStops);
      clearBookingDraft();
      setIsPaying(false);
      router.push(`/booking/success?${query.toString()}`);
    } catch (err: unknown) {
      setIsPaying(false);
      if (err instanceof ApiClientError && err.statusCode === 401) {
        openAuthModal(() => {
          void handleFinalPayment();
        });
        return;
      }
      toast.error(
        err instanceof Error
          ? err.message
          : 'Unable to submit booking. Please try again.',
      );
    }
  }, [
    formData,
    isPaying,
    checkAvailability,
    selectedPayment,
    createBookingMutation,
    paymentCardsState.selectedCardId,
    appliedPromo,
    discountAmount,
    tipAmount,
    netPayableFee,
    openAuthModal,
    router,
  ]);

  const handlePayClick = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal(() => {
        void handleFinalPayment();
      });
      return;
    }
    void handleFinalPayment();
  }, [isAuthenticated, openAuthModal, handleFinalPayment]);

  return {
    formData,
    isAuthenticated,
    user,
    selectedPayment,
    setSelectedPayment,
    paymentOptions,
    isLoadingOptions,
    paymentCardsState,
    openAuthModal,
    handleAddCard,
    isPaying,
    appliedPromo,
    discountAmount,
    tipAmount,
    setTipAmount,
    additionalStops,
    totalFee,
    netPayableFee,
    handleApplyPromo,
    handleRemovePromo,
    handlePayClick,
  };
}
