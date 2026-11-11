import 'server-only';
import {
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';

const DEFAULT_OPTIONS: PaymentOptionItem[] = [
  {
    id: 'khqr',
    providerCode: 'khqr',
    title: 'Wing Bank KHQR',
    subtitle: 'Scan with any Bakong member banking application',
    subtitleImages: [],
    isDefault: true,
    isAvailable: true,
  },
  {
    id: 'wing_point',
    providerCode: 'wing_point',
    title: 'WingPoints',
    subtitle: 'Redeem Wing reward points (4,000 Pts = $1.00 USD)',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
  {
    id: 'wing_pay',
    providerCode: 'wing_pay',
    title: 'WingPay Wallet',
    subtitle: 'Instant settlement from your linked Wing account',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
  {
    id: 'cash_on_delivery',
    providerCode: 'cash_on_delivery',
    title: 'Cash on Pickup',
    subtitle: 'Pay delivery fee directly to the courier when package is picked up',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
  {
    id: 'card',
    providerCode: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, or UnionPay online payment',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
];

let mockCards: PaymentCardItem[] = [
  {
    id: 'PMC-MOCK-0001',
    maskedCard: '4111 •••• •••• 4242',
    isDefault: true,
    cardScheme: 'VISA',
    issuer: 'Wing Bank Visa',
  },
];

export const mockPaymentStore = {
  getOptions(): PaymentOptionItem[] {
    return DEFAULT_OPTIONS;
  },

  checkAvailability(
    providerCode: string,
    serviceType: string,
  ): PaymentAvailabilityResult {
    return {
      providerCode,
      serviceType,
      isAvailable: true,
    };
  },

  listCards(): PaymentCardItem[] {
    return [...mockCards];
  },

  createMockCard(): PaymentCardItem {
    const suffix = String(1000 + mockCards.length + 1);
    const created: PaymentCardItem = {
      id: `PMC-MOCK-${Date.now()}`,
      maskedCard: `5412 •••• •••• ${suffix}`,
      isDefault: mockCards.length === 0,
      cardScheme: 'MASTERCARD',
      issuer: 'Mock Card',
    };
    mockCards = [...mockCards, created];
    return created;
  },

  setDefaultCard(cardId: string, isDefault: boolean): void {
    mockCards = mockCards.map((c) =>
      c.id === cardId
        ? { ...c, isDefault }
        : isDefault
        ? { ...c, isDefault: false }
        : c,
    );
  },

  deleteCard(cardId: string): void {
    mockCards = mockCards.filter((c) => c.id !== cardId);
  },

  getPaymentDetail(paymentId: string): PaymentDetailRecord {
    return {
      id: paymentId,
      paymentStatus: 'PAID',
      totalAmount: '1.75',
      paidAmount: '1.75',
      currency: 'USD',
      transactions: [
        {
          id: `TX-${paymentId}`,
          internalReference: `INT-${paymentId}`,
          amount: '1.75',
          currency: 'USD',
          paymentType: 'EXPRESS_DELIVERY',
          transactionStatus: 'SUCCESS',
        },
      ],
    };
  },
};

