import 'server-only';
import { BookingOrder, CreateBookingPayload } from '@/features/booking/types/booking-types';
import { PaginatedResponse } from '@/types/api-types';
import { getServerEnv } from '../config/server-env';
import { ConsumerApiError } from './consumer-api-client';
import { buildUnifiedHeaders, parseUnifiedResponse } from './unified-api-http';
import {
  buildCourierOrderPayload,
  buildOrderStatusFilter,
  ConsumerOrderFilter,
  ConsumerOrderRecord,
  mapCourierOrderListResponse,
  mapCourierOrderToBookingOrder,
} from './consumer-order-mapper';

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

function handleOrderError(err: unknown): never {
  if (err instanceof ConsumerApiError) throw err;
  throw new ConsumerApiError(
    'Unable to reach Consumer Order Service. Please try again.',
    503,
  );
}

export const consumerOrderClient = {
  /**
   * Creates a new consumer courier order (`POST /order/v1/consumer/orders/courier`).
   * When `payment_method` is null/omitted, backend creates it in `DRAFT` state.
   */
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
      const response = await fetch(`${env.orderApiBaseUrl}/consumer/orders/courier`, {
        method: 'POST',
        headers: buildUnifiedHeaders({
          accessToken,
          acceptLanguage,
          includeJsonContentType: true,
        }),
        body: JSON.stringify(requestBody),
        cache: 'no-store',
      });

      const rawData = await parseUnifiedResponse<{
        order_id?: string;
        body?: ConsumerOrderRecord;
      }>(response);
      const record: ConsumerOrderRecord = {
        ...(rawData.body || {}),
        order_id: rawData.body?.order_id || rawData.order_id,
      };
      return mapCourierOrderToBookingOrder(record, payload);
    } catch (err: unknown) {
      handleOrderError(err);
    }
  },

  /**
   * Updates an existing courier order or draft (`POST /order/v1/consumer/orders/courier/:orderId/update`).
   */
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
      const response = await fetch(
        `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/update`,
        {
          method: 'POST',
          headers: buildUnifiedHeaders({
            accessToken,
            acceptLanguage,
            includeJsonContentType: true,
          }),
          body: JSON.stringify(requestBody),
          cache: 'no-store',
        },
      );

      const rawData = await parseUnifiedResponse<{ body?: ConsumerOrderRecord }>(
        response,
      );
      const record: ConsumerOrderRecord = {
        ...(rawData.body || {}),
        order_id: rawData.body?.order_id || orderId,
      };
      return mapCourierOrderToBookingOrder(record, payload);
    } catch (err: unknown) {
      handleOrderError(err);
    }
  },

  /**
   * Checks out an order (`POST /order/v1/consumer/orders/courier/:orderId/checkout`).
   */
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
      const response = await fetch(
        `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/checkout`,
        {
          method: 'POST',
          headers: buildUnifiedHeaders({
            accessToken,
            acceptLanguage,
            includeJsonContentType: true,
          }),
          body: JSON.stringify({ metadata }),
          cache: 'no-store',
        },
      );

      const rawData = await parseUnifiedResponse<{
        body?: { payment_id?: string | null; payment_redirect_url?: string | null };
      }>(response);

      return {
        paymentId: rawData.body?.payment_id || undefined,
        paymentRedirectUrl: rawData.body?.payment_redirect_url || undefined,
      };
    } catch (err: unknown) {
      handleOrderError(err);
    }
  },

  /**
   * Retrieves single courier order details (`GET /order/v1/consumer/orders/courier/:orderId`).
   */
  async getOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
  }: CourierOrderAuthContext & { orderId: string }): Promise<BookingOrder | null> {
    const env = getServerEnv();

    try {
      const response = await fetch(
        `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}`,
        {
          method: 'GET',
          headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
          cache: 'no-store',
        },
      );

      if (response.status === 404) return null;
      const rawData = await parseUnifiedResponse<{ body?: ConsumerOrderRecord }>(
        response,
      );
      if (!rawData.body) return null;
      return mapCourierOrderToBookingOrder(rawData.body);
    } catch (err: unknown) {
      if (err instanceof ConsumerApiError && err.statusCode === 404) return null;
      handleOrderError(err);
    }
  },

  /**
   * Lists, searches, and filters consumer courier orders (`GET /order/v1/consumer/orders/courier`).
   */
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
    const url = new URL(`${env.orderApiBaseUrl}/consumer/orders/courier`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('rpp', String(rpp));
    if (direction) url.searchParams.set('direction', direction);
    if (property) url.searchParams.set('property', property);
    if (search?.trim()) url.searchParams.set('search', search.trim());

    const activeFilter = filter || buildOrderStatusFilter(status);
    if (activeFilter && activeFilter.length > 0) {
      url.searchParams.set('filter', JSON.stringify(activeFilter));
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
        cache: 'no-store',
      });

      const rawData = await parseUnifiedResponse<{ body?: unknown }>(response);
      return mapCourierOrderListResponse(rawData.body, page, rpp);
    } catch (err: unknown) {
      handleOrderError(err);
    }
  },

  /**
   * Cancels a courier order (`POST /order/v1/consumer/orders/courier/:orderId/cancel`).
   */
  async cancelOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
    reason,
  }: CourierOrderAuthContext & {
    orderId: string;
    reason?: string;
  }): Promise<void> {
    const env = getServerEnv();

    try {
      const response = await fetch(
        `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/cancel`,
        {
          method: 'POST',
          headers: buildUnifiedHeaders({
            accessToken,
            acceptLanguage,
            includeJsonContentType: true,
          }),
          body: JSON.stringify({
            reason: reason?.trim() || 'Cancelled by seller',
          }),
          cache: 'no-store',
        },
      );

      await parseUnifiedResponse<unknown>(response);
    } catch (err: unknown) {
      handleOrderError(err);
    }
  },

  /**
   * Deletes an order or draft (`POST /order/v1/consumer/orders/courier/:orderId/delete`).
   */
  async deleteOrder({
    accessToken,
    acceptLanguage = 'EN',
    orderId,
  }: CourierOrderAuthContext & { orderId: string }): Promise<void> {
    const env = getServerEnv();

    try {
      const response = await fetch(
        `${env.orderApiBaseUrl}/consumer/orders/courier/${encodeURIComponent(orderId)}/delete`,
        {
          method: 'POST',
          headers: buildUnifiedHeaders({ accessToken, acceptLanguage }),
          cache: 'no-store',
        },
      );

      await parseUnifiedResponse<unknown>(response);
    } catch (err: unknown) {
      handleOrderError(err);
    }
  },

  /**
   * Orchestrates express order submission:
   * creates a new order (or updates an existing draft), applies final payment method,
   * executes checkout, and fetches normalized order details.
   */
  async createAndCheckoutOrder(
    options: CreateCourierOrderOptions,
  ): Promise<BookingOrder> {
    const existingOrderId = options.payload.draftOrderId?.trim();
    const baseOrder = existingOrderId
      ? await consumerOrderClient.updateOrder({ ...options, orderId: existingOrderId })
      : await consumerOrderClient.createOrder(options);

    const updatedOrder =
      !existingOrderId && options.payload.paymentMethod
        ? await consumerOrderClient.updateOrder({
            ...options,
            orderId: baseOrder.id,
          })
        : baseOrder;

    const checkout = await consumerOrderClient.checkoutOrder({
      accessToken: options.accessToken,
      acceptLanguage: options.acceptLanguage,
      orderId: baseOrder.id,
      metadata: {
        ...(options.payload.promoCode ? { promo_code: options.payload.promoCode } : {}),
        ...(options.payload.tipAmount ? { tip_amount: options.payload.tipAmount } : {}),
      },
    });

    const refreshed = await consumerOrderClient
      .getOrder({
        accessToken: options.accessToken,
        acceptLanguage: options.acceptLanguage,
        orderId: baseOrder.id,
      })
      .catch(() => null);

    const resolved = refreshed || updatedOrder;
    return {
      ...resolved,
      status: resolved.status === 'draft' ? 'pending' : resolved.status,
      paymentId: checkout.paymentId || resolved.paymentId,
      paymentRedirectUrl: checkout.paymentRedirectUrl || resolved.paymentRedirectUrl,
    };
  },
};

