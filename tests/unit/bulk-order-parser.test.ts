import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import {
  parseBulkOrderText,
  convertOrdersToBulkDrafts,
  parseBulkOrderFile,
  validateBulkOrderBatch,
  SAMPLE_BULK_CSV,
  SAMPLE_BULK_ROWS,
} from '@/features/booking/services/bulk-order-parser';
import { MAX_BULK_ORDERS, MAX_STOPS_PER_BULK_ORDER } from '@/lib/constants';
import { PickupLocation } from '@/features/booking/types/booking-types';

const VALID_PICKUP: PickupLocation = {
  name: 'Main Warehouse',
  address: 'St 271, Sangkat Boeng Tumpun, Phnom Penh',
  coordinates: { lat: 11.5564, lng: 104.9282 },
  senderPhone: '012888999',
  settlementAccountName: 'Sokha Shop',
  settlementAccountNumber: '012888999',
};

describe('Bulk Order Parser & Batch Validation', () => {
  it('groups sample CSV into 3 separate orders with 6 total stops', () => {
    const parsed = parseBulkOrderText(SAMPLE_BULK_CSV);
    expect(parsed).toHaveLength(3);

    expect(parsed[0].orderKey).toBe('1');
    expect(parsed[0].stops).toHaveLength(2);
    expect(parsed[0].totalCod).toBe(43.5);
    expect(parsed[0].isCodOverLimit).toBe(false);

    expect(parsed[1].orderKey).toBe('2');
    expect(parsed[1].stops).toHaveLength(3);
    expect(parsed[1].totalCod).toBe(47);
    expect(parsed[1].isCodOverLimit).toBe(false);

    expect(parsed[2].orderKey).toBe('3');
    expect(parsed[2].stops).toHaveLength(1);
    expect(parsed[2].totalCod).toBe(0);

    const totalStops = parsed.reduce((sum, o) => sum + o.stops.length, 0);
    expect(totalStops).toBe(6);
  });

  it('produces unique order IDs and unique stop IDs across all converted orders', () => {
    const parsed = parseBulkOrderText(SAMPLE_BULK_CSV);
    const drafts = convertOrdersToBulkDrafts(parsed);

    expect(drafts).toHaveLength(3);
    const orderIds = drafts.map((d) => d.id);
    expect(new Set(orderIds).size).toBe(3);

    const stopIds = drafts.flatMap((d) => d.stops.map((s) => s.id));
    expect(stopIds).toHaveLength(6);
    expect(new Set(stopIds).size).toBe(6);
  });

  it('caps converted orders at MAX_BULK_ORDERS (50) and flags overflow orders', () => {
    const rows = ['Order #,Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note'];
    for (let i = 1; i <= 55; i++) {
      rows.push(`${i},Customer ${i},012345678,St ${i} Phnom Penh,10,Note ${i}`);
    }

    const parsed = parseBulkOrderText(rows.join('\n'));
    expect(parsed).toHaveLength(55);
    expect(parsed[49].exceedsOrderLimit).toBe(false);
    expect(parsed[50].exceedsOrderLimit).toBe(true);

    const drafts = convertOrdersToBulkDrafts(parsed);
    expect(drafts).toHaveLength(MAX_BULK_ORDERS);
  });

  it('caps each order at MAX_STOPS_PER_BULK_ORDER (5) and tracks truncated stops', () => {
    const rows = [
      'Order #,Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note',
      '1,Stop 1,012345671,St 101 Phnom Penh,5,Note 1',
      '1,Stop 2,012345672,St 102 Phnom Penh,5,Note 2',
      '1,Stop 3,012345673,St 103 Phnom Penh,5,Note 3',
      '1,Stop 4,012345674,St 104 Phnom Penh,5,Note 4',
      '1,Stop 5,012345675,St 105 Phnom Penh,5,Note 5',
      '1,Stop 6,012345676,St 106 Phnom Penh,5,Note 6',
      '1,Stop 7,012345677,St 107 Phnom Penh,5,Note 7',
    ];

    const parsed = parseBulkOrderText(rows.join('\n'));
    expect(parsed).toHaveLength(1);
    expect(parsed[0].stops).toHaveLength(MAX_STOPS_PER_BULK_ORDER);
    expect(parsed[0].truncatedStopCount).toBe(2);
  });

  it('validates $60 COD limit per order independently', () => {
    const csv = [
      'Order #,Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note',
      '1,Buyer A,012345678,St 310 Phnom Penh,40,',
      '1,Buyer B,098112233,St 271 Phnom Penh,30,',
      '2,Buyer C,077445566,Russian Market Phnom Penh,50,',
    ].join('\n');

    const parsed = parseBulkOrderText(csv);
    expect(parsed[0].totalCod).toBe(70);
    expect(parsed[0].isCodOverLimit).toBe(true);
    expect(parsed[1].totalCod).toBe(50);
    expect(parsed[1].isCodOverLimit).toBe(false);

    const drafts = convertOrdersToBulkDrafts(parsed);
    const result = validateBulkOrderBatch(VALID_PICKUP, drafts);
    expect(result.hasErrors).toBe(true);
    expect(result.invalidOrderCount).toBe(1);
    expect(result.orderErrors[drafts[0].id]['cod.amount']).toBeDefined();
    expect(result.orderErrors[drafts[1].id]).toBeUndefined();
  });

  it('passes batch validation when sample orders have valid shared pickup with Wing Bank', () => {
    const drafts = convertOrdersToBulkDrafts(parseBulkOrderText(SAMPLE_BULK_CSV));
    const result = validateBulkOrderBatch(VALID_PICKUP, drafts);
    expect(result.hasErrors).toBe(false);
    expect(result.invalidOrderCount).toBe(0);
  });

  it('parses uploaded Excel .xlsx file with Order # column into 3 grouped orders', async () => {
    const ws = XLSX.utils.aoa_to_sheet(SAMPLE_BULK_ROWS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    const file = new File([u8], 'orders.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const csvText = await parseBulkOrderFile(file);
    const parsed = parseBulkOrderText(csvText);
    expect(parsed).toHaveLength(3);
    expect(parsed[0].stops).toHaveLength(2);
    expect(parsed[1].stops).toHaveLength(3);
    expect(parsed[2].stops).toHaveLength(1);
  });
});
