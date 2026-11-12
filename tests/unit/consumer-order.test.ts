import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { serverAxios } from '@/lib/axios/server-axios';
import { wingOrderIntegration } from '@/server/integrations/wing-order-integration';
import {
  buildCourierOrderPayload,
  mapCourierOrderListResponse,
  mapCourierOrderToBookingOrder,
} from '@/server/integrations/wing-order-mapper';
import {
  buildOrderStatusFilter,
  extractUiStatusesFromFilters,
  mergeOrderFilters,
  parseBookingOrderFilterParam,
} from '@/features/booking/services/booking-order-filter';
import { ConsumerApiError } from '@/server/lib/api-response';
import { sessionService } from '@/server/lib/session';
import { GET as bookingsGet } from '@/app/api/bookings/route';
import { CreateBookingPayload } from '@/features/booking/types/booking-types';

function makeAxiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function makeAxiosHttpError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    makeAxiosResponse(data, status),
  );
}

const samplePayload: CreateBookingPayload = {
  pickup: {
    id: 'ADD-PICKUP-1',
    name: 'Central Shop',
    address: 'St 310, BKK1, Phnom Penh',
    coordinates: { lat: 11.5512, lng: 104.9256 },
    senderPhone: '012 888 999',
    senderName: 'Sophea',
    riderNote: 'Loading Bay 2',
  },
  dropoff: {
    address: 'TK Avenue, Toul Kork, Phnom Penh',
    coordinates: { lat: 11.5844, lng: 104.8992 },
  },
  dropoffs: [
    {
      id: 'stop-1',
      recipient: {
        name: 'Bopha',
        phoneNumber: '012 998 877',
        notes: 'Call at gate',
      },
      dropoff: {
        address: 'TK Avenue, Toul Kork, Phnom Penh',
        coordinates: { lat: 11.5844, lng: 104.8992 },
      },
      codAmount: 18.5,
      parcelNote: 'Fragile skincare box',
    },
  ],
  deliveryOption: 'instant',
  recipient: { name: 'Bopha', phoneNumber: '012 998 877', notes: 'Call at gate' },
  parcel: {
    sellerOrderRef: 'LIVE-0914',
    description: 'Skincare Set',
    quantity: 1,
    itemCategory: 'Cosmetics',
  },
  cod: { isCod: true, amount: 18.5 },
  idempotencyKey: 'idem-order-1',
  feeQuote: {
    baseFee: 1.75,
    distanceKm: 4.2,
    totalDeliveryFee: 2.25,
    deliverySpeed: 'instant',
  },
  paymentMethod: 'khqr',
  discountAmount: 0.5,
  tipAmount: 0.25,
  finalFee: 2.0,
};

