import { BookingOrder } from '../types/booking-types';
import { APP_CONFIG } from '@/lib/constants';

export type CancellationEligibility =
  | 'can_cancel'
  | 'contact_hotline'
  | 'not_applicable';

type CancellableOrderShape = Pick<BookingOrder, 'status'> & {
  deliverer?: BookingOrder['deliverer'];
};

/**
 * Single source of truth for sender cancellation rules:
 * - Before a rider is assigned (`draft`, `pending`, `confirmed` with no deliverer):
 *   sender can cancel directly.
 * - After a rider is assigned (`assigned`, `out_for_delivery`, or `deliverer` present):
 *   sender must contact the hotline to request cancellation.
 * - Terminal states (`delivered`, `cancelled`): cancellation is not applicable.
 */
export function getCancellationEligibility(
  order: CancellableOrderShape,
): CancellationEligibility {
  if (order.status === 'cancelled' || order.status === 'delivered') {
    return 'not_applicable';
  }

  const hasAssignedRider =
    order.status === 'assigned' ||
    order.status === 'out_for_delivery' ||
    Boolean(order.deliverer);

  if (hasAssignedRider) {
    return 'contact_hotline';
  }

  return 'can_cancel';
}

export function canSenderCancelOrder(order: CancellableOrderShape): boolean {
  return getCancellationEligibility(order) === 'can_cancel';
}

export function requiresHotlineCancellation(
  order: CancellableOrderShape,
): boolean {
  return getCancellationEligibility(order) === 'contact_hotline';
}

export function getHotlineCancellationErrorMessage(): string {
  return `A rider has already been assigned to this order. Please contact our hotline (${APP_CONFIG.supportPhone}) to request cancellation.`;
}
