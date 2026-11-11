import { describe, it, expect, vi, afterEach } from 'vitest';
import { consumerOrderClient } from '@/server/api/consumer-order-client';
import {
  buildCourierOrderPayload,
  mapConsumerOrderStatus,
  mapCourierOrderListResponse,
} from '@/server/api/consumer-order-mapper';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { CreateBookingPayload } from '@/features/booking/types/booking-types';

const SAMPLE_PAYLOAD: CreateBookingPayload = {
  pickup: {
    id: 'ADD-PICKUP-1',
    name: 'Main Shop',
    address: 'Preah Monivong Blvd 422, Phnom Penh',
    coordinates: { lat: 11.545133, lng: 104.92203 },
    senderName: 'John Doe',
    senderPhone: '017 788 959',
    riderNote: 'Front gate',
    imageUrl: 'blob:http://localhost/local-only',
  },
  dropoff: {
    addressId: 'ADD-260280000117680',
    address: 'Home 32, Phnom Penh',
    coordinates: { lat: 11.545175, lng: 104.924332 },
  },
  recipient: {
    name: 'Sokha Chan',
    phoneNumber: '077 323 310',
    notes: 'Call before dropoff',
  },
  dropoffs: [
    {
      id: 'stop-1',
      dropoff: {
        addressId: 'ADD-260280000117680',
        address: 'Home 32, Phnom Penh',
        coordinates: { lat: 11.545175, lng: 104.924332 },
      },
      recipient: {
        name: 'Sokha Chan',
        phoneNumber: '077 323 310',
        notes: 'Call before dropoff',
      },
      codAmount: 15,
    },
    {
      id: 'stop-2',
      dropoff: {
        address: 'St 289, Toul Kouk, Phnom Penh',
        coordinates: { lat: 11.5835, lng: 104.899 },
      },
      recipient: {
        name: 'Dara Vong',
        phoneNumber: '012 998 877',
      },
      codAmount: 10,
    },
  ],
  deliveryOption: 'instant',
  parcel: {
    description: 'Apparel Box',
    sellerOrderRef: 'LIVE-0914',
    itemCategory: 'FOOD-AND-DRINK',
    instructions: 'Handle with care',
  },
  cod: { isCod: true, amount: 25 },
  feeQuote: { baseFee: 1.75, distanceKm: 2.5, totalDeliveryFee: 2.5 },
  idempotencyKey: 'idem-1',
  paymentMethod: 'cop',
  discountAmount: 0.5,
  finalFee: 2.0,
};

