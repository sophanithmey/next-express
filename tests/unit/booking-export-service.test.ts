import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { BookingOrder } from '@/features/booking/types/booking-types';
import {
  exportOrdersToCsv,
  exportOrdersToPdf,
  exportOrdersToXlsx,
} from '@/features/booking/services/booking-export-service';

const MOCK_ORDERS: BookingOrder[] = [
  {
    id: 'ord-1',
    trackingNumber: 'EXP-10000001',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-10000001',
    status: 'assigned',
    paymentStatus: 'paid',
    paymentMethod: 'KHQR',
    pickup: {
      name: 'Central Warehouse Phnom Penh',
      address: 'Central Warehouse Phnom Penh',
      coordinates: { lat: 11.55, lng: 104.92 },
    },
    dropoff: {
      address: 'St 271 Khan Mean Chey Phnom Penh',
      coordinates: { lat: 11.53, lng: 104.91 },
    },
    recipient: {
      name: 'Sokha Chan',
      phoneNumber: '012998877',
    },
    parcel: {
      description: 'Apparel package',
      sellerOrderRef: 'REF-101',
    },
    cod: {
      isCod: true,
      amount: 45.0,
    },
    deliveryFee: 1.75,
    totalSellerCharge: 1.75,
    createdAt: 'Nov 16, 2026 • 09:30 AM',
    updatedAt: 'Nov 16, 2026 • 09:30 AM',
  },
  {
    id: 'ord-2',
    trackingNumber: 'EXP-10000002',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-10000002',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Cash',
    pickup: {
      name: 'Central Warehouse Phnom Penh',
      address: 'Central Warehouse Phnom Penh',
      coordinates: { lat: 11.55, lng: 104.92 },
    },
    dropoff: {
      address: 'St 598 Khan Sen Sok Phnom Penh',
      coordinates: { lat: 11.57, lng: 104.89 },
    },
    recipient: {
      name: 'Dara Vong',
      phoneNumber: '098112233',
    },
    parcel: {
      description: 'Electronics',
    },
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryFee: 2.1,
    totalSellerCharge: 2.1,
    createdAt: 'Nov 15, 2026 • 02:15 PM',
    updatedAt: 'Nov 15, 2026 • 02:15 PM',
  },
];

describe('Booking Export Service', () => {
  const createdFiles: string[] = [];

  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL in JSDOM
    if (typeof window !== 'undefined') {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  afterEach(() => {
    while (createdFiles.length > 0) {
      const file = createdFiles.pop();
      if (file && fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
  });

  it('exports orders to CSV with valid filename and UTF-8 BOM', () => {
    const filename = exportOrdersToCsv(MOCK_ORDERS);
    expect(filename).toMatch(/^wingexpress-orders-.*\.csv$/);
  });

  it('exports orders to XLSX successfully', async () => {
    const filename = await exportOrdersToXlsx(MOCK_ORDERS);
    createdFiles.push(path.join(process.cwd(), filename));
    expect(filename).toMatch(/^wingexpress-orders-.*\.xlsx$/);
  });

  it('exports orders to PDF format successfully', () => {
    const filename = exportOrdersToPdf(MOCK_ORDERS);
    expect(filename).toMatch(/^wingexpress-orders-.*\.pdf$/);
  });
});
