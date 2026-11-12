import 'server-only';
import {
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';
import { SessionData } from '@/features/auth/types/auth-types';
import { wingPaymentIntegration } from '@/server/integrations/wing-payment-integration';
import { ConsumerApiError } from '@/server/lib/api-response';
import { getServerEnv } from '@/server/lib/env';
import { mockPaymentStore } from '@/server/lib/mock-payment-store';

export const paymentServerService = {
  async listPaymentOptions(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    serviceType?: string;
    page?: number;
    rpp?: number;
    direction?: 'ASC' | 'DESC';
    property?: string;
    search?: string;
    filter?: string;
  }): Promise<{
    options: PaymentOptionItem[];
    source: 'mock' | 'preview' | 'live';
  }> {
    const env = getServerEnv();
    if (env.mockPaymentApi) {
      return { options: mockPaymentStore.getOptions(), source: 'mock' };
    }
    if (!params.session?.accessToken) {
      return { options: mockPaymentStore.getOptions(), source: 'preview' };
    }

    const options = await wingPaymentIntegration.listPaymentOptions({
      accessToken: params.session.accessToken,
      acceptLanguage: params.acceptLanguage,
      serviceType: params.serviceType || 'ST_EXPRESS',
      page: params.page,
      rpp: params.rpp,
      direction: params.direction,
      property: params.property,
      search: params.search,
      filter: params.filter,
    });

    return {
      options: options.length > 0 ? options : mockPaymentStore.getOptions(),
      source: options.length > 0 ? 'live' : 'preview',
    };
  },

  async checkAvailability(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    providerCode: string;
    serviceType?: string;
  }): Promise<PaymentAvailabilityResult> {
    const env = getServerEnv();
    const serviceType = params.serviceType || 'ST_EXPRESS';
    if (env.mockPaymentApi) {
      return mockPaymentStore.checkAvailability(
        params.providerCode,
        serviceType,
      );
    }
    if (!params.session?.accessToken) {
      throw new ConsumerApiError('Unauthorized', 401);
    }

    return wingPaymentIntegration.checkPaymentAvailability({
      accessToken: params.session.accessToken,
      acceptLanguage: params.acceptLanguage,
      providerCode: params.providerCode,
      serviceType,
    });
  },

  async listCards(params: {
    session: SessionData | null;
    acceptLanguage?: string;
  }): Promise<PaymentCardItem[]> {
    const env = getServerEnv();
    if (env.mockPaymentApi) {
      return mockPaymentStore.listCards();
    }
    if (!params.session?.accessToken) {
      throw new ConsumerApiError('Please sign in to view saved cards', 401);
    }

    return wingPaymentIntegration.listPaymentCards({
      accessToken: params.session.accessToken,
      acceptLanguage: params.acceptLanguage,
    });
  },

  async createCard(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    platform?: string;
    provider: string;
    serviceCode?: string;
  }): Promise<{ card?: PaymentCardItem; redirectUrl?: string }> {
    const env = getServerEnv();
    if (env.mockPaymentApi) {
      return { card: mockPaymentStore.createMockCard(), redirectUrl: undefined };
    }
    if (!params.session?.accessToken) {
      throw new ConsumerApiError('Please sign in to link a payment card', 401);
    }

    return wingPaymentIntegration.createPaymentCard({
      accessToken: params.session.accessToken,
      acceptLanguage: params.acceptLanguage,
      platform: params.platform || 'UNIFIED',
      provider: params.provider,
      serviceCode: params.serviceCode || 'ST_EXPRESS',
    });
  },

  async setDefaultCard(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    cardId: string;
    isDefault: boolean;
  }): Promise<void> {
    const env = getServerEnv();
    if (env.mockPaymentApi) {
      mockPaymentStore.setDefaultCard(params.cardId, params.isDefault);
      return;
    }
    if (!params.session?.accessToken) {
      throw new ConsumerApiError('Unauthorized', 401);
    }

    await wingPaymentIntegration.configurePaymentCard({
      accessToken: params.session.accessToken,
      acceptLanguage: params.acceptLanguage,
      paymentCardId: params.cardId,
      isDefault: params.isDefault,
    });
  },

  async deleteCard(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    cardId: string;
  }): Promise<void> {
    const env = getServerEnv();
    if (env.mockPaymentApi) {
      mockPaymentStore.deleteCard(params.cardId);
      return;
    }
    if (!params.session?.accessToken) {
      throw new ConsumerApiError('Unauthorized', 401);
    }

    await wingPaymentIntegration.deletePaymentCard({
      accessToken: params.session.accessToken,
      acceptLanguage: params.acceptLanguage,
      paymentCardId: params.cardId,
    });
  },

  async getPaymentDetail(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    paymentId: string;
  }): Promise<PaymentDetailRecord | null> {
    const env = getServerEnv();
    if (env.mockPaymentApi) {
      return mockPaymentStore.getPaymentDetail(params.paymentId);
    }
    if (!params.session?.accessToken) {
      throw new ConsumerApiError('Unauthorized', 401);
    }

    return wingPaymentIntegration.getPaymentDetail({
      accessToken: params.session.accessToken,
      acceptLanguage: params.acceptLanguage,
      paymentId: params.paymentId,
    });
  },
};

