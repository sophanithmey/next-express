import { describe, it, expect } from 'vitest';
import { validatePromoCode } from '@/features/booking/services/promo-service';

describe('validatePromoCode', () => {
  it('rejects empty promo codes', () => {
    const result = validatePromoCode('', 2.5);
    expect(result.isValid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.errorMessage).toBeDefined();
  });

  it('rejects invalid promo codes', () => {
    const result = validatePromoCode('INVALID123', 2.5);
    expect(result.isValid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.errorMessage).toContain('INVALID123');
  });

  it('validates flat discount promo code (WINGEXPRESS)', () => {
    const result = validatePromoCode('wingexpress', 2.5);
    expect(result.isValid).toBe(true);
    expect(result.promo?.code).toBe('WINGEXPRESS');
    expect(result.discountAmount).toBe(0.5);
  });

  it('caps flat discount if fee is smaller than discount', () => {
    const result = validatePromoCode('WINGEXPRESS', 0.3);
    expect(result.isValid).toBe(true);
    expect(result.discountAmount).toBe(0.3);
  });

  it('validates percentage discount promo code (WELCOME20)', () => {
    const result = validatePromoCode('welcome20', 2.0);
    expect(result.isValid).toBe(true);
    expect(result.discountAmount).toBe(0.4); // 20% of 2.00 = 0.40
  });

  it('validates VIP voucher (VIPWING)', () => {
    const result = validatePromoCode('VIPWING', 3.0);
    expect(result.isValid).toBe(true);
    expect(result.discountAmount).toBe(1.0);
  });
});

