'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DeliverySchedule,
  DeliverySpeedOption,
  DropoffStop,
  PickupLocation,
} from '../types/booking-types';
import {
  clearBulkOrdersDraft,
  loadBulkOrdersDraft,
  saveBulkOrdersDraft,
} from '../services/booking-draft-service';
import {
  BulkOrderDraft,
  SAMPLE_BULK_CSV,
  convertOrdersToBulkDrafts,
  createEmptyBulkOrderDraft,
  createEmptyBulkStop,
  parseBulkOrderFile,
  parseBulkOrderText,
  validateBulkOrderBatch,
} from '../services/bulk-order-parser';
import {
  BulkBatchSubmissionItem,
  calculateBulkBatchFees,
  calculateBulkFinalPayableFee,
  submitBulkOrderBatch,
} from '../services/bulk-batch-submitter';
import { PromoCode, validatePromoCode } from '../services/promo-service';
import { optimizeStopOrder } from '../services/route-optimizer';
import { validateDeliveryAvailability } from '../services/operation-hours-service';
import { bookingKeys } from './booking-keys';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { usePaymentOptions } from '@/features/payment/hooks/use-payment-options';
import { usePaymentCards } from '@/features/payment/hooks/use-payment-cards';
import {
  isCardPaymentProvider,
  normalizePaymentKind,
} from '@/features/payment/utils/payment-provider-helpers';
import { PaymentMethodType } from '@/components/organisms/payment-method-selector';
import { MAX_BULK_ORDERS, MAX_STOPS_PER_BULK_ORDER } from '@/lib/constants';

export type BulkPaymentMethod = PaymentMethodType;

interface UseBulkOrderBookingProps {
  pickup: PickupLocation;
  onChangePickup: (pickup: PickupLocation) => void;
  deliveryOption: DeliverySpeedOption;
  onChangeDeliveryOption: (option: DeliverySpeedOption) => void;
  deliverySchedule?: DeliverySchedule;
  onChangeDeliverySchedule: (schedule: DeliverySchedule) => void;
}

