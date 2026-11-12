import 'server-only';
import {
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';
import {
  DEMO_PAYMENT_CARDS,
  DEMO_PAYMENT_OPTIONS,
} from '@/features/booking/data/demo-seed-data';

let mockCards: PaymentCardItem[] = [...DEMO_PAYMENT_CARDS];

export const mockPaymentStore = {
  getOptions(): PaymentOptionItem[] {
    return DEMO_PAYMENT_OPTIONS;
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

