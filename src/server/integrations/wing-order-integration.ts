import 'server-only';
import { isAxiosError } from 'axios';
import { serverAxios } from '@/lib/axios/server-axios';
import { BookingOrder, CreateBookingPayload } from '@/features/booking/types/booking-types';
import { PaginatedResponse } from '@/types/api-types';
import { mergeOrderFilters } from '@/features/booking/services/booking-order-filter';
import { getServerEnv } from '@/server/lib/env';
import {
  buildUnifiedHeaders,
  handleUnifiedAxiosError,
  unwrapUnifiedAxiosData,
} from '@/server/lib/unified-http';
import {
  buildCourierOrderPayload,
  ConsumerOrderFilter,
  ConsumerOrderRecord,
  mapCourierOrderListResponse,
  mapCourierOrderToBookingOrder,
} from './wing-order-mapper';

export interface CourierOrderAuthContext {
  accessToken: string;
  acceptLanguage?: string;
}

export interface ListCourierOrdersOptions extends CourierOrderAuthContext {
  page?: number;
  rpp?: number;
  direction?: 'ASC' | 'DESC';
  property?: string;
  search?: string;
  status?: string;
  filter?: ConsumerOrderFilter[];
}

export interface CreateCourierOrderOptions extends CourierOrderAuthContext {
  payload: CreateBookingPayload;
  fallbackPhone?: string;
  fallbackSenderName?: string;
}

export interface CheckoutCourierOrderResponse {
  paymentId?: string;
  paymentRedirectUrl?: string;
}

const ORDER_ERROR = 'Unable to reach Consumer Order Service. Please try again.';

