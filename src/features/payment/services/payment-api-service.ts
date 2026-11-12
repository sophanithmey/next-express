import { clientAxios, withAcceptLanguage } from '@/lib/axios/client-axios';
import { isLocalDemoStorageEnabled } from '@/lib/local-demo-storage';
import { localDemoPaymentStore } from './local-demo-payment-store';
import {
  CreatePaymentCardPayload,
  CreatePaymentCardResult,
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
} from '../types/payment-types';

export interface ListPaymentOptionsResponse {
  options: PaymentOptionItem[];
  source: 'mock' | 'preview' | 'live';
}

export interface ListPaymentOptionsParams {
  serviceType?: string;
  locale?: string;
  page?: number;
  rpp?: number;
  direction?: 'ASC' | 'DESC';
  property?: string;
  search?: string;
  filter?: string;
}

export const paymentApiService = {
  async listOptions(
    params: ListPaymentOptionsParams = {},
  ): Promise<ListPaymentOptionsResponse> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoPaymentStore.listOptions();
    }
    const { serviceType = 'ST_EXPRESS', locale, ...query } = params;
    const response = await clientAxios.get<ListPaymentOptionsResponse>(
      '/payments/options',
      withAcceptLanguage(locale, {
        params: { serviceType, ...query },
      }),
    );
    return {
      options: response.data.options || [],
      source: response.data.source || 'preview',
    };
  },

  async checkAvailability(params: {
    providerCode: string;
    serviceType?: string;
    locale?: string;
  }): Promise<PaymentAvailabilityResult> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoPaymentStore.checkAvailability(
        params.providerCode,
        params.serviceType || 'ST_EXPRESS',
      );
    }
    const serviceType = params.serviceType || 'ST_EXPRESS';
    const response = await clientAxios.get<PaymentAvailabilityResult>(
      `/payments/options/${encodeURIComponent(params.providerCode)}/availability`,
      withAcceptLanguage(params.locale, {
        params: { service_type: serviceType },
      }),
    );
    return response.data;
  },

  async listCards(locale?: string): Promise<PaymentCardItem[]> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoPaymentStore.listCards();
    }
    const response = await clientAxios.get<{ cards?: PaymentCardItem[] }>(
      '/payments/cards',
      withAcceptLanguage(locale),
    );
    return response.data.cards || [];
  },

  async createCard(
    payload: CreatePaymentCardPayload,
    locale?: string,
  ): Promise<CreatePaymentCardResult> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoPaymentStore.createCard();
    }
    const response = await clientAxios.post<CreatePaymentCardResult>(
      '/payments/cards',
      payload,
      withAcceptLanguage(locale),
    );
    return response.data;
  },

  async setDefaultCard(params: {
    cardId: string;
    isDefault?: boolean;
    locale?: string;
  }): Promise<{ success: boolean }> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoPaymentStore.setDefaultCard(
        params.cardId,
        params.isDefault ?? true,
      );
    }
    const response = await clientAxios.patch<{ success: boolean }>(
      `/payments/cards/${encodeURIComponent(params.cardId)}`,
      { isDefault: params.isDefault ?? true },
      withAcceptLanguage(params.locale),
    );
    return response.data;
  },

  async deleteCard(params: {
    cardId: string;
    locale?: string;
  }): Promise<{ success: boolean }> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoPaymentStore.deleteCard(params.cardId);
    }
    const response = await clientAxios.delete<{ success: boolean }>(
      `/payments/cards/${encodeURIComponent(params.cardId)}`,
      withAcceptLanguage(params.locale),
    );
    return response.data;
  },

  async getPaymentDetail(
    paymentId: string,
    locale?: string,
  ): Promise<PaymentDetailRecord> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoPaymentStore.getPaymentDetail(paymentId);
    }
    const response = await clientAxios.get<PaymentDetailRecord>(
      `/payments/${encodeURIComponent(paymentId)}`,
      withAcceptLanguage(locale),
    );
    return response.data;
  },
};

