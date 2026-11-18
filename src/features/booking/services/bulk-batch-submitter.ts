import {
  BookingOrder,
  DeliverySchedule,
  DeliverySpeedOption,
  PickupLocation,
} from '../types/booking-types';
import { BulkOrderDraft } from './bulk-order-parser';
import {
  calculateMockFee,
  generateMockTracking,
} from '../data/mock-booking-data';
import { bookingApiService } from './booking-api-service';
import { calculateTotalStopCod } from './booking-form-helpers';
import { normalizePhoneNumber } from '@/lib/phone-number';

export interface BulkOrderFeeBreakdown {
  orderId: string;
  orderRef: string;
  stopsCount: number;
  fee: number;
  cod: number;
}

export interface BulkBatchSubmissionItem {
  draft: BulkOrderDraft;
  status: 'success' | 'failed';
  createdOrder?: BookingOrder;
  error?: string;
}

export function resolveEffectiveSpeed(
  deliveryOption: DeliverySpeedOption,
  deliverySchedule?: DeliverySchedule,
): DeliverySpeedOption {
  if (deliveryOption === 'scheduled' || deliveryOption === 'same_day') {
    return deliverySchedule?.date === 'today' ? 'same_day' : 'scheduled';
  }
  return 'instant';
}

/**
 * Calculates per-order fees and totals for a bulk batch.
 */
export function calculateBulkBatchFees(
  pickup: PickupLocation,
  orders: BulkOrderDraft[],
  deliveryOption: DeliverySpeedOption,
  deliverySchedule?: DeliverySchedule,
): {
  perOrder: Record<string, BulkOrderFeeBreakdown>;
  totalFee: number;
  totalCod: number;
  totalStops: number;
} {
  const effectiveSpeed = resolveEffectiveSpeed(deliveryOption, deliverySchedule);
  const perOrder: Record<string, BulkOrderFeeBreakdown> = {};
  let totalFee = 0;
  let totalCod = 0;
  let totalStops = 0;

  orders.forEach((order) => {
    const firstStop = order.stops[0];
    const additionalStops = Math.max(0, order.stops.length - 1);
    const quote = calculateMockFee(
      pickup.coordinates,
      firstStop?.dropoff.coordinates || pickup.coordinates,
      additionalStops,
      effectiveSpeed,
    );
    const cod = calculateTotalStopCod(order.stops);
    perOrder[order.id] = {
      orderId: order.id,
      orderRef: order.orderRef,
      stopsCount: order.stops.length,
      fee: quote.totalDeliveryFee,
      cod,
    };
    totalFee += quote.totalDeliveryFee;
    totalCod += cod;
    totalStops += order.stops.length;
  });

  return {
    perOrder,
    totalFee: Math.round(totalFee * 100) / 100,
    totalCod: Math.round(totalCod * 100) / 100,
    totalStops,
  };
}

/**
 * Computes the final payable delivery fee for a bulk batch after applying
 * voucher discount and optional rider tip. COD is never added to delivery fees.
 */
export function calculateBulkFinalPayableFee(
  subtotalFee: number,
  discountAmount: number,
  tipAmount: number,
): number {
  const safeSubtotal = Math.max(0, subtotalFee);
  const safeDiscount = Math.min(Math.max(0, discountAmount), safeSubtotal);
  const safeTip = Math.max(0, tipAmount);
  return Math.round((safeSubtotal - safeDiscount + safeTip) * 100) / 100;
}

/**
 * Allocates batch-level voucher discount and rider tip across individual orders
 * in exact cents so per-order fees remain non-negative and sum to finalPayableFee.
 */
