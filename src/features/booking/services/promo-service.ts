export interface PromoCode {
  code: string;
  label: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minFee?: number;
}

export type PromoErrorCode = 'empty' | 'invalid' | 'min_fee';

export interface PromoValidationResult {
  isValid: boolean;
  promo?: PromoCode;
  discountAmount: number;
  errorMessage?: string;
  errorCode?: PromoErrorCode;
  errorMeta?: {
    code?: string;
    minFee?: string;
  };
}

export const VALID_PROMO_CODES: Record<string, PromoCode> = {
  WINGEXPRESS: {
    code: 'WINGEXPRESS',
    label: '$0.50 OFF',
    description: 'Special Express Delivery Discount',
    discountType: 'fixed',
    discountValue: 0.5,
  },
  FREE50: {
    code: 'FREE50',
    label: '$0.50 OFF',
    description: 'Seasonal delivery promotion',
    discountType: 'fixed',
    discountValue: 0.5,
  },
  WELCOME20: {
    code: 'WELCOME20',
    label: '20% OFF',
    description: 'New Seller Welcome Discount (20%)',
    discountType: 'percentage',
    discountValue: 20,
  },
  VIPWING: {
    code: 'VIPWING',
    label: '$1.00 OFF',
    description: 'VIP Seller Special Voucher',
    discountType: 'fixed',
    discountValue: 1.0,
  },
};

export const DEMO_PROMO_CHIPS = [
  { code: 'WINGEXPRESS', label: '⚡ WINGEXPRESS (-$0.50)' },
  { code: 'WELCOME20', label: '⚡ WELCOME20 (-20%)' },
  { code: 'VIPWING', label: '⚡ VIPWING (-$1.00)' },
];

export function validatePromoCode(
  rawCode: string,
  currentFee: number
): PromoValidationResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return {
      isValid: false,
      discountAmount: 0,
      errorMessage: 'Please enter a promo code.',
      errorCode: 'empty',
    };
  }

  const promo = VALID_PROMO_CODES[code];
  if (!promo) {
    return {
      isValid: false,
      discountAmount: 0,
      errorMessage: `Promo code "${code}" is invalid or expired.`,
      errorCode: 'invalid',
      errorMeta: { code },
    };
  }

  if (promo.minFee && currentFee < promo.minFee) {
    return {
      isValid: false,
      discountAmount: 0,
      errorMessage: `Minimum delivery fee of $${promo.minFee.toFixed(2)} required.`,
      errorCode: 'min_fee',
      errorMeta: { minFee: promo.minFee.toFixed(2) },
    };
  }

  let discount = 0;
  if (promo.discountType === 'fixed') {
    discount = Math.min(promo.discountValue, currentFee);
  } else if (promo.discountType === 'percentage') {
    discount = Math.round(((currentFee * promo.discountValue) / 100) * 100) / 100;
    discount = Math.min(discount, currentFee);
  }

  return {
    isValid: true,
    promo,
    discountAmount: Math.round(discount * 100) / 100,
  };
}