export const wingOrderIntegration = {
  async createOrder({
    accessToken,
    acceptLanguage = 'EN',
    payload,
    fallbackPhone,
    fallbackSenderName,
  }: CreateCourierOrderOptions): Promise<BookingOrder> {
    const env = getServerEnv();
    const requestBody = buildCourierOrderPayload(payload, {
      fallbackPhone,
      fallbackSenderName,
      includePaymentMethod: false,
    });

    try {
      const response = await serverAxios.request<{
        order_id?: string;
        body?: ConsumerOrderRecord;
      }>({
        url: `${env.orderApiBaseUrl}/consumer/orders/courier`,
        method: 'POST',
        data: requestBody,
        headers: buildUnifiedHeaders({
          accessToken,
          acceptLanguage,
          includeJsonContentType: true,
        }),
      });
      const rawData = unwrapUnifiedAxiosData<{
        order_id?: string;
        body?: ConsumerOrderRecord;
      }>(response.data, response.status);
      const record: ConsumerOrderRecord = {
        ...(rawData.body || {}),
        order_id: rawData.body?.order_id || rawData.order_id,
      };
      return mapCourierOrderToBookingOrder(record, payload);
    } catch (err: unknown) {
      handleUnifiedAxiosError(err, ORDER_ERROR);
    }
  },

  async updateOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
    payload,
    fallbackPhone,
    fallbackSenderName,
  }: CreateCourierOrderOptions & { orderId: string }): Promise<BookingOrder> {
    const env = getServerEnv();
    const requestBody = buildCourierOrderPayload(payload, {
      fallbackPhone,
      fallbackSenderName,
      orderId,
      includePaymentMethod: !payload.isDraft,
    });

    try {
      const response = await serverAxios.request<{ body?: ConsumerOrderRecord }>({
        url: `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/update`,
        method: 'POST',
        data: requestBody,
        headers: buildUnifiedHeaders({
          accessToken,
          acceptLanguage,
          includeJsonContentType: true,
        }),
      });
      const rawData = unwrapUnifiedAxiosData<{ body?: ConsumerOrderRecord }>(
        response.data,
        response.status,
      );
      const record: ConsumerOrderRecord = {
        ...(rawData.body || {}),
        order_id: rawData.body?.order_id || orderId,
      };
      return mapCourierOrderToBookingOrder(record, payload);
    } catch (err: unknown) {
      handleUnifiedAxiosError(err, ORDER_ERROR);
    }
  },

  async checkoutOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
    metadata = {},
  }: CourierOrderAuthContext & {
    orderId: string;
    metadata?: Record<string, unknown>;
  }): Promise<CheckoutCourierOrderResponse> {
    const env = getServerEnv();
    try {
      const response = await serverAxios.request<{
        body?: { payment_id?: string | null; payment_redirect_url?: string | null };
      }>({
        url: `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/checkout`,
        method: 'POST',
        data: { metadata },
        headers: buildUnifiedHeaders({
          accessToken,
          acceptLanguage,
          includeJsonContentType: true,
        }),
      });
      const rawData = unwrapUnifiedAxiosData<{
        body?: { payment_id?: string | null; payment_redirect_url?: string | null };
      }>(response.data, response.status);
      return {
        paymentId: rawData.body?.payment_id || undefined,
        paymentRedirectUrl: rawData.body?.payment_redirect_url || undefined,
      };
    } catch (err: unknown) {
      handleUnifiedAxiosError(err, ORDER_ERROR);
    }
  },

  async getOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
  }: CourierOrderAuthContext & { orderId: string }): Promise<BookingOrder | null> {
    const env = getServerEnv();
    try {
      const response = await serverAxios.request<{ body?: ConsumerOrderRecord }>({
        url: `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}`,
        method: 'GET',
        headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
      });
      const rawData = unwrapUnifiedAxiosData<{ body?: ConsumerOrderRecord }>(
        response.data,
        response.status,
      );
      if (!rawData.body) return null;
      return mapCourierOrderToBookingOrder(rawData.body);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) return null;
      handleUnifiedAxiosError(err, ORDER_ERROR);
    }
  },

  async listOrders({
    accessToken,
    acceptLanguage = 'EN',
    page = 1,
    rpp = 10,
    direction,
    property,
    search,
    status,
    filter,
  }: ListCourierOrdersOptions): Promise<PaginatedResponse<BookingOrder>> {
    const env = getServerEnv();
    const activeFilter = mergeOrderFilters(filter, status);
    try {
      const response = await serverAxios.request<{ body?: unknown }>({
        url: `${env.orderApiBaseUrl}/consumer/orders/courier`,
        method: 'GET',
        params: {
          page,
          rpp,
          ...(direction ? { direction } : {}),
          ...(property ? { property } : {}),
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(activeFilter && activeFilter.length > 0
            ? { filter: JSON.stringify(activeFilter) }
            : {}),
        },
        headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
      });
      const rawData = unwrapUnifiedAxiosData<{ body?: unknown }>(
        response.data,
        response.status,
      );
      return mapCourierOrderListResponse(rawData.body, page, rpp);
    } catch (err: unknown) {
      handleUnifiedAxiosError(err, ORDER_ERROR);
    }
  },

  async cancelOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
    reason,
  }: CourierOrderAuthContext & { orderId: string; reason?: string }): Promise<void> {
    const env = getServerEnv();
    try {
      const response = await serverAxios.request<unknown>({
        url: `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/cancel`,
        method: 'POST',
        data: { reason: reason?.trim() || 'Cancelled by seller' },
        headers: buildUnifiedHeaders({
          accessToken,
          acceptLanguage,
          includeJsonContentType: true,
        }),
      });
      unwrapUnifiedAxiosData<unknown>(response.data, response.status);
    } catch (err: unknown) {
      handleUnifiedAxiosError(err, ORDER_ERROR);
    }
  },

  async deleteOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
  }: CourierOrderAuthContext & { orderId: string }): Promise<void> {
    const env = getServerEnv();
    try {
      const response = await serverAxios.request<unknown>({
        url: `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/delete`,
        method: 'POST',
        headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
      });
      unwrapUnifiedAxiosData<unknown>(response.data, response.status);
    } catch (err: unknown) {
      handleUnifiedAxiosError(err, ORDER_ERROR);
    }
  },
};

