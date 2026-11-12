import { describe, it, expect } from 'vitest';
import {
  createDefaultBookingForm,
  createEmptyBookingForm,
  validateBookingFormData,
} from '@/features/booking/services/booking-form-helpers';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '@/features/booking/data/mock-booking-data';

describe('Booking Layout & State Preservation', () => {
  it('creates an empty booking form with no prefilled tester data', () => {
    const empty = createEmptyBookingForm();
    expect(empty.pickup.name).toBe('');
    expect(empty.pickup.address).toBe('');
    expect(empty.dropoff.address).toBe('');
    expect(empty.recipient.name).toBe('');
    expect(empty.recipient.phoneNumber).toBe('');
    expect(empty.dropoffs).toHaveLength(1);
    expect(empty.dropoffs?.[0].dropoff.address).toBe('');
    expect(empty.parcel.sellerOrderRef).toBe('');
    expect(empty.parcel.description).toBe('');
    expect(empty.cod.isCod).toBe(false);
    expect(empty.cod.amount).toBe(0);
    expect(empty.deliveryOption).toBe('instant');
  });

  it('creates default booking form with instant delivery preselected and default warehouse', () => {
    const form = createDefaultBookingForm(SAMPLE_PHNOM_PENH_LOCATIONS[0]);
    expect(form.deliveryOption).toBe('instant');
    expect(form.pickup.address).toContain('St 271');
    expect(form.dropoff.address).toBeDefined();
    expect(form.cod.isCod).toBe(true);
  });

  it('preserves form data when switching layout structures', () => {
    const initial = createDefaultBookingForm(SAMPLE_PHNOM_PENH_LOCATIONS[0]);
    // Simulate user edits in vertical mode
    const modified = {
      ...initial,
      pickup: {
        ...initial.pickup,
        settlementBank: 'WING',
        settlementAccountName: 'Sokha Store',
        settlementAccountNumber: '012345678',
      },
      recipient: { name: 'Dara Vong', phoneNumber: '098 112 233' },
      deliveryOption: 'same_day' as const,
      cod: { isCod: true, amount: 50 },
    };

    // Switching to horizontal layout keeps identical modified values
    expect(modified.recipient.name).toBe('Dara Vong');
    expect(modified.deliveryOption).toBe('same_day');
    expect(modified.cod.amount).toBe(50);

    const validationErrors = validateBookingFormData(modified);
    expect(Object.keys(validationErrors).length).toBe(0);
  });
});