export function allocateBulkAdjustments(
  orderFees: number[],
  totalDiscount: number,
  totalTip: number,
): Array<{ discount: number; tip: number; finalFee: number }> {
  const count = orderFees.length;
  if (count === 0) return [];

  const feeCents = orderFees.map((f) => Math.max(0, Math.round(f * 100)));
  const totalFeeCents = feeCents.reduce((sum, c) => sum + c, 0);
  const cappedDiscountCents = Math.min(
    Math.max(0, Math.round(totalDiscount * 100)),
    totalFeeCents,
  );
  const totalTipCents = Math.max(0, Math.round(totalTip * 100));

  const discountCents = new Array<number>(count).fill(0);
  if (cappedDiscountCents > 0 && totalFeeCents > 0) {
    let allocated = 0;
    for (let i = 0; i < count; i++) {
      const share = Math.min(
        feeCents[i],
        Math.floor((feeCents[i] * cappedDiscountCents) / totalFeeCents),
      );
      discountCents[i] = share;
      allocated += share;
    }
    let remainder = cappedDiscountCents - allocated;
    for (let i = 0; i < count && remainder > 0; i++) {
      const capacity = feeCents[i] - discountCents[i];
      if (capacity > 0) {
        const add = Math.min(capacity, remainder);
        discountCents[i] += add;
        remainder -= add;
      }
    }
  }

  const baseTipCents = Math.floor(totalTipCents / count);
  let tipRemainder = totalTipCents - baseTipCents * count;
  const tipCents = feeCents.map(() => {
    const extra = tipRemainder > 0 ? 1 : 0;
    if (tipRemainder > 0) tipRemainder -= 1;
    return baseTipCents + extra;
  });

  return feeCents.map((fee, idx) => {
    const finalCents = fee - discountCents[idx] + tipCents[idx];
    return {
      discount: discountCents[idx] / 100,
      tip: tipCents[idx] / 100,
      finalFee: finalCents / 100,
    };
  });
}

/**
 * Submits a batch of BulkOrderDraft items sequentially via bookingApiService.createBooking,
 * reporting progress after each order and returning per-order outcomes.
 */
export async function submitBulkOrderBatch(params: {
  pickup: PickupLocation;
  orders: BulkOrderDraft[];
  deliveryOption: DeliverySpeedOption;
  deliverySchedule?: DeliverySchedule;
  paymentMethod: string;
  paymentCardId?: string;
  promoCode?: string;
  discountAmount?: number;
  tipAmount?: number;
  locale: string;
  onProgress?: (completed: number, total: number) => void;
}): Promise<BulkBatchSubmissionItem[]> {
  const {
    pickup,
    orders,
    deliveryOption,
    deliverySchedule,
    paymentMethod,
    paymentCardId,
    promoCode,
    discountAmount = 0,
    tipAmount = 0,
    locale,
    onProgress,
  } = params;

  const { perOrder } = calculateBulkBatchFees(
    pickup,
    orders,
    deliveryOption,
    deliverySchedule,
  );

  const rawFees = orders.map((draft) => perOrder[draft.id]?.fee ?? 1.75);
  const adjustments = allocateBulkAdjustments(rawFees, discountAmount, tipAmount);

  const normalizedPickup: PickupLocation = {
    ...pickup,
    senderPhone: pickup.senderPhone
      ? normalizePhoneNumber(pickup.senderPhone)
      : pickup.senderPhone,
  };

  const results: BulkBatchSubmissionItem[] = [];

  for (let i = 0; i < orders.length; i++) {
    const draft = orders[i];
    const normalizedStops = draft.stops.map((stop) => ({
      ...stop,
      recipient: {
        ...stop.recipient,
        phoneNumber: normalizePhoneNumber(stop.recipient.phoneNumber),
      },
    }));
    const firstStop = normalizedStops[0];
    const orderCod = calculateTotalStopCod(normalizedStops);
    const adjustment = adjustments[i];

    try {
      const createdOrder = await bookingApiService.createBooking(
        {
          pickup: normalizedPickup,
          dropoff: firstStop.dropoff,
          dropoffs: normalizedStops,
          recipient: firstStop.recipient,
          deliveryOption,
          parcel: {
            sellerOrderRef: draft.orderRef,
            description: draft.parcelDescription || 'Bulk Express Parcel',
            quantity: normalizedStops.length,
          },
          cod: {
            isCod: orderCod > 0,
            amount: orderCod,
          },
          paymentMethod,
          paymentCardId,
          promoCode: promoCode || undefined,
          discountAmount: adjustment.discount > 0 ? adjustment.discount : undefined,
          tipAmount: adjustment.tip > 0 ? adjustment.tip : undefined,
          finalFee: adjustment.finalFee,
          trackingNumber: generateMockTracking(),
        } as Parameters<typeof bookingApiService.createBooking>[0],
        {
          locale,
          idempotencyKey: `bulk-${draft.id}-${Date.now()}`,
        },
      );
      results.push({ draft, status: 'success', createdOrder });
    } catch (err: unknown) {
      results.push({
        draft,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Failed to create order',
      });
    }

    onProgress?.(i + 1, orders.length);
  }

  return results;
}
