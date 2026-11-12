import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localDemoBookingStore } from '@/features/booking/services/local-demo-store';
import { localDemoLocationStore } from '@/features/booking/services/local-demo-location-store';
import { localDemoPaymentStore } from '@/features/payment/services/local-demo-payment-store';

describe('Local Demo Storage Adapter', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }

    const storageMock = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        for (const key of Object.keys(mockStorage)) {
          delete mockStorage[key];
        }
      },
      length: 0,
      key: () => null,
    };

    (globalThis as unknown as { window: unknown }).window = globalThis;
    (globalThis as unknown as { localStorage: unknown }).localStorage = storageMock;
    (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = storageMock;
  });

  it('creates, retrieves, searches, and cancels multi-drop orders in browser storage', () => {
    const created = localDemoBookingStore.createOrder({
      pickup: {
        name: 'My Shop',
        address: 'St 271, Phnom Penh',
        coordinates: { lat: 11.53, lng: 104.91 },
      },
      dropoff: {
        address: 'St 310, BKK1, Phnom Penh',
        coordinates: { lat: 11.55, lng: 104.92 },
      },
      dropoffs: [
        {
          id: 'stop-1',
          recipient: { name: 'Buyer One', phoneNumber: '012345678' },
          dropoff: {
            address: 'St 310, BKK1, Phnom Penh',
            coordinates: { lat: 11.55, lng: 104.92 },
          },
          codAmount: 15,
        },
        {
          id: 'stop-2',
          recipient: { name: 'Buyer Two', phoneNumber: '098765432' },
          dropoff: {
            address: 'Toul Kork, Phnom Penh',
            coordinates: { lat: 11.57, lng: 104.89 },
          },
          codAmount: 0,
        },
      ],
      recipient: { name: 'Buyer One', phoneNumber: '012345678' },
      parcel: { sellerOrderRef: 'DEMO-888' },
      cod: { isCod: true, amount: 15 },
      paymentMethod: 'khqr',
      trackingNumber: 'EXP-99990001',
    });

    expect(created.trackingNumber).toBe('EXP-99990001');
    expect(created.dropoffs).toHaveLength(2);
    expect(localDemoBookingStore.getOrderById('EXP-99990001')?.id).toBe(created.id);

    const searchRes = localDemoBookingStore.listOrders({ search: 'Toul Kork' });
    expect(searchRes.items.some((o) => o.id === created.id)).toBe(true);

    const cancelled = localDemoBookingStore.cancelOrder(created.id, 'Tester cancelled');
    expect(cancelled?.status).toBe('cancelled');
    expect(cancelled?.paymentStatus).toBe('refunded');
  });

  it('persists custom locations and payment cards locally and resets cleanly', () => {
    const addedLoc = localDemoLocationStore.createLocation({
      name: 'Tester Branch',
      address: 'Russian Blvd, Phnom Penh',
      coordinates: { lat: 11.56, lng: 104.88 },
    });
    expect(localDemoLocationStore.listLocations().some((l) => l.id === addedLoc.id)).toBe(true);

    const cardRes = localDemoPaymentStore.createCard();
    expect(cardRes.card?.id).toBeTruthy();
    expect(localDemoPaymentStore.listCards().some((c) => c.id === cardRes.card?.id)).toBe(true);

    localDemoBookingStore.resetAllDemoData();
    expect(localDemoLocationStore.listLocations().some((l) => l.id === addedLoc.id)).toBe(false);
    expect(localDemoPaymentStore.listCards().some((c) => c.id === cardRes.card?.id)).toBe(false);
  });

  it('gracefully strips large images if localStorage hits quota limits', () => {
    let failFirstWrite = true;
    const baseSetItem = globalThis.localStorage.setItem;
    vi.spyOn(globalThis.localStorage, 'setItem').mockImplementation((k, v) => {
      if (k === 'wingexpress_demo_v1_orders' && failFirstWrite && v.includes('data:image/')) {
        failFirstWrite = false;
        throw new Error('QuotaExceededError');
      }
      return baseSetItem(k, v);
    });

    const created = localDemoBookingStore.createOrder({
      pickup: {
        name: 'Quota Pickup',
        address: 'St 271, Phnom Penh',
        coordinates: { lat: 11.53, lng: 104.91 },
        imageUrl: 'data:image/png;base64,HUGEIMAGE',
      },
      dropoff: {
        address: 'St 310, Phnom Penh',
        coordinates: { lat: 11.55, lng: 104.92 },
      },
      recipient: { name: '', phoneNumber: '012345678' },
      parcel: { sellerOrderRef: 'QUOTA-1' },
      cod: { isCod: false, amount: 0 },
    });

    const reloaded = localDemoBookingStore.getOrderById(created.id);
    expect(reloaded?.id).toBe(created.id);
    expect(reloaded?.pickup.imageUrl).toBeUndefined();
  });
});