describe('Consumer Courier Order API Client & Mapper', () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('builds courier order payload matching Wing Order API schema', () => {
    const body = buildCourierOrderPayload(SAMPLE_PAYLOAD, {
      includePaymentMethod: true,
    });

    expect(body.platform).toBe('UNIFIED');
    expect(body.service_type).toBe('ST_EXPRESS');
    expect(body.region_id).toBe('PP01');
    expect(body.courier_type).toBe('instant_delivery');
    expect(body.payment_method).toBe('cash_on_delivery');
    expect(body.is_using_cod).toBe(true);
    expect(body.total_delivery_fee).toBe(2.5);
    expect(body.total_collect_payment).toBe(25);
    expect(body.total_amount).toBe(2.0);
    expect(body.sender).toMatchObject({
      sender_name: 'John Doe',
      phone_number: '017788959',
      pickup_address_id: 'ADD-PICKUP-1',
      pickup_location_name: 'Preah Monivong Blvd 422, Phnom Penh',
      images: [],
    });

    const receivers = body.receivers as Array<Record<string, unknown>>;
    expect(receivers).toHaveLength(2);
    expect(receivers[0]).toMatchObject({
      sequence_num: 1,
      receiver_name: 'Sokha Chan',
      phone_number: '077323310',
      collect_payment_amount: 15,
      dropoff_address_id: 'ADD-260280000117680',
      parcel_type: 'FOOD-AND-DRINK',
    });
    expect(receivers[1]).toMatchObject({
      sequence_num: 2,
      phone_number: '012998877',
      collect_payment_amount: 10,
      dropoff_address_id: '',
    });
  });

  it('orchestrates create -> update -> checkout -> get for new express orders', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: true,
          body: { order_id: 'ORD-NEW-100' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: true,
          body: { order_id: 'ORD-NEW-100', order_status: 'DRAFT' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: true,
          body: {
            payment_id: 'PAY-100',
            payment_redirect_url: 'https://pay.wing.com/PAY-100',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: true,
          body: {
            order_id: 'ORD-NEW-100',
            tracking_number: 'EXP-999111',
            order_number: 'ORD-NO-100',
            order_status: 'PENDING',
            total_delivery_fee: 2.5,
            total_amount: 2.0,
            is_using_cod: true,
            total_collect_payment: 25,
            payment_method: 'cash_on_delivery',
            sender: {
              sender_name: 'John Doe',
              phone_number: '017788959',
              pickup_location_name: 'Preah Monivong Blvd 422, Phnom Penh',
              latitude: 11.545133,
              longitude: 104.92203,
            },
            receivers: [
              {
                id: 'OCR-1',
                sequence_num: 1,
                receiver_name: 'Sokha Chan',
                phone_number: '077323310',
                dropoff_location_name: 'Home 32, Phnom Penh',
                latitude: 11.545175,
                longitude: 104.924332,
                collect_payment_amount: 15,
              },
            ],
          },
        }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const order = await consumerOrderClient.createAndCheckoutOrder({
      accessToken: 'qa-token',
      acceptLanguage: 'EN',
      payload: SAMPLE_PAYLOAD,
    });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe(
      'https://qa.wingmall.com/order/v1/consumer/orders/courier',
    );
    expect((fetchMock.mock.calls[1] as [string])[0]).toBe(
      'https://qa.wingmall.com/order/v1/consumer/orders/courier/ORD-NEW-100/update',
    );
    expect((fetchMock.mock.calls[2] as [string])[0]).toBe(
      'https://qa.wingmall.com/order/v1/consumer/orders/courier/ORD-NEW-100/checkout',
    );
    expect((fetchMock.mock.calls[3] as [string])[0]).toBe(
      'https://qa.wingmall.com/order/v1/consumer/orders/courier/ORD-NEW-100',
    );

    const headers = (fetchMock.mock.calls[0] as [string, RequestInit])[1]
      .headers as Record<string, string>;
    expect(headers['wing-platform']).toBe('UNIFIED');
    expect(headers.Authorization).toBe('Bearer qa-token');

    expect(order.id).toBe('ORD-NEW-100');
    expect(order.trackingNumber).toBe('EXP-999111');
    expect(order.status).toBe('pending');
    expect(order.paymentId).toBe('PAY-100');
    expect(order.paymentRedirectUrl).toBe('https://pay.wing.com/PAY-100');
  });

  it('lists and filters courier drafts using Wing filter query contract', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        result: true,
        body: {
          records: 1,
          pages: 1,
          page: 1,
          data: [
            {
              order_id: 'ORD-DRAFT-1',
              order_number: 'DRF-001',
              order_status: 'DRAFT',
              total_delivery_fee: 1.75,
              is_using_cod: false,
              total_collect_payment: 0,
              sender: {
                pickup_location_name: 'Central Hub',
                phone_number: '012888999',
                latitude: 11.55,
                longitude: 104.92,
              },
              receivers: [
                {
                  id: 'OCR-D1',
                  sequence_num: 1,
                  receiver_name: 'Buyer',
                  phone_number: '012333444',
                  dropoff_location_name: 'BKK1',
                  latitude: 11.551,
                  longitude: 104.925,
                },
              ],
            },
          ],
        },
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const list = await consumerOrderClient.listOrders({
      accessToken: 'qa-token',
      page: 1,
      rpp: 10,
      search: 'Buyer',
      status: 'draft',
    });

    const calledUrl = new URL((fetchMock.mock.calls[0] as [string])[0]);
    expect(calledUrl.pathname).toBe('/order/v1/consumer/orders/courier');
    expect(calledUrl.searchParams.get('page')).toBe('1');
    expect(calledUrl.searchParams.get('rpp')).toBe('10');
    expect(calledUrl.searchParams.get('search')).toBe('Buyer');
    expect(JSON.parse(calledUrl.searchParams.get('filter') || '[]')).toEqual([
      { field: 'order_status', values: ['DRAFT'], condition: 'IN' },
    ]);

    expect(list.items).toHaveLength(1);
    expect(list.items[0].id).toBe('ORD-DRAFT-1');
    expect(list.items[0].status).toBe('draft');
    expect(mapConsumerOrderStatus('OUT_FOR_DELIVERY')).toBe('out_for_delivery');
  });

  it('supports cancel, delete, and raises ConsumerApiError on failure responses', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: true, body: {} }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          result: false,
          result_message: 'Order already picked up',
        }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await consumerOrderClient.cancelOrder({
      accessToken: 'qa-token',
      orderId: 'ORD-1',
      reason: 'Customer changed mind',
    });

    const [cancelUrl, cancelInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(cancelUrl).toBe(
      'https://qa.wingmall.com/order/v1/consumer/orders/courier/ORD-1/cancel',
    );
    expect(JSON.parse(String(cancelInit.body))).toEqual({
      reason: 'Customer changed mind',
    });

    await expect(
      consumerOrderClient.deleteOrder({
        accessToken: 'qa-token',
        orderId: 'ORD-1',
      }),
    ).rejects.toThrowError(ConsumerApiError);

    expect(mapCourierOrderListResponse(null, 1, 10).items).toEqual([]);
  });
});