describe('Wing Consumer Courier Order Integration & Filters', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.WING_EXPRESS_API_URL = 'https://qa.wingmall.com';
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('builds courier payload keeping COD separated from seller delivery fee', () => {
    const body = buildCourierOrderPayload(
      {
        ...samplePayload,
        pickup: {
          ...samplePayload.pickup,
          settlementAccountName: 'Sophea Beauty Shop',
          settlementAccountNumber: '012 345 678',
        },
      },
      {
        includePaymentMethod: true,
      },
    );

    expect(body.subtotal).toBe(2.25);
    expect(body.discount_amount).toBe(0.5);
    expect(body.total_amount).toBe(2.0);
    expect(body.is_using_cod).toBe(true);
    expect(body.total_collect_payment).toBe(18.5);
    expect(body.payment_method).toBe('khqr');
    expect(body.sender).toMatchObject({
      settlement_bank: 'WING',
      settlement_account_name: 'Sophea Beauty Shop',
      settlement_account_number: '012345678',
    });
    expect(Array.isArray(body.receivers)).toBe(true);
    expect((body.receivers as Record<string, unknown>[])[0]).toMatchObject({
      phone_number: '012998877',
      collect_payment_amount: 18.5,
    });
  });

  it('defaults sender settlement fields to null and empty strings when Wing Bank is omitted', () => {
    const body = buildCourierOrderPayload({
      ...samplePayload,
      cod: { isCod: false, amount: 0 },
      dropoffs: samplePayload.dropoffs?.map((s) => ({ ...s, codAmount: 0 })),
    });

    expect(body.sender).toMatchObject({
      settlement_bank: null,
      settlement_account_name: '',
      settlement_account_number: '',
    });
  });

  it('creates, updates, checks out, and fetches courier order via serverAxios', async () => {
    const requestSpy = vi
      .spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: {
            order_id: 'ORD-900',
            order_number: 'WE-900',
            tracking_number: 'TRK-900',
            order_status: 'DRAFT',
            total_amount: 2.0,
            is_using_cod: true,
            total_collect_payment: 18.5,
          },
        }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: {
            order_id: 'ORD-900',
            order_status: 'DRAFT',
            total_amount: 2.0,
          },
        }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: {
            payment_id: 'PAY-900',
            payment_redirect_url: 'https://pay.wing.com/PAY-900',
          },
        }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: {
            order_id: 'ORD-900',
            tracking_number: 'TRK-900',
            order_status: 'PENDING',
            total_amount: 2.0,
            payment: { payment_id: 'PAY-900', payment_status: 'PAID' },
          },
        }),
      );

    const created = await wingOrderIntegration.createOrder({
      accessToken: 'tok-order',
      payload: samplePayload,
    });
    expect(created.id).toBe('ORD-900');
    expect(created.status).toBe('draft');
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      url: 'https://qa.wingmall.com/order/v1/consumer/orders/courier',
      method: 'POST',
    });

    await wingOrderIntegration.updateOrder({
      accessToken: 'tok-order',
      orderId: 'ORD-900',
      payload: samplePayload,
    });
    expect(requestSpy.mock.calls[1][0]).toMatchObject({
      url: 'https://qa.wingmall.com/order/v1/consumer/orders/courier/ORD-900/update',
      method: 'POST',
    });

    const checkout = await wingOrderIntegration.checkoutOrder({
      accessToken: 'tok-order',
      orderId: 'ORD-900',
      metadata: { promo_code: 'WINGEXPRESS' },
    });
    expect(checkout).toEqual({
      paymentId: 'PAY-900',
      paymentRedirectUrl: 'https://pay.wing.com/PAY-900',
    });
    expect(requestSpy.mock.calls[2][0]).toMatchObject({
      url: 'https://qa.wingmall.com/order/v1/consumer/orders/courier/ORD-900/checkout',
      method: 'POST',
      data: { metadata: { promo_code: 'WINGEXPRESS' } },
    });

    const fetched = await wingOrderIntegration.getOrder({
      accessToken: 'tok-order',
      orderId: 'ORD-900',
    });
    expect(fetched?.paymentStatus).toBe('paid');
    expect(fetched?.paymentId).toBe('PAY-900');

    const mapped = mapCourierOrderToBookingOrder({
      order_id: 'ORD-EMPTY',
      order_status: 'OUT_FOR_DELIVERY',
    });
    expect(mapped.status).toBe('out_for_delivery');
  });

  it('supports cancel, delete, and raises ConsumerApiError on failure responses', async () => {
    const requestSpy = vi
      .spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(makeAxiosResponse({ result: true, body: {} }))
      .mockRejectedValueOnce(
        makeAxiosHttpError(400, {
          result: false,
          result_message: 'Order already picked up',
        }),
      );

    await wingOrderIntegration.cancelOrder({
      accessToken: 'qa-token',
      orderId: 'ORD-1',
      reason: 'Customer changed mind',
    });

    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      url: 'https://qa.wingmall.com/order/v1/consumer/orders/courier/ORD-1/cancel',
      method: 'POST',
      data: { reason: 'Customer changed mind' },
    });

    await expect(
      wingOrderIntegration.deleteOrder({
        accessToken: 'qa-token',
        orderId: 'ORD-1',
      }),
    ).rejects.toThrowError(ConsumerApiError);

    expect(mapCourierOrderListResponse(null, 1, 10).items).toEqual([]);
  });

  it('parses, merges, and validates Wing courier filter parameters cleanly', () => {
    const rawFilter = JSON.stringify([
      { field: 'order_status', values: ['DRAFT'], condition: 'IN' },
    ]);
    expect(parseBookingOrderFilterParam(rawFilter)).toEqual({
      filters: [{ field: 'order_status', values: ['DRAFT'], condition: 'IN' }],
    });

    expect(parseBookingOrderFilterParam('{not-valid-json').error).toMatch(
      /JSON array/i,
    );
    expect(
      parseBookingOrderFilterParam(JSON.stringify([{ field: '', values: [] }])).error,
    ).toBeTruthy();

    expect(buildOrderStatusFilter('all')).toBeUndefined();
    expect(buildOrderStatusFilter('draft,pending')).toEqual([
      { field: 'order_status', values: ['DRAFT', 'PENDING'], condition: 'IN' },
    ]);

    const merged = mergeOrderFilters(
      [{ field: 'courier_type', values: ['instant_delivery'], condition: 'EQUALS' }],
      'draft',
    );
    expect(merged).toEqual([
      { field: 'courier_type', values: ['instant_delivery'], condition: 'EQUALS' },
      { field: 'order_status', values: ['DRAFT'], condition: 'IN' },
    ]);
    expect(extractUiStatusesFromFilters(merged)).toEqual(['draft']);
  });

  it('forwards Wing filter, rpp, direction, and property on GET /api/bookings', async () => {
    process.env.MOCK_ORDER_API = 'false';

    vi.spyOn(sessionService, 'getSession').mockResolvedValue({
      user: { id: 'USR-1', name: 'Seller', phoneNumber: '012888999' },
      accessToken: 'live-token',
      expiresAt: Date.now() + 60_000,
    });

    const requestSpy = vi.spyOn(serverAxios, 'request').mockResolvedValue(
      makeAxiosResponse({
        result: true,
        body: { records: 0, pages: 1, page: 1, data: [] },
      }),
    );

    const filterJson = encodeURIComponent(
      JSON.stringify([{ field: 'order_status', values: ['DRAFT'], condition: 'IN' }]),
    );
    const req = new Request(
      `http://localhost:3000/api/bookings?page=1&rpp=10&direction=ASC&property=price&filter=${filterJson}`,
    );
    const res = await bookingsGet(req);

    expect(res.status).toBe(200);
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      url: 'https://qa.wingmall.com/order/v1/consumer/orders/courier',
      method: 'GET',
      params: {
        page: 1,
        rpp: 10,
        direction: 'ASC',
        property: 'price',
        filter: JSON.stringify([
          { field: 'order_status', values: ['DRAFT'], condition: 'IN' },
        ]),
      },
    });

    const legacyReq = new Request(
      'http://localhost:3000/api/bookings?page=2&limit=15&status=pending&search=Sokha',
    );
    const legacyRes = await bookingsGet(legacyReq);
    expect(legacyRes.status).toBe(200);
    expect(requestSpy.mock.calls[1][0]).toMatchObject({
      params: {
        page: 2,
        rpp: 15,
        search: 'Sokha',
        filter: JSON.stringify([
          { field: 'order_status', values: ['PENDING'], condition: 'IN' },
        ]),
      },
    });

    const badReq = new Request('http://localhost:3000/api/bookings?filter=not-json');
    const badRes = await bookingsGet(badReq);
    expect(badRes.status).toBe(400);
  });
});
