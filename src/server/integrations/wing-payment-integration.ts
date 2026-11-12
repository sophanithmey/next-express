import 'server-only';
import { isAxiosError } from 'axios';
import { serverAxios } from '@/lib/axios/server-axios';
import {
  CreatePaymentCardPayload,
  CreatePaymentCardResult,
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';
import { getServerEnv } from '@/server/lib/env';
import {
  buildUnifiedHeaders,
  handleUnifiedAxiosError,
  unwrapUnifiedAxiosData,
} from '@/server/lib/unified-http';
import {
  mapPaymentAvailability,
  mapPaymentCardList,
  mapPaymentDetailRecord,
  mapPaymentOptionList,
} from './wing-payment-mapper';

export interface PaymentAuthContext {
  accessToken: string;
  acceptLanguage?: string;
}

export interface ListPaymentOptionsParams extends PaymentAuthContext {
  serviceType?: string;
  page?: number;
  rpp?: number;
  direction?: 'ASC' | 'DESC';
  property?: string;
  search?: string;
  filter?: string;
}

const PAYMENT_ERROR = 'Unable to reach Payment Service. Please try again.';

async function requestPayment<T>(config: {
  url: string;
  method: 'GET' | 'POST';
  accessToken: string;
  acceptLanguage?: string;
  params?: Record<string, unknown>;
  data?: unknown;
}): Promise<T> {
  try {
    const response = await serverAxios.request<T>({
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: buildUnifiedHeaders({
        accessToken: config.accessToken,
        acceptLanguage: config.acceptLanguage,
        includeJsonContentType: config.data !== undefined,
      }),
    });
    return unwrapUnifiedAxiosData<T>(response.data, response.status);
  } catch (err: unknown) {
    handleUnifiedAxiosError(err, PAYMENT_ERROR);
  }
}

export const wingPaymentIntegration = {
  async listPaymentOptions({
    accessToken,
    acceptLanguage = 'EN',
    serviceType = 'ST_EXPRESS',
    page,
    rpp,
    direction,
    property,
    search,
    filter,
  }: ListPaymentOptionsParams): Promise<PaymentOptionItem[]> {
    const env = getServerEnv();
    const raw = await requestPayment<{ body?: unknown }>({
      url: `${env.paymentApiBaseUrl}/consumer/payment-options/${encodeURIComponent(serviceType)}`,
      method: 'GET',
      accessToken,
      acceptLanguage,
      params: {
        ...(page !== undefined ? { page } : {}),
        ...(rpp !== undefined ? { rpp } : {}),
        ...(direction ? { direction } : {}),
        ...(property ? { property } : {}),
        ...(search ? { search } : {}),
        ...(filter ? { filter } : {}),
      },
    });
    return mapPaymentOptionList(raw.body, acceptLanguage);
  },

  async checkPaymentAvailability({
    accessToken,
    acceptLanguage = 'EN',
    providerCode,
    serviceType = 'ST_EXPRESS',
  }: PaymentAuthContext & {
    providerCode: string;
    serviceType?: string;
  }): Promise<PaymentAvailabilityResult> {
    const env = getServerEnv();
    const raw = await requestPayment<{ body?: unknown }>({
      url: `${env.paymentApiBaseUrl}/consumer/payment-options/${encodeURIComponent(providerCode)}/availability`,
      method: 'GET',
      accessToken,
      acceptLanguage,
      params: { service_type: serviceType },
    });
    return mapPaymentAvailability(
      raw.body,
      providerCode,
      serviceType,
      acceptLanguage,
    );
  },

  async listPaymentCards({
    accessToken,
    acceptLanguage = 'EN',
  }: PaymentAuthContext): Promise<PaymentCardItem[]> {
    const env = getServerEnv();
    const raw = await requestPayment<{ body?: unknown }>({
      url: `${env.paymentApiBaseUrl}/consumer/payment-cards`,
      method: 'GET',
      accessToken,
      acceptLanguage,
    });
    return mapPaymentCardList(raw.body);
  },

  async createPaymentCard({
    accessToken,
    acceptLanguage = 'EN',
    platform = 'UNIFIED',
    provider,
    serviceCode = 'ST_EXPRESS',
  }: PaymentAuthContext &
    CreatePaymentCardPayload): Promise<CreatePaymentCardResult> {
    const env = getServerEnv();
    const raw = await requestPayment<{
      body?: { redirect_url?: string | null };
    }>({
      url: `${env.paymentApiBaseUrl}/consumer/payment-cards`,
      method: 'POST',
      accessToken,
      acceptLanguage,
      data: { platform, provider, service_code: serviceCode },
    });
    return { redirectUrl: raw.body?.redirect_url?.trim() || undefined };
  },

  async configurePaymentCard({
    accessToken,
    acceptLanguage = 'EN',
    paymentCardId,
    isDefault,
  }: PaymentAuthContext & {
    paymentCardId: string;
    isDefault: boolean;
  }): Promise<void> {
    const env = getServerEnv();
    await requestPayment<unknown>({
      url: `${env.paymentApiBaseUrl}/consumer/payment-cards/${encodeURIComponent(paymentCardId)}/setting`,
      method: 'POST',
      accessToken,
      acceptLanguage,
      data: { is_default: isDefault },
    });
  },

  async deletePaymentCard({
    accessToken,
    acceptLanguage = 'EN',
    paymentCardId,
  }: PaymentAuthContext & { paymentCardId: string }): Promise<void> {
    const env = getServerEnv();
    await requestPayment<unknown>({
      url: `${env.paymentApiBaseUrl}/consumer/payment-cards/${encodeURIComponent(paymentCardId)}/delete`,
      method: 'POST',
      accessToken,
      acceptLanguage,
    });
  },

  async getPaymentDetail({
    accessToken,
    acceptLanguage = 'EN',
    paymentId,
  }: PaymentAuthContext & {
    paymentId: string;
  }): Promise<PaymentDetailRecord | null> {
    const env = getServerEnv();
    try {
      const raw = await requestPayment<{ body?: unknown }>({
        url: `${env.paymentApiBaseUrl}/consumer/payments/${encodeURIComponent(paymentId)}/detail`,
        method: 'GET',
        accessToken,
        acceptLanguage,
      });
      return mapPaymentDetailRecord(raw.body);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) return null;
      if (err instanceof Error && 'statusCode' in err && (err as { statusCode?: number }).statusCode === 404) {
        return null;
      }
      throw err;
    }
  },
};
