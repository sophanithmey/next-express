import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import {
  parseBulkDropoffText,
  convertParsedToDropoffStops,
  parseBulkDropoffFile,
  SAMPLE_BULK_CSV,
  SAMPLE_BULK_ROWS,
} from '@/features/booking/services/bulk-dropoff-parser';

describe('Bulk Dropoff Parser', () => {
  it('parses sample CSV template correctly skipping headers', () => {
    const parsed = parseBulkDropoffText(SAMPLE_BULK_CSV);
    expect(parsed).toHaveLength(4);

    expect(parsed[0].recipientName).toBe('Sokha Chan');
    expect(parsed[0].phoneNumber).toBe('+85512345678');
    expect(parsed[0].address).toContain('St 310 BKK1');
    expect(parsed[0].isValid).toBe(true);

    // Stop 1 has lat,lng coordinates in sample
    expect(parsed[1].recipientName).toBe('Dara Vong');
    expect(parsed[1].coordinates).toEqual({ lat: 11.5564, lng: 104.9282 });
  });

  it('marks invalid phone numbers as invalid', () => {
    const text = `Customer A, 1234, St 123 Phnom Penh, Note`;
    const parsed = parseBulkDropoffText(text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].isValid).toBe(false);
    expect(parsed[0].error).toBe('Invalid phone number');
  });

  it('converts valid parsed items to DropoffStops and preserves lat,lng coordinates', () => {
    const parsed = parseBulkDropoffText(SAMPLE_BULK_CSV);
    const stops = convertParsedToDropoffStops(parsed);
    expect(stops).toHaveLength(4);
    expect(stops[0].recipient.name).toBe('Sokha Chan');
    expect(stops[0].recipient.phoneNumber).toBe('+85512345678');
    expect(stops[0].dropoff.address).toContain('St 310 BKK1');

    // Stop 1 must use the exact parsed coordinates from lat,lng
    expect(stops[1].dropoff.coordinates).toEqual({ lat: 11.5564, lng: 104.9282 });
  });

  it('correctly accepts addresses in lat,lng format (both unquoted and quoted)', () => {
    const unquotedRow = `Dara Vong, 098112233, 11.5564, 104.9282, 18.50, Red gate`;
    const quotedRow = `Sokha Chan, 012345678, "11.5762, 104.9230", 25, Near Wat Phnom`;
    const tabRow = `Bopha Pich\t077445566\t11.5406, 104.9149\t0\tRussian Market`;

    const parsedUnquoted = parseBulkDropoffText(unquotedRow);
    expect(parsedUnquoted).toHaveLength(1);
    expect(parsedUnquoted[0].isValid).toBe(true);
    expect(parsedUnquoted[0].coordinates).toEqual({ lat: 11.5564, lng: 104.9282 });
    expect(parsedUnquoted[0].codAmount).toBe(18.5);
    expect(parsedUnquoted[0].note).toBe('Red gate');

    const parsedQuoted = parseBulkDropoffText(quotedRow);
    expect(parsedQuoted).toHaveLength(1);
    expect(parsedQuoted[0].isValid).toBe(true);
    expect(parsedQuoted[0].coordinates).toEqual({ lat: 11.5762, lng: 104.923 });
    expect(parsedQuoted[0].codAmount).toBe(25);

    const parsedTab = parseBulkDropoffText(tabRow);
    expect(parsedTab).toHaveLength(1);
    expect(parsedTab[0].isValid).toBe(true);
    expect(parsedTab[0].coordinates).toEqual({ lat: 11.5406, lng: 104.9149 });
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

  it('parses uploaded Excel .xlsx file buffer into clean CSV text', async () => {
    const ws = XLSX.utils.aoa_to_sheet(SAMPLE_BULK_ROWS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drop-offs');
    const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    const file = new File([u8], 'test-stops.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const parsedText = await parseBulkDropoffFile(file);
    const parsedRows = parseBulkDropoffText(parsedText);
    expect(parsedRows.length).toBeGreaterThanOrEqual(4);
    expect(parsedRows[0].recipientName).toBe('Sokha Chan');
    expect(parsedRows[1].coordinates).toEqual({ lat: 11.5564, lng: 104.9282 });
  });
});

