import { describe, it, expect } from 'vitest';
import {
  parseBulkOrderText,
  convertOrdersToBulkDrafts,
  SAMPLE_BULK_CSV,
  BulkOrderDraft,
} from '@/features/booking/services/bulk-order-parser';
import {
  calculateBulkBatchFees,
} from '@/features/booking/services/bulk-batch-submitter';
import { PickupLocation } from '@/features/booking/types/booking-types';

const VALID_PICKUP: PickupLocation = {
  name: 'Main Warehouse',
  address: 'St 271, Sangkat Boeng Tumpun, Phnom Penh',
  coordinates: { lat: 11.5564, lng: 104.9282 },
  senderPhone: '012888999',
  settlementAccountName: 'Sokha Shop',
  settlementAccountNumber: '012888999',
};

function reorderOrders(
  orders: BulkOrderDraft[],
  oldIndex: number,
  newIndex: number
): BulkOrderDraft[] {
  if (oldIndex === newIndex) return orders;
  if (
    oldIndex < 0 ||
    oldIndex >= orders.length ||
    newIndex < 0 ||
    newIndex >= orders.length
  ) {
    return orders;
  }
  const next = [...orders];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return next;
}

describe('Bulk Order Drag-and-Drop Reordering', () => {
  it('reorders bulk orders in batch while preserving order IDs and stop contents', () => {
    const parsed = parseBulkOrderText(SAMPLE_BULK_CSV);
    const drafts = convertOrdersToBulkDrafts(parsed);
    expect(drafts).toHaveLength(3);

    const order1Id = drafts[0].id;
    const order2Id = drafts[1].id;
    const order3Id = drafts[2].id;

    // Drag Order #3 (index 2) to the top position (index 0)
    const reordered = reorderOrders(drafts, 2, 0);

    expect(reordered).toHaveLength(3);
    expect(reordered[0].id).toBe(order3Id);
    expect(reordered[1].id).toBe(order1Id);
    expect(reordered[2].id).toBe(order2Id);

    // Stops inside each order remain completely intact
    expect(reordered[0].stops).toHaveLength(1);
    expect(reordered[1].stops).toHaveLength(2);
    expect(reordered[2].stops).toHaveLength(3);
  });

  it('safely handles out of bounds oldIndex or newIndex without modifying array', () => {
    const parsed = parseBulkOrderText(SAMPLE_BULK_CSV);
    const drafts = convertOrdersToBulkDrafts(parsed);

    const negativeOld = reorderOrders(drafts, -1, 1);
    expect(negativeOld).toEqual(drafts);

    const overflowOld = reorderOrders(drafts, 99, 1);
    expect(overflowOld).toEqual(drafts);

    const negativeNew = reorderOrders(drafts, 1, -1);
    expect(negativeNew).toEqual(drafts);

    const overflowNew = reorderOrders(drafts, 1, 99);
    expect(overflowNew).toEqual(drafts);
  });

  it('returns same array reference when oldIndex === newIndex', () => {
    const parsed = parseBulkOrderText(SAMPLE_BULK_CSV);
    const drafts = convertOrdersToBulkDrafts(parsed);

    const same = reorderOrders(drafts, 1, 1);
    expect(same).toBe(drafts);
  });

  it('maintains correct batch fees and COD totals after orders are reordered', () => {
    const parsed = parseBulkOrderText(SAMPLE_BULK_CSV);
    const drafts = convertOrdersToBulkDrafts(parsed);

    const feesBefore = calculateBulkBatchFees(VALID_PICKUP, drafts, 'instant');
    const reordered = reorderOrders(drafts, 0, 2);
    const feesAfter = calculateBulkBatchFees(VALID_PICKUP, reordered, 'instant');

    expect(feesAfter.totalStops).toBe(feesBefore.totalStops);
    expect(feesAfter.totalFee).toBe(feesBefore.totalFee);
    expect(feesAfter.totalCod).toBe(feesBefore.totalCod);
  });
});
