import { describe, it, expect } from 'vitest';
import {
  seedPerStopCodOnExpand,
  syncCodWithDropoffs,
  validateDropoffStops,
} from '@/features/booking/services/booking-form-helpers';
import {
  convertParsedToDropoffStops,
  parseBulkDropoffText,
  SAMPLE_BULK_CSV,
} from '@/features/booking/services/bulk-dropoff-parser';
import { DropoffStop } from '@/features/booking/types/booking-types';

describe('Per-Stop COD Aggregation & CSV Parsing', () => {
  it('sums per-stop COD amounts independently of delivery fee', () => {
    const stops: DropoffStop[] = [
      {
        id: 'stop-1',
        recipient: { name: 'Sokha', phoneNumber: '012998877' },
        dropoff: { address: 'St 310, Phnom Penh', coordinates: { lat: 11.55, lng: 104.92 } },
        codAmount: 25,
      },
      {
        id: 'stop-2',
        recipient: { name: 'Dara', phoneNumber: '098112233' },
        dropoff: { address: 'St 63, Phnom Penh', coordinates: { lat: 11.56, lng: 104.93 } },
        codAmount: 18.5,
      },
    ];

    const synced = syncCodWithDropoffs(stops, { isCod: false, amount: 0 });
    expect(synced).toEqual({ isCod: true, amount: 43.5 });

    const cleared = syncCodWithDropoffs(
      stops.map((s) => ({ ...s, codAmount: 0 })),
      { isCod: true, amount: 43.5 }
    );
    expect(cleared).toEqual({ isCod: false, amount: 0 });
  });

  it('seeds Stop 1 COD when expanding single-stop order into multi-drop', () => {
    const singleStop: DropoffStop[] = [
      {
        id: 'stop-1',
        recipient: { name: 'Sokha', phoneNumber: '012998877' },
        dropoff: { address: 'St 310, Phnom Penh', coordinates: { lat: 11.55, lng: 104.92 } },
      },
    ];

    const seeded = seedPerStopCodOnExpand(singleStop, { isCod: true, amount: 25 });
    expect(seeded[0].codAmount).toBe(25);
  });

  it('rejects negative per-stop COD amounts during stop validation', () => {
    const stops: DropoffStop[] = [
      {
        id: 'stop-1',
        recipient: { name: 'Sokha', phoneNumber: '012998877' },
        dropoff: { address: 'St 310, Phnom Penh', coordinates: { lat: 11.55, lng: 104.92 } },
        codAmount: -5,
      },
    ];

    const errors = validateDropoffStops(stops);
    expect(errors['dropoffs.0.codAmount']).toBeDefined();
  });

  it('allows total stop COD up to $60 USD and rejects totals above $60 USD', () => {
    const validStops: DropoffStop[] = [
      {
        id: 'stop-1',
        recipient: { name: 'Sokha', phoneNumber: '012998877' },
        dropoff: { address: 'St 310, Phnom Penh', coordinates: { lat: 11.55, lng: 104.92 } },
        codAmount: 35,
      },
      {
        id: 'stop-2',
        recipient: { name: 'Dara', phoneNumber: '098112233' },
        dropoff: { address: 'St 63, Phnom Penh', coordinates: { lat: 11.56, lng: 104.93 } },
        codAmount: 25,
      },
    ];
    expect(validateDropoffStops(validStops)).toEqual({});

    const exceedingStops: DropoffStop[] = [
      ...validStops,
      {
        id: 'stop-3',
        recipient: { name: 'Bopha', phoneNumber: '077445566' },
        dropoff: { address: 'St 271, Phnom Penh', coordinates: { lat: 11.54, lng: 104.91 } },
        codAmount: 0.5,
      },
    ];
    const errors = validateDropoffStops(exceedingStops);
    expect(errors['cod.amount']).toContain('$60');
    expect(errors['dropoffs.0.codAmount']).toBeDefined();
    expect(errors['dropoffs.1.codAmount']).toBeDefined();
    expect(errors['dropoffs.2.codAmount']).toBeDefined();
  });

  it('parses optional COD column in bulk CSV template and preserves notes without COD column', () => {
    const parsedWithCod = parseBulkDropoffText(SAMPLE_BULK_CSV);
    expect(parsedWithCod[0].codAmount).toBe(25);
    expect(parsedWithCod[1].codAmount).toBe(18.5);
    expect(parsedWithCod[2].codAmount).toBe(0);
    expect(parsedWithCod[0].note).toBe('Leave with condo security');

    const dropsWithCod = convertParsedToDropoffStops(parsedWithCod);
    expect(dropsWithCod[0].codAmount).toBe(25);
    expect(syncCodWithDropoffs(dropsWithCod, { isCod: false, amount: 0 })).toEqual({
      isCod: true,
      amount: 75.5,
    });

    const legacyCsv = `Customer A, 012345678, St 123 Phnom Penh, Call gate`;
    const parsedLegacy = parseBulkDropoffText(legacyCsv);
    expect(parsedLegacy[0].codAmount).toBeUndefined();
    expect(parsedLegacy[0].note).toBe('Call gate');
  });
});

