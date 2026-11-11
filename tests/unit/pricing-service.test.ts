import { describe, it, expect } from 'vitest';
import {
  calculateBookingFeeQuote,
  getSpeedOptionFees,
} from '@/features/booking/services/pricing-service';
import { inMemoryStore } from '@/server/repositories/in-memory-store';

describe('Unified Pricing & Speed Option Parity', () => {
  const pickup = { lat: 11.5321, lng: 104.9123 };
  const dropoff = { lat: 11.5512, lng: 104.9256 };

  it('computes identical quotes across client helper and server inMemoryStore', () => {
    const clientQuote = calculateBookingFeeQuote({
      pickupCoords: pickup,
      dropoffCoords: dropoff,
      additionalStopsCount: 2,
      deliverySpeed: 'same_day',
    });

    const serverQuote = inMemoryStore.calculateFee(pickup, dropoff, {
      additionalStopsCount: 2,
      deliveryOption: 'same_day',
    });

    expect(serverQuote.totalDeliveryFee).toBe(clientQuote.totalDeliveryFee);
    expect(serverQuote.baseFee).toBe(1.25);
    expect(serverQuote.deliverySpeed).toBe('same_day');
  });

  it('derives consistent speed card fees regardless of active speed option', () => {
    const instantQuote = calculateBookingFeeQuote({
      pickupCoords: pickup,
      dropoffCoords: dropoff,
      additionalStopsCount: 1,
      deliverySpeed: 'instant',
    });
    const sameDayQuote = calculateBookingFeeQuote({
      pickupCoords: pickup,
      dropoffCoords: dropoff,
      additionalStopsCount: 1,
      deliverySpeed: 'same_day',
    });
    const scheduledQuote = calculateBookingFeeQuote({
      pickupCoords: pickup,
      dropoffCoords: dropoff,
      additionalStopsCount: 1,
      deliverySpeed: 'scheduled',
    });

    const fromInstant = getSpeedOptionFees(instantQuote.totalDeliveryFee, 'instant');
    const fromSameDay = getSpeedOptionFees(sameDayQuote.totalDeliveryFee, 'same_day');
    const fromScheduled = getSpeedOptionFees(scheduledQuote.totalDeliveryFee, 'scheduled');

    expect(fromInstant).toEqual(fromSameDay);
    expect(fromSameDay).toEqual(fromScheduled);
    expect(fromScheduled.instantFee).toBe(instantQuote.totalDeliveryFee);
    expect(fromScheduled.sameDayFee).toBe(sameDayQuote.totalDeliveryFee);
    expect(fromScheduled.scheduledFee).toBe(scheduledQuote.totalDeliveryFee);
  });
});

