import { describe, it, expect } from 'vitest';
import {
  parseBulkDropoffText,
  convertParsedToDropoffStops,
  SAMPLE_BULK_CSV,
} from '@/features/booking/services/bulk-dropoff-parser';

describe('Bulk Dropoff Parser', () => {
  it('parses sample CSV template correctly skipping headers', () => {
    const parsed = parseBulkDropoffText(SAMPLE_BULK_CSV);
    expect(parsed).toHaveLength(4);

    expect(parsed[0].recipientName).toBe('Sokha Chan');
    expect(parsed[0].phoneNumber).toBe('+85512345678');
    expect(parsed[0].address).toContain('St 310 BKK1');
    expect(parsed[0].isValid).toBe(true);
  });

  it('marks invalid phone numbers as invalid', () => {
    const text = `Customer A, 1234, St 123 Phnom Penh, Note`;
    const parsed = parseBulkDropoffText(text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].isValid).toBe(false);
    expect(parsed[0].error).toBe('Invalid phone number');
  });

  it('converts valid parsed items to DropoffStops', () => {
    const parsed = parseBulkDropoffText(SAMPLE_BULK_CSV);
    const stops = convertParsedToDropoffStops(parsed);
    expect(stops).toHaveLength(4);
    expect(stops[0].recipient.name).toBe('Sokha Chan');
    expect(stops[0].recipient.phoneNumber).toBe('+85512345678');
    expect(stops[0].dropoff.address).toContain('St 310 BKK1');
    expect(stops[0].dropoff.coordinates.lat).toBeGreaterThan(11);
  });

  it('caps converted dropoff stops at MAX_DROPOFF_STOPS (5)', () => {
    const csv = [
      'Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note',
      'Stop 1,012345671,St 101 Phnom Penh,10,Note 1',
      'Stop 2,012345672,St 102 Phnom Penh,10,Note 2',
      'Stop 3,012345673,St 103 Phnom Penh,10,Note 3',
      'Stop 4,012345674,St 104 Phnom Penh,10,Note 4',
      'Stop 5,012345675,St 105 Phnom Penh,10,Note 5',
      'Stop 6,012345676,St 106 Phnom Penh,10,Note 6',
    ].join('\n');

    const parsed = parseBulkDropoffText(csv);
    expect(parsed).toHaveLength(6);

    const stops = convertParsedToDropoffStops(parsed);
    expect(stops).toHaveLength(5);
    expect(stops[4].recipient.name).toBe('Stop 5');
  });
});

