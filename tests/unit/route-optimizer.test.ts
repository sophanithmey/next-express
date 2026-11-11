import { describe, it, expect } from 'vitest';
import { optimizeStopOrder } from '@/features/booking/services/route-optimizer';
import { DropoffStop } from '@/features/booking/types/booking-types';

describe('Multi-Stop Route Optimizer', () => {
  const pickup = { lat: 11.5321, lng: 104.9123 }; // Mean Chey (South)

  const outOfOrderStops: DropoffStop[] = [
    {
      id: 'stop-sen-sok',
      recipient: { name: 'Kosal', phoneNumber: '089998877' },
      dropoff: {
        address: 'Sen Sok, Phnom Penh',
        coordinates: { lat: 11.59, lng: 104.88 }, // Farthest North-West
      },
      codAmount: 32,
    },
    {
      id: 'stop-bkk1',
      recipient: { name: 'Sokha', phoneNumber: '012998877' },
      dropoff: {
        address: 'BKK1, Phnom Penh',
        coordinates: { lat: 11.5512, lng: 104.9256 }, // Nearest to pickup
      },
      codAmount: 25,
    },
    {
      id: 'stop-tk',
      recipient: { name: 'Dara', phoneNumber: '098112233' },
      dropoff: {
        address: 'Toul Kouk, Phnom Penh',
        coordinates: { lat: 11.5684, lng: 104.8964 }, // Midpoint between BKK1 and Sen Sok
      },
      codAmount: 18.5,
    },
  ];

  it('reorders out-of-order stops from nearest to farthest and reduces total distance', () => {
    const result = optimizeStopOrder(pickup, outOfOrderStops);

    expect(result.changed).toBe(true);
    expect(result.afterKm).toBeLessThan(result.beforeKm);
    expect(result.savedKm).toBeGreaterThan(0);
    expect(result.optimizedStops.map((s) => s.id)).toEqual([
      'stop-bkk1',
      'stop-tk',
      'stop-sen-sok',
    ]);
    // Verify per-stop COD metadata is preserved
    expect(result.optimizedStops.map((s) => s.codAmount)).toEqual([25, 18.5, 32]);
  });

  it('keeps order unchanged when stops are already optimal', () => {
    const firstPass = optimizeStopOrder(pickup, outOfOrderStops);
    const secondPass = optimizeStopOrder(pickup, firstPass.optimizedStops);

    expect(secondPass.changed).toBe(false);
    expect(secondPass.savedKm).toBe(0);
    expect(secondPass.optimizedStops.map((s) => s.id)).toEqual([
      'stop-bkk1',
      'stop-tk',
      'stop-sen-sok',
    ]);
  });
});

