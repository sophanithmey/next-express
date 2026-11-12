import { describe, it, expect } from 'vitest';
import {
  buildTrackingSharePayload,
  scopeOrderToStop,
} from '@/features/booking/services/tracking-share-helper';
import { BookingOrder } from '@/features/booking/types/booking-types';

const multiStopOrder: BookingOrder = {
  id: 'ord-multi-1',
  trackingNumber: 'EXP-57675198',
  trackingUrl: 'https://tracking.express.wingbank.com/EXP-57675198',
  status: 'out_for_delivery',
  pickup: {
    name: 'Central Warehouse (Main)',
    address: 'St 271, Phnom Penh',
    coordinates: { lat: 11.5321, lng: 104.9123 },
  },
  dropoff: {
    address: 'St 310, BKK1, Phnom Penh',
    coordinates: { lat: 11.5512, lng: 104.9256 },
  },
  recipient: {
    name: 'Sokha Chan',
    phoneNumber: '012 998 877',
  },
  dropoffs: [
    {
      id: 'stop-1',
      recipient: { name: 'Sokha Chan', phoneNumber: '012 998 877' },
      dropoff: { address: 'St 310, BKK1, Phnom Penh', coordinates: { lat: 11.5512, lng: 104.9256 } },
      codAmount: 15,
    },
    {
      id: 'stop-2',
      recipient: { name: 'Dara Kim', phoneNumber: '077 445 566' },
      dropoff: { address: 'St 2004, Sen Sok, Phnom Penh', coordinates: { lat: 11.561, lng: 104.889 } },
      codAmount: 22,
    },
    {
      id: 'stop-3',
      recipient: { name: 'Vanna Ly', phoneNumber: '096 112 233' },
      dropoff: { address: 'Toul Kork, Phnom Penh', coordinates: { lat: 11.572, lng: 104.899 } },
      codAmount: 0,
    },
  ],
  parcel: { sellerOrderRef: 'LIVE-001' },
  cod: { isCod: true, amount: 37 },
  deliveryFee: 3.25,
  totalSellerCharge: 3.25,
  createdAt: '2026-11-12T07:00:00Z',
  updatedAt: '2026-11-12T07:00:00Z',
};

describe('tracking-share-helper', () => {
  it('appends ?stop= when stopId is provided to buildTrackingSharePayload', () => {
    const payload = buildTrackingSharePayload({
      tracking: 'EXP-57675198',
      locale: 'en',
      origin: 'https://express.wing.com',
      recipient: 'Dara Kim',
      dropoff: 'St 2004, Sen Sok, Phnom Penh',
      codAmount: 22,
      stopId: 'stop-2',
    });

    expect(payload.trackingPath).toBe('/track/EXP-57675198?stop=stop-2');
    expect(payload.fullTrackingUrl).toBe('https://express.wing.com/en/track/EXP-57675198?stop=stop-2');
    expect(payload.buyerMessage).toContain('Dara Kim');
    expect(payload.buyerMessage).toContain('COD Due on Arrival: $22.00');
    expect(payload.buyerMessage).not.toContain('Sokha Chan');
  });

  it('scopes BookingOrder strictly to the requested customer stop and hides sibling stops', () => {
    const scoped = scopeOrderToStop(multiStopOrder, 'stop-2');

    expect(scoped.dropoffs).toHaveLength(1);
    expect(scoped.recipient.name).toBe('Dara Kim');
    expect(scoped.dropoff.address).toBe('St 2004, Sen Sok, Phnom Penh');
    expect(scoped.cod).toEqual({ isCod: true, amount: 22 });
  });

  it('marks COD false and $0 when the scoped stop has no COD even on a COD batch', () => {
    const scoped = scopeOrderToStop(multiStopOrder, 'stop-3');

    expect(scoped.dropoffs).toHaveLength(1);
    expect(scoped.recipient.name).toBe('Vanna Ly');
    expect(scoped.cod).toEqual({ isCod: false, amount: 0 });
  });

  it('falls back safely to the first stop without exposing sibling stops when stopId is unknown', () => {
    const scoped = scopeOrderToStop(multiStopOrder, 'non-existent-stop');

    expect(scoped.dropoffs).toHaveLength(1);
    expect(scoped.recipient.name).toBe('Sokha Chan');
  });

  it('leaves order unchanged when stopId is omitted', () => {
    const unscoped = scopeOrderToStop(multiStopOrder);
    expect(unscoped.dropoffs).toHaveLength(3);
    expect(unscoped.cod.amount).toBe(37);
  });
});

