import 'server-only';
import {
  BookingFeeQuote,
  BookingOrder,
  CreateBookingPayload,
  DashboardStatistics,
  DeliverySpeedOption,
  GeoCoordinates,
} from '@/features/booking/types/booking-types';
import { SessionData } from '@/features/auth/types/auth-types';
import { PaginatedResponse } from '@/types/api-types';
import { ConsumerOrderFilter } from '@/server/integrations/wing-order-types';
import { computeDashboardStatistics } from '@/server/integrations/wing-order-mapper';
import { wingOrderIntegration } from '@/server/integrations/wing-order-integration';
import { wingExpressIntegration } from '@/server/integrations/wing-express-integration';
import { ConsumerApiError } from '@/server/lib/api-response';
import { getServerEnv } from '@/server/lib/env';
import { inMemoryStore } from '@/server/lib/mock-booking-store';
import { extractUiStatusesFromFilters } from '@/features/booking/services/booking-order-filter';

async function submitLiveBooking(
  payload: CreateBookingPayload,
  session: SessionData,
  acceptLanguage?: string,
): Promise<BookingOrder> {
  const ctx = {
    accessToken: session.accessToken,
    acceptLanguage,
    payload,
    fallbackPhone: session.user?.phoneNumber,
    fallbackSenderName: session.user?.name,
  };

  if (payload.isDraft) {
    return wingOrderIntegration.createOrder(ctx);
  }

  const existingOrderId = payload.draftOrderId?.trim();
  const baseOrder = existingOrderId
    ? await wingOrderIntegration.updateOrder({ ...ctx, orderId: existingOrderId })
    : await wingOrderIntegration.createOrder(ctx);

  const updatedOrder =
    !existingOrderId && payload.paymentMethod
      ? await wingOrderIntegration.updateOrder({ ...ctx, orderId: baseOrder.id })
      : baseOrder;

  const checkout = await wingOrderIntegration.checkoutOrder({
    accessToken: session.accessToken,
    acceptLanguage,
    orderId: baseOrder.id,
    metadata: {
      ...(payload.promoCode ? { promo_code: payload.promoCode } : {}),
      ...(payload.tipAmount ? { tip_amount: payload.tipAmount } : {}),
    },
  });

  const refreshed = await wingOrderIntegration
    .getOrder({ accessToken: session.accessToken, acceptLanguage, orderId: baseOrder.id })
    .catch(() => null);

  const resolved = refreshed || updatedOrder;
  return {
    ...resolved,
    status: resolved.status === 'draft' ? 'pending' : resolved.status,
    paymentId: checkout.paymentId || resolved.paymentId,
    paymentRedirectUrl: checkout.paymentRedirectUrl || resolved.paymentRedirectUrl,
  };
}

