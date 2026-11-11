export type PaymentUiKind =
  | 'khqr'
  | 'wingpoint'
  | 'wallet'
  | 'cop'
  | 'card'
  | 'other';

/**
 * Classifies backend `provider_code` strings into consistent UI categories
 * while preserving exact backend provider codes for submission.
 */
export function normalizePaymentKind(providerCode?: string | null): PaymentUiKind {
  const code = (providerCode || '').trim().toLowerCase();
  if (!code) return 'khqr';

  if (code.includes('khqr') || code.includes('bakong') || code === 'qr') {
    return 'khqr';
  }
  if (code.includes('point') || code === 'wingpoint') {
    return 'wingpoint';
  }
  if (
    code === 'cop' ||
    code.includes('cash') ||
    code === 'cod' ||
    code.includes('cash_on_delivery') ||
    code.includes('cash_on_pickup')
  ) {
    return 'cop';
  }
  if (code.includes('wallet') || code.includes('wing_pay') || code === 'wingpay') {
    return 'wallet';
  }
  if (
    code.includes('card') ||
    code.includes('visa') ||
    code.includes('master') ||
    code.includes('mpgs') ||
    code.includes('cybersource')
  ) {
    return 'card';
  }
  return 'other';
}

export function isCardPaymentProvider(providerCode?: string | null): boolean {
  return normalizePaymentKind(providerCode) === 'card';
}

