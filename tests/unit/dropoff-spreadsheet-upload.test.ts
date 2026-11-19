import { describe, it, expect } from 'vitest';
import {
  parseDropoffStopsFromText,
  SAMPLE_DROPOFF_CSV,
  SAMPLE_DROPOFF_ROWS,
} from '@/features/booking/services/bulk-order-parser';
import { MAX_DROPOFF_STOPS } from '@/lib/constants';
import enMessages from '@/../messages/en.json';
import kmMessages from '@/../messages/km.json';

describe('Drop-off Spreadsheet Upload & Parser', () => {
  it('parses sample dropoff CSV into valid DropoffStop objects', () => {
    const stops = parseDropoffStopsFromText(SAMPLE_DROPOFF_CSV);

    expect(stops).toHaveLength(3);
    expect(stops[0].recipient.name).toBe('Sokha Chan');
    expect(stops[0].recipient.phoneNumber).toBe('+85512345678');
    expect(stops[0].dropoff.address).toContain('St 310 BKK1');
    expect(stops[0].codAmount).toBe(25);
    expect(stops[0].recipient.notes).toBe('Leave with security');

    expect(stops[1].recipient.name).toBe('Dara Vong');
    expect(stops[1].recipient.phoneNumber).toBe('+85598112233');
    expect(stops[1].codAmount).toBe(18.5);

    expect(stops[2].recipient.name).toBe('Vanna Ros');
    expect(stops[2].recipient.phoneNumber).toBe('+85577445566');
    expect(stops[2].codAmount).toBe(0);
  });

  it('caps parsed stops at MAX_DROPOFF_STOPS (5) when given more than 5 rows', () => {
    const rows = [
      'Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note',
    ];
    for (let i = 1; i <= 9; i++) {
      rows.push(`Buyer ${i},01234567${i},Street ${i}00 Phnom Penh,${i * 5},Note ${i}`);
    }

    const stops = parseDropoffStopsFromText(rows.join('\n'));
    expect(stops).toHaveLength(MAX_DROPOFF_STOPS);
    expect(stops[0].recipient.name).toBe('Buyer 1');
    expect(stops[4].recipient.name).toBe('Buyer 5');
  });

  it('generates unique stop IDs for each imported stop', () => {
    const stops = parseDropoffStopsFromText(SAMPLE_DROPOFF_CSV);
    const stopIds = stops.map((s) => s.id);
    expect(new Set(stopIds).size).toBe(stops.length);
  });

  it('parses GPS coordinates when provided in address column', () => {
    const csv = [
      'Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note',
      'Test User,012888999,"11.5564, 104.9282",10,GPS location',
    ].join('\n');

    const stops = parseDropoffStopsFromText(csv);
    expect(stops).toHaveLength(1);
    expect(stops[0].dropoff.coordinates.lat).toBeCloseTo(11.5564, 4);
    expect(stops[0].dropoff.coordinates.lng).toBeCloseTo(104.9282, 4);
  });

  it('handles negative or invalid COD amounts gracefully by resetting to 0', () => {
    const csv = [
      'Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note',
      'Zero COD,012999888,Toul Kork Phnom Penh,-15,No COD',
      'Invalid COD,012999777,BKK Phnom Penh,abc,Invalid',
    ].join('\n');

    const stops = parseDropoffStopsFromText(csv);
    expect(stops).toHaveLength(2);
    expect(stops[0].codAmount).toBe(0);
    expect(stops[1].codAmount).toBe(0);
  });

  it('contains valid headers in SAMPLE_DROPOFF_ROWS and CSV', () => {
    expect(SAMPLE_DROPOFF_ROWS[0]).toEqual([
      'Recipient Name',
      'Recipient Phone',
      'Drop-off Address',
      'COD Amount',
      'Delivery Note',
    ]);
    expect(SAMPLE_DROPOFF_CSV).toContain('Recipient Name');
    expect(SAMPLE_DROPOFF_CSV).toContain('012345678');
  });

  it('has consistent bilingual translation keys for dropoff upload', () => {
    const enBooking = enMessages.Booking as Record<string, string>;
    const kmBooking = kmMessages.Booking as Record<string, string>;

    const requiredKeys = [
      'dropoffUploadCsvExcel',
      'dropoffImportStops',
      'dropoffUploadModalTitle',
      'dropoffUploadModalSubtitle',
      'dropoffStopsImportedToast',
      'dropoffStopsTruncatedToast',
      'dropoffNoValidStopsError',
      'dropoffDragDropHint',
      'dropoffApplyStopsButton',
      'dropoffDownloadXlsx',
      'dropoffDownloadCsv',
      'dropoffLoadSample',
    ];

    for (const key of requiredKeys) {
      expect(enBooking[key]).toBeDefined();
      expect(kmBooking[key]).toBeDefined();
      expect(typeof enBooking[key]).toBe('string');
      expect(typeof kmBooking[key]).toBe('string');
      expect(enBooking[key].length).toBeGreaterThan(0);
      expect(kmBooking[key].length).toBeGreaterThan(0);
    }
  });
});
