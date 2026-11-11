import 'server-only';
import {
  CreatePaymentCardPayload,
  CreatePaymentCardResult,
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';
import { getServerEnv } from '../config/server-env';
import { ConsumerApiError } from './consumer-api-client';
import { buildUnifiedHeaders, parseUnifiedResponse } from './unified-api-http';
import {
  mapPaymentAvailability,
  mapPaymentCardList,
  mapPaymentDetailRecord,
  mapPaymentOptionList,
} from './consumer-payment-mapper';

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

function handlePaymentError(err: unknown): never {
  if (err instanceof ConsumerApiError) throw err;
  throw new ConsumerApiError(
    'Unable to reach Payment Service. Please try again.',
    503,
  );
}

export const consumerPaymentClient = {
  /**
   * Lists payment options for a service type (`GET /payment/v1/consumer/payment-options/:serviceType`).
   */
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
    const url = new URL(
      `${env.paymentApiBaseUrl}/consumer/payment-options/${encodeURIComponent(serviceType)}`,
    );
    if (page !== undefined) url.searchParams.set('page', String(page));
    if (rpp !== undefined) url.searchParams.set('rpp', String(rpp));
    if (direction) url.searchParams.set('direction', direction);
    if (property) url.searchParams.set('property', property);
    if (search) url.searchParams.set('search', search);
    if (filter) url.searchParams.set('filter', filter);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
        cache: 'no-store',
      });
      const rawData = await parseUnifiedResponse<{ body?: unknown }>(response);
      return mapPaymentOptionList(rawData.body, acceptLanguage);
    } catch (err: unknown) {
      handlePaymentError(err);
    }
  },

  /**
   * Checks provider availability (`GET /payment/v1/consumer/payment-options/:providerCode/availability`).
   */
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
    const url = new URL(
      `${env.paymentApiBaseUrl}/consumer/payment-options/${encodeURIComponent(providerCode)}/availability`,
    );
    url.searchParams.set('service_type', serviceType);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
        cache: 'no-store',
      });
      const rawData = await parseUnifiedResponse<{ body?: unknown }>(response);
      return mapPaymentAvailability(
        rawData.body,
        providerCode,
        serviceType,
        acceptLanguage,
      );
    } catch (err: unknown) {
      handlePaymentError(err);
    }
  },

  /**
   * Lists saved payment cards (`GET /payment/v1/consumer/payment-cards`).
   */
  async listPaymentCards({
    accessToken,
    acceptLanguage = 'EN',
  }: PaymentAuthContext): Promise<PaymentCardItem[]> {
    const env = getServerEnv();

    try {
      const response = await fetch(
        `${env.paymentApiBaseUrl}/consumer/payment-cards`,
        {
          method: 'GET',
          headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
          cache: 'no-store',
        },
      );
      const rawData = await parseUnifiedResponse<{ body?: unknown }>(response);
      return mapPaymentCardList(rawData.body);
    } catch (err: unknown) {
      handlePaymentError(err);
    }
  },

  /**
   * Initiates adding/linking a payment card (`POST /payment/v1/consumer/payment-cards`).
   */
  async createPaymentCard({
    accessToken,
    acceptLanguage = 'EN',
    platform = 'UNIFIED',
    provider,
    serviceCode = 'ST_EXPRESS',
  }: PaymentAuthContext &
    CreatePaymentCardPayload): Promise<CreatePaymentCardResult> {
    const env = getServerEnv();

    try {
      const response = await fetch(
        `${env.paymentApiBaseUrl}/consumer/payment-cards`,
        {
          method: 'POST',
          headers: buildUnifiedHeaders({
            accessToken,
            acceptLanguage,
            includeJsonContentType: true,
          }),
          body: JSON.stringify({
            platform,
            provider,
            service_code: serviceCode,
          }),
          cache: 'no-store',
        },
      );
      const rawData = await parseUnifiedResponse<{
        body?: { redirect_url?: string | null };
      }>(response);
      return {
        redirectUrl: rawData.body?.redirect_url?.trim() || undefined,
      };
    } catch (err: unknown) {
      handlePaymentError(err);
    }
  },

  /**
   * Updates card settings such as default flag (`POST /payment/v1/consumer/payment-cards/:paymentCardId/setting`).
   */
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

    try {
      const response = await fetch(
        `${env.paymentApiBaseUrl}/consumer/payment-cards/${encodeURIComponent(paymentCardId)}/setting`,
        {
          method: 'POST',
          headers: buildUnifiedHeaders({
            accessToken,
            acceptLanguage,
            includeJsonContentType: true,
          }),
          body: JSON.stringify({ is_default: isDefault }),
          cache: 'no-store',
        },
      );
      await parseUnifiedResponse<unknown>(response);
    } catch (err: unknown) {
      handlePaymentError(err);
    }
  },

  /**
   * Deletes a saved payment card (`POST /payment/v1/consumer/payment-cards/:paymentCardId/delete`).
   */
  async deletePaymentCard({
    accessToken,
    acceptLanguage = 'EN',
    paymentCardId,
  }: PaymentAuthContext & { paymentCardId: string }): Promise<void> {
    const env = getServerEnv();

    try {
      const response = await fetch(
        `${env.paymentApiBaseUrl}/consumer/payment-cards/${encodeURIComponent(paymentCardId)}/delete`,
        {
          method: 'POST',
          headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
          cache: 'no-store',
        },
      );
      await parseUnifiedResponse<unknown>(response);
    } catch (err: unknown) {
      handlePaymentError(err);
    }
  },

  /**
   * Fetches payment and transaction details (`GET /payment/v1/consumer/payments/:paymentId/detail`).
   */
  async getPaymentDetail({
    accessToken,
    acceptLanguage = 'EN',
    paymentId,
  }: PaymentAuthContext & {
    paymentId: string;
  }): Promise<PaymentDetailRecord | null> {
    const env = getServerEnv();

    try {
      const response = await fetch(
        `${env.paymentApiBaseUrl}/consumer/payments/${encodeURIComponent(paymentId)}/detail`,
        {
          method: 'GET',
          headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
          cache: 'no-store',
        },
      );
      if (response.status === 404) return null;
      const rawData = await parseUnifiedResponse<{ body?: unknown }>(response);
      return mapPaymentDetailRecord(rawData.body);
    } catch (err: unknown) {
      if (err instanceof ConsumerApiError && err.statusCode === 404)
        return null;
      handlePaymentError(err);
    }
  },
};
