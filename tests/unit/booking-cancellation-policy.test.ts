import { describe, it, expect } from 'vitest';
import {
  getCancellationEligibility,
  canSenderCancelOrder,
  requiresHotlineCancellation,
  getHotlineCancellationErrorMessage,
} from '@/features/booking/services/booking-cancellation-policy';
import { APP_CONFIG } from '@/lib/constants';

describe('Order Cancellation Policy', () => {
  it('allows sender to cancel directly before a rider is assigned', () => {
    expect(getCancellationEligibility({ status: 'draft' })).toBe('can_cancel');
    expect(getCancellationEligibility({ status: 'pending' })).toBe('can_cancel');
    expect(getCancellationEligibility({ status: 'confirmed' })).toBe('can_cancel');
    expect(canSenderCancelOrder({ status: 'pending' })).toBe(true);
    expect(requiresHotlineCancellation({ status: 'pending' })).toBe(false);
  });

  it('requires contacting the hotline once a rider is assigned or order is in transit', () => {
    expect(getCancellationEligibility({ status: 'assigned' })).toBe(
      'contact_hotline',
    );
    expect(getCancellationEligibility({ status: 'out_for_delivery' })).toBe(
      'contact_hotline',
    );
    expect(
      getCancellationEligibility({
        status: 'confirmed',
        deliverer: { name: 'Sokha Rith', phone: '012999888' },
      }),
    ).toBe('contact_hotline');

    expect(canSenderCancelOrder({ status: 'assigned' })).toBe(false);
    expect(requiresHotlineCancellation({ status: 'assigned' })).toBe(true);
    expect(getHotlineCancellationErrorMessage()).toContain(
      APP_CONFIG.supportPhone,
    );
  });

  it('marks delivered and already cancelled orders as not applicable', () => {
    expect(getCancellationEligibility({ status: 'delivered' })).toBe(
      'not_applicable',
    );
    expect(getCancellationEligibility({ status: 'cancelled' })).toBe(
      'not_applicable',
    );
    expect(canSenderCancelOrder({ status: 'delivered' })).toBe(false);
    expect(requiresHotlineCancellation({ status: 'delivered' })).toBe(false);
  });
});
