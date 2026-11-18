import { describe, it, expect } from 'vitest';
import { BookingOrder } from '@/features/booking/types/booking-types';

function partitionOrdersBy5Stages(orders: BookingOrder[]) {
  const pending: BookingOrder[] = [];
  const accepted: BookingOrder[] = [];
  const inTransit: BookingOrder[] = [];
  const fulfilled: BookingOrder[] = [];
  const cancelled: BookingOrder[] = [];

  for (const order of orders) {
    if (order.status === 'draft' || order.status === 'pending' || order.status === 'confirmed') {
      pending.push(order);
    } else if (order.status === 'assigned') {
      accepted.push(order);
    } else if (order.status === 'out_for_delivery') {
      inTransit.push(order);
    } else if (order.status === 'delivered') {
      fulfilled.push(order);
    } else if (order.status === 'cancelled') {
      cancelled.push(order);
    }
  }

  return { pending, accepted, inTransit, fulfilled, cancelled };
}

function getInitials(name?: string, fallback = 'WN'): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

describe('Booking 4-Stage Operational Lifecycle', () => {
  const dummyCoord = { lat: 11.55, lng: 104.92 };
  const sampleOrders: BookingOrder[] = [
    {
      id: 'ord-1',
      trackingNumber: 'EXP-1001',
      trackingUrl: 'https://example.com/EXP-1001',
      status: 'pending',
      pickup: { id: 'p1', name: 'Hub', address: 'St 271', coordinates: dummyCoord },
      dropoff: { address: 'St 2004', coordinates: dummyCoord },
      recipient: { name: 'Sokha Chan', phoneNumber: '012998877' },
      parcel: { description: 'Cosmetics', quantity: 1 },
      cod: { isCod: true, amount: 25 },
      deliveryFee: 1.75,
      totalSellerCharge: 1.75,
      createdAt: '2026-11-16T08:00:00Z',
      updatedAt: '2026-11-16T08:00:00Z',
    },
    {
      id: 'ord-2',
      trackingNumber: 'EXP-1002',
      trackingUrl: 'https://example.com/EXP-1002',
      status: 'assigned',
      pickup: { id: 'p1', name: 'Hub', address: 'St 271', coordinates: dummyCoord },
      dropoff: { address: 'Toul Kork', coordinates: dummyCoord },
      recipient: { name: 'Dara Vong', phoneNumber: '098112233' },
      parcel: { description: 'Electronics', quantity: 1 },
      cod: { isCod: false, amount: 0 },
      deliveryFee: 2.5,
      totalSellerCharge: 2.5,
      createdAt: '2026-11-16T08:30:00Z',
      updatedAt: '2026-11-16T08:30:00Z',
    },
    {
      id: 'ord-3',
      trackingNumber: 'EXP-1003',
      trackingUrl: 'https://example.com/EXP-1003',
      status: 'out_for_delivery',
      pickup: { id: 'p1', name: 'Hub', address: 'St 271', coordinates: dummyCoord },
      dropoff: { address: 'BKK1', coordinates: dummyCoord },
      recipient: { name: 'Chanthy Keo', phoneNumber: '077554433' },
      parcel: { description: 'Clothes', quantity: 2 },
      cod: { isCod: true, amount: 15 },
      deliveryFee: 1.75,
      totalSellerCharge: 1.75,
      createdAt: '2026-11-16T09:00:00Z',
      updatedAt: '2026-11-16T09:00:00Z',
    },
    {
      id: 'ord-4',
      trackingNumber: 'EXP-1004',
      trackingUrl: 'https://example.com/EXP-1004',
      status: 'delivered',
      pickup: { id: 'p1', name: 'Hub', address: 'St 271', coordinates: dummyCoord },
      dropoff: { address: 'Sen Sok', coordinates: dummyCoord },
      recipient: { name: 'Bopha Meas', phoneNumber: '010223344' },
      parcel: { description: 'Documents', quantity: 1 },
      cod: { isCod: false, amount: 0 },
      deliveryFee: 1.25,
      totalSellerCharge: 1.25,
      createdAt: '2026-11-16T09:30:00Z',
      updatedAt: '2026-11-16T09:30:00Z',
    },
    {
      id: 'ord-5',
      trackingNumber: 'EXP-1005',
      trackingUrl: 'https://example.com/EXP-1005',
      status: 'cancelled',
      pickup: { id: 'p1', name: 'Hub', address: 'St 271', coordinates: dummyCoord },
      dropoff: { address: 'Chbar Ampov', coordinates: dummyCoord },
      recipient: { name: 'Vanna Ly', phoneNumber: '012445566' },
      parcel: { description: 'Shoes', quantity: 1 },
      cod: { isCod: true, amount: 30 },
      deliveryFee: 1.75,
      totalSellerCharge: 1.75,
      createdAt: '2026-11-16T10:00:00Z',
      updatedAt: '2026-11-16T10:00:00Z',
    },
  ];

  it('partitions orders into 5 operational stages including Cancelled next to Fulfilled', () => {
    const partitioned = partitionOrdersBy5Stages(sampleOrders);
    expect(partitioned.pending).toHaveLength(1);
    expect(partitioned.pending[0].id).toBe('ord-1');
    expect(partitioned.accepted).toHaveLength(1);
    expect(partitioned.accepted[0].id).toBe('ord-2');
    expect(partitioned.inTransit).toHaveLength(1);
    expect(partitioned.inTransit[0].id).toBe('ord-3');
    expect(partitioned.fulfilled).toHaveLength(1);
    expect(partitioned.fulfilled[0].id).toBe('ord-4');
    expect(partitioned.cancelled).toHaveLength(1);
    expect(partitioned.cancelled[0].id).toBe('ord-5');
  });

  it('correctly computes initials for user avatars', () => {
    expect(getInitials('Sokha Chan')).toBe('SC');
    expect(getInitials('Dara')).toBe('DA');
    expect(getInitials('Chan Thida Doeun')).toBe('CT');
    expect(getInitials('')).toBe('WN');
    expect(getInitials(undefined)).toBe('WN');
  });
});
