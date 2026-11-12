import {
  DEMO_PAYMENT_CARDS,
  DEMO_PAYMENT_OPTIONS,
} from '@/features/booking/data/demo-seed-data';
import {
  DEMO_STORAGE_KEYS,
  readStoredDemoArray,
  writeStoredDemoArray,
} from '@/lib/local-demo-storage';
import {
  CreatePaymentCardResult,
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
} from '../types/payment-types';

function getStoredCards(): PaymentCardItem[] {
  return readStoredDemoArray<PaymentCardItem>(DEMO_STORAGE_KEYS.cards, () => [
    ...DEMO_PAYMENT_CARDS,
  ]);
}

export const localDemoPaymentStore = {
  listOptions(): { options: PaymentOptionItem[]; source: 'mock' } {
    return { options: DEMO_PAYMENT_OPTIONS, source: 'mock' };
  },

  checkAvailability(
    providerCode: string,
    serviceType = 'ST_EXPRESS',
  ): PaymentAvailabilityResult {
    return {
      providerCode,
      serviceType,
      isAvailable: true,
    };
  },

  listCards(): PaymentCardItem[] {
    return getStoredCards();
  },

  createCard(): CreatePaymentCardResult {
    const current = getStoredCards();
    const suffix = String(1000 + current.length + 1);
    const created: PaymentCardItem = {
      id: `PMC-MOCK-${Date.now()}`,
      maskedCard: `5412 •••• •••• ${suffix}`,
      isDefault: current.length === 0,
      cardScheme: 'MASTERCARD',
      issuer: 'Mock Card',
    };
    writeStoredDemoArray(DEMO_STORAGE_KEYS.cards, [...current, created]);
    return { card: created, redirectUrl: undefined };
  },

  setDefaultCard(cardId: string, isDefault = true): { success: boolean } {
    const next = getStoredCards().map((card) =>
      card.id === cardId
        ? { ...card, isDefault }
        : isDefault
          ? { ...card, isDefault: false }
          : card,
    );
    writeStoredDemoArray(DEMO_STORAGE_KEYS.cards, next);
    return { success: true };
  },

  deleteCard(cardId: string): { success: boolean } {
    writeStoredDemoArray(
      DEMO_STORAGE_KEYS.cards,
      getStoredCards().filter((card) => card.id !== cardId),
    );
    return { success: true };
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
