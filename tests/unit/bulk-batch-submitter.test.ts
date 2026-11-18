import { describe, expect, it } from 'vitest';
import {
  allocateBulkAdjustments,
  calculateBulkFinalPayableFee,
} from '@/features/booking/services/bulk-batch-submitter';

describe('calculateBulkFinalPayableFee', () => {
  it('applies voucher discount and rider tip cleanly without negative totals', () => {
    expect(calculateBulkFinalPayableFee(5.25, 1.0, 0.5)).toBe(4.75);
    expect(calculateBulkFinalPayableFee(1.75, 5.0, 1.0)).toBe(1.0);
    expect(calculateBulkFinalPayableFee(0, 0.5, 2.0)).toBe(2.0);
  });

  it('clamps negative inputs safely', () => {
    expect(calculateBulkFinalPayableFee(-2, -1, -0.5)).toBe(0);
  });
});

describe('allocateBulkAdjustments', () => {
  it('allocates batch discount and rider tip across orders with exact cent sums', () => {
    const allocations = allocateBulkAdjustments([1.75, 2.5, 1.75], 1.0, 2.0);

    const totalDiscount =
      Math.round(allocations.reduce((s, a) => s + a.discount, 0) * 100) / 100;
    const totalTip =
      Math.round(allocations.reduce((s, a) => s + a.tip, 0) * 100) / 100;
    const totalFinal =
      Math.round(allocations.reduce((s, a) => s + a.finalFee, 0) * 100) / 100;

    expect(totalDiscount).toBe(1.0);
    expect(totalTip).toBe(2.0);
    expect(totalFinal).toBe(calculateBulkFinalPayableFee(6.0, 1.0, 2.0));
    expect(allocations.every((a) => a.finalFee >= 0)).toBe(true);
  });

  it('caps discount at total batch fee when discount exceeds subtotal', () => {
    const allocations = allocateBulkAdjustments([1.0, 1.0], 5.0, 0.5);
    const totalDiscount =
      Math.round(allocations.reduce((s, a) => s + a.discount, 0) * 100) / 100;
    const totalFinal =
      Math.round(allocations.reduce((s, a) => s + a.finalFee, 0) * 100) / 100;

    expect(totalDiscount).toBe(2.0);
    expect(totalFinal).toBe(0.5);
    expect(allocations.every((a) => a.finalFee >= 0)).toBe(true);
  });

  it('returns empty array for empty order list', () => {
    expect(allocateBulkAdjustments([], 1.0, 1.0)).toEqual([]);
  });
});