export function useBulkOrderBooking({
  pickup,
  onChangePickup,
  deliveryOption,
  onChangeDeliveryOption,
  deliverySchedule,
  onChangeDeliverySchedule,
}: UseBulkOrderBookingProps) {
  const locale = useLocale();
  const tBooking = useTranslations('Booking');
  const tPayment = useTranslations('Payment');
  const queryClient = useQueryClient();
  const { isAuthenticated, openAuthModal } = useAuthState();

  const [orders, setOrders] = useState<BulkOrderDraft[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('khqr');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState({ completed: 0, total: 0 });
  const [submissionResults, setSubmissionResults] = useState<
    BulkBatchSubmissionItem[] | null
  >(null);
  const isDraftHydratedRef = useRef(false);

  // Restore in-progress bulk orders when switching tabs or reloading
  useEffect(() => {
    const saved = loadBulkOrdersDraft();
    if (saved) {
      if (saved.orders.length > 0) {
        setOrders(saved.orders.slice(0, MAX_BULK_ORDERS));
      }
      if (saved.selectedPayment) {
        setSelectedPayment(saved.selectedPayment);
      }
      if (saved.promoCode) {
        const promoRes = validatePromoCode(saved.promoCode, 9999);
        if (promoRes.isValid && promoRes.promo) {
          setAppliedPromo(promoRes.promo);
        }
      }
      if (typeof saved.tipAmount === 'number' && saved.tipAmount >= 0) {
        setTipAmount(saved.tipAmount);
      }
    }
    isDraftHydratedRef.current = true;
  }, []);

  // Auto-save bulk orders to sessionStorage so mode switches never lose work
  useEffect(() => {
    if (!isDraftHydratedRef.current) return;
    if (orders.length === 0) {
      clearBulkOrdersDraft();
      return;
    }
    saveBulkOrdersDraft({
      orders,
      selectedPayment,
      promoCode: appliedPromo?.code,
      tipAmount,
    });
  }, [orders, selectedPayment, appliedPromo, tipAmount]);

  const {
    options: paymentOptions,
    isLoadingOptions,
    checkAvailability,
  } = usePaymentOptions(isAuthenticated, 'ST_EXPRESS');

  const paymentCardsState = usePaymentCards(isAuthenticated);

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

  const batchSummary = useMemo(
    () => calculateBulkBatchFees(pickup, orders, deliveryOption, deliverySchedule),
    [pickup, orders, deliveryOption, deliverySchedule],
  );

  const discountAmount = useMemo(() => {
    if (!appliedPromo || batchSummary.totalFee <= 0) return 0;
    const res = validatePromoCode(appliedPromo.code, batchSummary.totalFee);
    return res.isValid ? res.discountAmount : 0;
  }, [appliedPromo, batchSummary.totalFee]);

  const finalPayableFee = useMemo(
    () =>
      calculateBulkFinalPayableFee(
        batchSummary.totalFee,
        discountAmount,
        tipAmount,
      ),
    [batchSummary.totalFee, discountAmount, tipAmount],
  );

  const handleApplyPromo = useCallback((promo: PromoCode) => {
    setAppliedPromo(promo);
  }, []);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  const validation = useMemo(
    () => validateBulkOrderBatch(pickup, orders),
    [pickup, orders],
  );

  const handleImportOrders = useCallback((imported: BulkOrderDraft[]) => {
    const bounded = imported.slice(0, MAX_BULK_ORDERS);
    setOrders(bounded);
    setHasAttemptedSubmit(false);
    setSubmissionResults(null);
    const stopsTotal = bounded.reduce((sum, o) => sum + o.stops.length, 0);
    toast.success(
      tBooking('bulkLoadedToast', { orders: bounded.length, stops: stopsTotal }),
    );
  }, [tBooking]);

  const handleLoadSample = useCallback(() => {
    const parsed = parseBulkOrderText(SAMPLE_BULK_CSV);
    const drafts = convertOrdersToBulkDrafts(parsed);
    handleImportOrders(drafts);
  }, [handleImportOrders]);

  const handleDirectFileUpload = useCallback(
    async (file: File) => {
      try {
        const text = await parseBulkOrderFile(file);
        const parsed = parseBulkOrderText(text);
        const drafts = convertOrdersToBulkDrafts(parsed);
        if (drafts.length === 0) {
          toast.error(tBooking('bulkNoValidOrdersError'));
          return;
        }
        handleImportOrders(drafts);
      } catch {
        toast.error(tBooking('bulkFileReadError'));
      }
    },
    [handleImportOrders, tBooking],
  );

  const handleAddOrder = useCallback(() => {
    setOrders((prev) => {
      if (prev.length >= MAX_BULK_ORDERS) return prev;
      return [...prev, createEmptyBulkOrderDraft(prev.length + 1)];
    });
  }, []);

  const handleRemoveOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const handleClearOrders = useCallback(() => {
    setOrders([]);
    setAppliedPromo(null);
    setTipAmount(0);
    setHasAttemptedSubmit(false);
    setSubmissionResults(null);
  }, []);

  const handleAddStop = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId || o.stops.length >= MAX_STOPS_PER_BULK_ORDER) {
          return o;
        }
        return {
          ...o,
          stops: [...o.stops, createEmptyBulkStop(o.stops.length + 1)],
        };
      }),
    );
  }, []);

  const handleUpdateStop = useCallback(
    (orderId: string, stopIndex: number, updated: DropoffStop) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                stops: o.stops.map((s, idx) => (idx === stopIndex ? updated : s)),
              }
            : o,
        ),
      );
    },
    [],
  );

  const handleRemoveStop = useCallback((orderId: string, stopIndex: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId || o.stops.length <= 1) return o;
        return { ...o, stops: o.stops.filter((_, idx) => idx !== stopIndex) };
      }),
    );
  }, []);

  const handleOptimizeOrderRoute = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      if (!target || target.stops.length <= 1) return;
      const result = optimizeStopOrder(pickup.coordinates, target.stops);
      if (!result.changed) {
        toast.info(tBooking('routeAlreadyOptimalBanner'));
        return;
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, stops: result.optimizedStops } : o,
        ),
      );
      toast.success(
        tBooking('routeOptimizedBanner', { km: result.savedKm.toFixed(1) }),
      );
    },
    [orders, pickup.coordinates, tBooking],
  );

  const executeBatchSubmit = useCallback(
    async (batchToSubmit: BulkOrderDraft[]) => {
      setIsSubmitting(true);
      setSubmitProgress({ completed: 0, total: batchToSubmit.length });
      try {
        const availability = await checkAvailability(selectedPayment);
        if (availability && !availability.isAvailable) {
          toast.error(
            availability.unavailableReason ||
              'Selected payment method is currently unavailable.',
          );
          return;
        }

        const results = await submitBulkOrderBatch({
          pickup,
          orders: batchToSubmit,
          deliveryOption,
          deliverySchedule,
          paymentMethod: selectedPayment,
          paymentCardId:
            isCardPaymentProvider(selectedPayment) &&
            paymentCardsState.selectedCardId
              ? paymentCardsState.selectedCardId
              : undefined,
          promoCode: appliedPromo?.code,
          discountAmount,
          tipAmount,
          locale,
          onProgress: (completed, total) => setSubmitProgress({ completed, total }),
        });
        setSubmissionResults(results);
        await queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

        const successCount = results.filter((r) => r.status === 'success').length;
        if (successCount === results.length) {
          clearBulkOrdersDraft();
          toast.success(tBooking('bulkSubmitSuccessToast', { count: successCount }));
        } else {
          toast.warning(
            tBooking('bulkSubmitPartialToast', {
              success: successCount,
              total: results.length,
            }),
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      checkAvailability,
      pickup,
      deliveryOption,
      deliverySchedule,
      selectedPayment,
      paymentCardsState.selectedCardId,
      appliedPromo,
      discountAmount,
      tipAmount,
      locale,
      queryClient,
      tBooking,
    ],
  );

  const handleSubmitBatch = useCallback(() => {
    setHasAttemptedSubmit(true);
    if (orders.length === 0) {
      toast.error(tBooking('bulkEmptyOrdersError'));
      return;
    }
    if (validation.hasErrors) {
      toast.error(tBooking('bulkValidationError'));
      return;
    }
    const operationError = validateDeliveryAvailability(
      deliveryOption,
      deliverySchedule,
    );
    if (operationError) {
      toast.error(operationError);
      return;
    }
    if (!isAuthenticated) {
      openAuthModal(() => {
        void executeBatchSubmit(orders);
      });
      return;
    }
    void executeBatchSubmit(orders);
  }, [
    orders,
    validation.hasErrors,
    deliveryOption,
    deliverySchedule,
    isAuthenticated,
    openAuthModal,
    executeBatchSubmit,
    tBooking,
  ]);

  const handleRetryFailed = useCallback(() => {
    if (!submissionResults) return;
    const failedDrafts = submissionResults
      .filter((r) => r.status === 'failed')
      .map((r) => r.draft);
    if (failedDrafts.length === 0) return;
    void executeBatchSubmit(failedDrafts);
  }, [submissionResults, executeBatchSubmit]);

  const handleStartNewBatch = useCallback(() => {
    setOrders([]);
    setAppliedPromo(null);
    setTipAmount(0);
    setHasAttemptedSubmit(false);
    setSubmissionResults(null);
  }, []);

  return {
    pickup,
    onChangePickup,
    deliveryOption,
    onChangeDeliveryOption,
    deliverySchedule,
    onChangeDeliverySchedule,
    orders,
    isAuthenticated,
    openAuthModal,
    selectedPayment,
    setSelectedPayment,
    appliedPromo,
    discountAmount,
    tipAmount,
    finalPayableFee,
    handleApplyPromo,
    handleRemovePromo,
    setTipAmount,
    paymentOptions,
    isLoadingOptions,
    paymentCardsState,
    handleAddCard,
    batchSummary,
    validation,
    hasAttemptedSubmit,
    isSubmitting,
    submitProgress,
    submissionResults,
    handleImportOrders,
    handleLoadSample,
    handleDirectFileUpload,
    handleAddOrder,
    handleRemoveOrder,
    handleClearOrders,
    handleAddStop,
    handleUpdateStop,
    handleRemoveStop,
    handleOptimizeOrderRoute,
    handleSubmitBatch,
    handleRetryFailed,
    handleStartNewBatch,
  };
}
