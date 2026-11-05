import { describe, it, expect } from 'vitest';
import { inMemoryStore } from '@/server/repositories/in-memory-store';

describe('Express API Mock Adapter & In-Memory Store', () => {
  it('loads saved pickup locations', () => {
    const locations = inMemoryStore.getLocations();
    expect(locations.length).toBeGreaterThanOrEqual(1);
    expect(locations[0].name).toBeDefined();
    expect(locations[0].coordinates.lat).toBeDefined();
  });

  it('creates a new booking order with generated tracking number and tracking URL', () => {
    const newOrder = inMemoryStore.createBooking({
      pickup: {
        name: 'Warehouse A',
        address: 'Phnom Penh St 1',
        coordinates: { lat: 11.55, lng: 104.92 },
      },
      dropoff: {
        address: 'Phnom Penh St 2',
        coordinates: { lat: 11.56, lng: 104.93 },
      },
      recipient: {
        name: 'Chanthy Mao',
        phoneNumber: '012111222',
      },
      parcel: {
        description: 'Silk dress',
        quantity: 1,
      },
      cod: {
        isCod: true,
        amount: 25.0,
      },
      idempotencyKey: 'test-idem-key-1',
    });

    expect(newOrder.id).toBeDefined();
    expect(newOrder.trackingNumber).toMatch(/^EXP-\d+/);
    expect(newOrder.trackingUrl).toContain(newOrder.trackingNumber);
    expect(newOrder.status).toBe('pending');
    expect(newOrder.cod.amount).toBe(25.0);
  });

  it('filters orders by search term and status', () => {
    const result = inMemoryStore.getOrders({ search: 'Chan' });
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(
      result.items.some((o) => o.recipient.name.includes('Chan'))
    ).toBe(true);
  });
});

