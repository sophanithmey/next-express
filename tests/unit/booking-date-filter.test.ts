import { describe, it, expect } from 'vitest';
import {
  isOrderInDatePreset,
  parseOrderDate,
  createMockOrderDate,
  getTodayDateKey,
  DATE_PRESET_OPTIONS,
} from '@/features/booking/services/booking-date-filter';
import { syncOrdersToCurrentDate, createMockBookingDetails } from '@/features/booking/data/mock-booking-detail-data';
import { BookingOrder } from '@/features/booking/types/booking-types';

describe('Booking Date Filter Service', () => {
  const fixedNow = new Date('2026-11-16T15:00:00.000Z');

  it('correctly parses ISO strings and formatted date strings', () => {
    const d1 = parseOrderDate('2026-11-16T10:00:00.000Z');
    expect(d1).not.toBeNull();
    expect(d1?.getFullYear()).toBe(2026);

    const d2 = parseOrderDate('Nov 16, 2026 • 09:30 AM');
    expect(d2).not.toBeNull();
    expect(d2?.getMonth()).toBe(10); // Nov is 10

    const invalid = parseOrderDate('');
    expect(invalid).toBeNull();
  });

  it('generates standardized YYYY-MM-DD date key', () => {
    expect(getTodayDateKey(fixedNow)).toBe('2026-11-16');
  });

  it('identifies today preset accurately', () => {
    const todayOrder = 'Nov 16, 2026 • 08:30 AM';
    const yesterdayOrder = 'Nov 15, 2026 • 08:30 AM';

    expect(isOrderInDatePreset(todayOrder, 'today', fixedNow)).toBe(true);
    expect(isOrderInDatePreset(yesterdayOrder, 'today', fixedNow)).toBe(false);
  });

  it('identifies yesterday preset accurately', () => {
    const yesterdayOrder = 'Nov 15, 2026 • 08:30 AM';
    const todayOrder = 'Nov 16, 2026 • 08:30 AM';

    expect(isOrderInDatePreset(yesterdayOrder, 'yesterday', fixedNow)).toBe(true);
    expect(isOrderInDatePreset(todayOrder, 'yesterday', fixedNow)).toBe(false);
  });

  it('identifies this_month preset accurately', () => {
    const orderNov1 = 'Nov 1, 2026 • 08:30 AM';
    const orderNov16 = 'Nov 16, 2026 • 08:30 AM';
    const orderOct30 = 'Oct 30, 2026 • 08:30 AM';

    expect(isOrderInDatePreset(orderNov1, 'this_month', fixedNow)).toBe(true);
    expect(isOrderInDatePreset(orderNov16, 'this_month', fixedNow)).toBe(true);
    expect(isOrderInDatePreset(orderOct30, 'this_month', fixedNow)).toBe(false);
  });

  it('identifies last_month preset accurately', () => {
    const orderOct15 = 'Oct 15, 2026 • 08:30 AM';
    const orderNov1 = 'Nov 1, 2026 • 08:30 AM';

    expect(isOrderInDatePreset(orderOct15, 'last_month', fixedNow)).toBe(true);
    expect(isOrderInDatePreset(orderNov1, 'last_month', fixedNow)).toBe(false);
  });

  it('allows all orders when preset is all', () => {
    expect(isOrderInDatePreset('Oct 15, 2025 • 08:30 AM', 'all', fixedNow)).toBe(true);
  });

  it('has today as the first default option in DATE_PRESET_OPTIONS', () => {
    expect(DATE_PRESET_OPTIONS[0].id).toBe('today');
  });

  it('generates consistent mock dates with string presets and numeric offsets', () => {
    const todayStr = createMockOrderDate('today', '10:00 AM', fixedNow);
    expect(todayStr).toContain('Nov 16, 2026');

    const yesterdayStr = createMockOrderDate('yesterday', '10:00 AM', fixedNow);
    expect(yesterdayStr).toContain('Nov 15, 2026');

    const thisMonthStr = createMockOrderDate('this_month', '10:00 AM', fixedNow);
    expect(thisMonthStr).toContain('Nov');
    expect(thisMonthStr).toContain('2026');

    const lastMonthStr = createMockOrderDate('last_month', '10:00 AM', fixedNow);
    expect(lastMonthStr).toContain('Oct 15, 2026');

    const numericOffset = createMockOrderDate(-2, '10:00 AM', fixedNow);
    expect(numericOffset).toContain('Nov 14, 2026');
  });

  it('syncOrdersToCurrentDate rolls forward mock orders to current day and keeps custom user orders intact', () => {
    const staleOrders: BookingOrder[] = [
      {
        ...createMockBookingDetails(new Date('2026-11-06T00:00:00Z'))['ord-1001'],
        createdAt: 'Nov 6, 2026 • 08:30 AM',
      },
      {
        id: 'ord-custom-seller-999',
        trackingNumber: 'EXP-99999999',
        trackingUrl: 'https://tracking.express.wingbank.com/EXP-99999999',
        status: 'pending',
        pickup: { name: 'Warehouse', address: 'St 271', coordinates: { lat: 11.5, lng: 104.9 } },
        dropoff: { address: 'St 2004', coordinates: { lat: 11.54, lng: 104.86 } },
        recipient: { name: 'Custom Buyer', phoneNumber: '012345678' },
        parcel: { description: 'Custom parcel', quantity: 1 },
        cod: { isCod: false, amount: 0 },
        deliveryFee: 1.5,
        totalSellerCharge: 1.5,
        createdAt: 'Nov 1, 2026 • 02:00 PM',
        updatedAt: 'Nov 1, 2026 • 02:00 PM',
      },
    ];

    const synced = syncOrdersToCurrentDate(staleOrders, fixedNow);
    const ord1001 = synced.find((o) => o.id === 'ord-1001');
    const customOrder = synced.find((o) => o.id === 'ord-custom-seller-999');

    expect(ord1001?.createdAt).toContain('Nov 16, 2026');
    expect(customOrder?.createdAt).toBe('Nov 1, 2026 • 02:00 PM');
  });
});
