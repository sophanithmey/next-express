import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  inMemoryStore,
} from '@/server/repositories/in-memory-store';

describe('Pricing and Distance Engine', () => {
  it('calculates Haversine distance between two coordinates', () => {
    // Distance between Central Phnom Penh and Por Senchey ~ 7-10 km
    const c1 = { lat: 11.5564, lng: 104.9282 };
    const c2 = { lat: 11.545, lng: 104.862 };

    const distance = calculateHaversineDistance(c1, c2);
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(15);
  });

  it('calculates base fee and distance surcharge correctly', () => {
    const c1 = { lat: 11.5564, lng: 104.9282 };
    const c2 = { lat: 11.56, lng: 104.93 }; // Very close ~ 0.5km

    const fee = inMemoryStore.calculateFee(c1, c2);
    expect(fee.baseFee).toBe(1.25);
    expect(fee.totalDeliveryFee).toBeGreaterThanOrEqual(1.25);
  });
});