export const bookingServerService = {
  async calculateFee(
    pickup: GeoCoordinates,
    dropoff: GeoCoordinates,
    accessToken?: string,
    options?: { additionalStopsCount?: number; deliveryOption?: DeliverySpeedOption },
  ): Promise<BookingFeeQuote> {
    const env = getServerEnv();
    if (env.mockUpstreamApi) {
      return inMemoryStore.calculateFee(pickup, dropoff, options);
    }
    try {
      return await wingExpressIntegration.calculateFee(pickup, dropoff, accessToken, options);
    } catch {
      return inMemoryStore.calculateFee(pickup, dropoff, options);
    }
  },

  async listBookings(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    page?: number;
    rpp?: number;
    direction?: 'ASC' | 'DESC';
    property?: string;
    search?: string;
    status?: string;
    filter?: ConsumerOrderFilter[];
  }): Promise<PaginatedResponse<BookingOrder>> {
    const env = getServerEnv();
    const page = params.page ?? 1;
    const rpp = params.rpp ?? 10;

    if (!env.mockOrderApi) {
      if (!params.session?.accessToken) {
        throw new ConsumerApiError('Please sign in to view bookings', 401);
      }
      return wingOrderIntegration.listOrders({
        accessToken: params.session.accessToken,
        acceptLanguage: params.acceptLanguage,
        page,
        rpp,
        direction: params.direction,
        property: params.property,
        search: params.search,
        status: params.status,
        filter: params.filter,
      });
    }

    if (!env.mockUpstreamApi) {
      try {
        return await wingExpressIntegration.getBookings(
          { search: params.search, status: params.status, page, limit: rpp },
          params.session?.accessToken,
        );
      } catch {
        // Fallback to in-memory store
      }
    }

    const result = inMemoryStore.getOrders({
      search: params.search,
      status: params.status,
      statuses: extractUiStatusesFromFilters(params.filter),
      page,
      limit: rpp,
    });
    return {
      items: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  },

  async getBookingsPageData(session: SessionData | null): Promise<{
    orders: BookingOrder[];
    total: number;
    totalPages: number;
    stats: DashboardStatistics;
  }> {
    const env = getServerEnv();
    if (!env.mockOrderApi && !session?.accessToken) {
      return { orders: [], total: 0, totalPages: 1, stats: computeDashboardStatistics([]) };
    }

    const bookings = await this.listBookings({ session, page: 1, rpp: 10 }).catch(() => ({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    }));

    return {
      orders: bookings.items,
      total: bookings.pagination.total,
      totalPages: bookings.pagination.totalPages,
      stats: env.mockOrderApi
        ? inMemoryStore.getStatistics()
        : computeDashboardStatistics(bookings.items),
    };
  },

  async getBookingById(
    bookingId: string,
    options?: { session?: SessionData | null; acceptLanguage?: string },
  ): Promise<BookingOrder | null> {
    const env = getServerEnv();
    if (!env.mockOrderApi) {
      if (!options?.session?.accessToken) {
        throw new ConsumerApiError('Unauthorized', 401);
      }
      return wingOrderIntegration.getOrder({
        accessToken: options.session.accessToken,
        acceptLanguage: options.acceptLanguage,
        orderId: bookingId,
      });
    }

    if (!env.mockUpstreamApi) {
      try {
        return await wingExpressIntegration.getBookingById(bookingId, options?.session?.accessToken);
      } catch {
        // Fallback below
      }
    }
    return inMemoryStore.getOrderById(bookingId);
  },

  async getTrackingOrder(trackingId: string): Promise<BookingOrder | null> {
    const env = getServerEnv();
    if (!env.mockUpstreamApi) {
      try {
        return await wingExpressIntegration.getBookingById(trackingId);
      } catch {
        // Fallback below
      }
    }
    return inMemoryStore.getOrderById(trackingId);
  },

  async createBooking(
    payload: CreateBookingPayload,
    options: { session: SessionData | null; acceptLanguage?: string },
  ): Promise<BookingOrder> {
    const env = getServerEnv();
    if (!env.mockOrderApi) {
      if (!options.session?.accessToken) {
        throw new ConsumerApiError('Please sign in to create a delivery order', 401);
      }
      return submitLiveBooking(payload, options.session, options.acceptLanguage);
    }
    if (!env.mockUpstreamApi) {
      try {
        return await wingExpressIntegration.createBooking(payload, options.session?.accessToken);
      } catch {
        // Fallback below
      }
    }
    return inMemoryStore.createBooking(payload);
  },

  async cancelBooking(
    bookingId: string,
    options: { session: SessionData | null; acceptLanguage?: string; reason?: string },
  ): Promise<BookingOrder | null> {
    const env = getServerEnv();
    if (!env.mockOrderApi) {
      if (!options.session?.accessToken) throw new ConsumerApiError('Unauthorized', 401);
      await wingOrderIntegration.cancelOrder({
        accessToken: options.session.accessToken,
        acceptLanguage: options.acceptLanguage,
        orderId: bookingId,
        reason: options.reason,
      });
      return wingOrderIntegration
        .getOrder({ accessToken: options.session.accessToken, acceptLanguage: options.acceptLanguage, orderId: bookingId })
        .catch(() => null);
    }
    return inMemoryStore.cancelOrder(bookingId, options.reason);
  },

  async checkoutBooking(
    bookingId: string,
    options: { session: SessionData | null; acceptLanguage?: string; metadata?: Record<string, unknown> },
  ) {
    const env = getServerEnv();
    if (env.mockOrderApi) return { paymentId: undefined, paymentRedirectUrl: undefined };
    if (!options.session?.accessToken) throw new ConsumerApiError('Unauthorized', 401);
    return wingOrderIntegration.checkoutOrder({
      accessToken: options.session.accessToken,
      acceptLanguage: options.acceptLanguage,
      orderId: bookingId,
      metadata: options.metadata,
    });
  },

  async deleteBooking(
    bookingId: string,
    options: { session: SessionData | null; acceptLanguage?: string },
  ): Promise<void> {
    const env = getServerEnv();
    if (env.mockOrderApi) return;
    if (!options.session?.accessToken) throw new ConsumerApiError('Unauthorized', 401);
    await wingOrderIntegration.deleteOrder({
      accessToken: options.session.accessToken,
      acceptLanguage: options.acceptLanguage,
      orderId: bookingId,
    });
  },
};
