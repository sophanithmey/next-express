import { describe, it, expect, vi, afterEach } from 'vitest';
import { consumerPaymentClient } from '@/server/api/consumer-payment-client';
import {
  mapPaymentOptionList,
  resolveLocalizedText,
} from '@/server/api/consumer-payment-mapper';
import { buildCourierOrderPayload } from '@/server/api/consumer-order-mapper';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { fullImageUrl } from '@/lib/image-url';
import { CreateBookingPayload } from '@/features/booking/types/booking-types';

describe('Consumer Payment API Client & Mapper', () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('resolves localized title, subtitle, and unavailable reasons cleanly', () => {
    expect(resolveLocalizedText({ en: 'Wing Bank KHQR', km: 'វីង KHQR' }, 'KM')).toBe(
      'វីង KHQR',
    );
    expect(resolveLocalizedText({ key_0: 'Fast checkout', key_1: 'Zero fee' }, 'EN')).toBe(
      'Fast checkout • Zero fee',
    );

    const options = mapPaymentOptionList(
      [
        {
          id: 'opt-1',
          provider_code: 'cash_on_delivery',
          title: { en: 'Cash on Pickup', km: 'បង់សាច់ប្រាក់' },
          subtitle: { en: 'Pay rider at pickup' },
          logo_path: 'https://cdn.wingmall.com/cop.png',
          subtitle_images: ['https://cdn.wingmall.com/badge.png'],
          is_default: true,
          is_available: true,
        },
        {
          id: 'opt-2',
          provider_code: 'card',
          title: { en: 'Credit / Debit Card' },
          is_default: false,
          is_available: false,
          unavailable_reason: { en: 'Maintenance window' },
        },
      ],
      'EN',
    );

    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({
      id: 'opt-1',
      providerCode: 'cash_on_delivery',
      title: 'Cash on Pickup',
      subtitle: 'Pay rider at pickup',
      isDefault: true,
      isAvailable: true,
    });
    expect(options[1]).toMatchObject({
      providerCode: 'card',
      isAvailable: false,
      unavailableReason: 'Maintenance window',
    });

    const camelOptions = mapPaymentOptionList(
      [
        {
          id: 'opt-3',
          providerCode: 'wing_bank',
          title: 'Wing Bank',
          logoPath: 'payment/wing-bank.png',
          subtitleImages: ['/payment/visa.png', '/payment/mc.png'],
          isAvailable: true,
        },
      ],
      'EN',
    );
    expect(camelOptions[0]).toMatchObject({
      providerCode: 'wing_bank',
      logoPath: 'payment/wing-bank.png',
      subtitleImages: ['/payment/visa.png', '/payment/mc.png'],
    });
  });

  it('builds full CDN image URLs using NEXT_PUBLIC_IMAGE_CDN_BASE', () => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_BASE = 'https://dpf2qzra3cphb.cloudfront.net/';
    expect(fullImageUrl('payment/wing.png')).toBe(
      'https://dpf2qzra3cphb.cloudfront.net/payment/wing.png',
    );
    expect(fullImageUrl('/payment/khqr.png')).toBe(
      'https://dpf2qzra3cphb.cloudfront.net/payment/khqr.png',
    );
    expect(fullImageUrl('https://cdn.example.com/logo.png')).toBe(
      'https://cdn.example.com/logo.png',
    );
    expect(fullImageUrl('')).toBe('');
  });

  it('lists payment options by service type with optional query parameters', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: true,
          body: [
            {
              id: 'opt-khqr',
              provider_code: 'khqr',
              title: { en: 'KHQR' },
              is_default: true,
              is_available: true,
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const options = await consumerPaymentClient.listPaymentOptions({
      accessToken: 'tok-123',
      acceptLanguage: 'EN',
      serviceType: 'ST_EXPRESS',
      direction: 'ASC',
      property: 'provider_code',
    });

    expect(options).toHaveLength(1);
    expect(options[0].providerCode).toBe('khqr');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(
      'https://qa.wingmall.com/payment/v1/consumer/payment-options/ST_EXPRESS',
    );
    expect(String(url)).toContain('direction=ASC');
    expect(String(url)).toContain('property=provider_code');
    expect((init?.headers as Record<string, string>)['wing-platform']).toBe('UNIFIED');
  });

  it('checks payment provider availability for ST_EXPRESS', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: true,
          body: {
            is_available: false,
            unavailable_reason: { en: 'Provider limit exceeded' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const res = await consumerPaymentClient.checkPaymentAvailability({
      accessToken: 'tok-123',
      providerCode: 'wing_point',
      serviceType: 'ST_EXPRESS',
    });

    expect(res).toEqual({
      providerCode: 'wing_point',
      serviceType: 'ST_EXPRESS',
      isAvailable: false,
      unavailableReason: 'Provider limit exceeded',
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://qa.wingmall.com/payment/v1/consumer/payment-options/wing_point/availability?service_type=ST_EXPRESS',
    );
  });

  it('supports listing, creating, configuring default, and deleting payment cards', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            result: true,
            body: [
              {
                id: 'PMC-260640000316151',
                masked_card: '4111 •••• •••• 1111',
                is_default: true,
                card_scheme: 'VISA',
                issuer: 'Wing Bank',
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            result: true,
            body: { redirect_url: 'https://pay.wingmall.com/tokenize/abc' },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: true, body: {} }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: true, body: {} }), { status: 200 }),
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const cards = await consumerPaymentClient.listPaymentCards({ accessToken: 'tok' });
    expect(cards).toEqual([
      {
        id: 'PMC-260640000316151',
        maskedCard: '4111 •••• •••• 1111',
        isDefault: true,
        cardScheme: 'VISA',
        issuer: 'Wing Bank',
      },
    ]);

    const created = await consumerPaymentClient.createPaymentCard({
      accessToken: 'tok',
      platform: 'UNIFIED',
      provider: 'card',
      serviceCode: 'ST_EXPRESS',
    });
    expect(created.redirectUrl).toBe('https://pay.wingmall.com/tokenize/abc');
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      platform: 'UNIFIED',
      provider: 'card',
      service_code: 'ST_EXPRESS',
    });

    await consumerPaymentClient.configurePaymentCard({
      accessToken: 'tok',
      paymentCardId: 'PMC-260640000316151',
      isDefault: true,
    });
    expect(String(fetchMock.mock.calls[2][0])).toContain(
      '/payment/v1/consumer/payment-cards/PMC-260640000316151/setting',
    );
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body))).toEqual({
      is_default: true,
    });

    await consumerPaymentClient.deletePaymentCard({
      accessToken: 'tok',
      paymentCardId: 'PMC-260640000316151',
    });
    expect(String(fetchMock.mock.calls[3][0])).toContain(
      '/payment/v1/consumer/payment-cards/PMC-260640000316151/delete',
    );
  });

  it('fetches payment detail with transactions and propagates failure envelopes', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            result: true,
            body: {
              id: 'PAY-001',
              payment_status: 'PAID',
              total_amount: '2.50',
              paid_amount: '2.50',
              currency: 'USD',
              payment_transactions: [
                {
                  id: 'TX-1',
                  core_reference: 'CORE-999',
                  amount: '2.50',
                  currency: 'USD',
                  payment_type: 'CARD',
                  transaction_status: 'SUCCESS',
                },
              ],
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            result: false,
            result_message: 'Payment not found',
          }),
          { status: 200 },
        ),
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const detail = await consumerPaymentClient.getPaymentDetail({
      accessToken: 'tok',
      paymentId: 'PAY-001',
    });
    expect(detail).toMatchObject({
      id: 'PAY-001',
      paymentStatus: 'PAID',
      totalAmount: '2.50',
      paidAmount: '2.50',
      currency: 'USD',
    });
    expect(detail?.transactions[0]).toMatchObject({
      id: 'TX-1',
      coreReference: 'CORE-999',
      transactionStatus: 'SUCCESS',
    });

    await expect(
      consumerPaymentClient.getPaymentDetail({
        accessToken: 'tok',
        paymentId: 'PAY-MISSING',
      }),
    ).rejects.toThrow(ConsumerApiError);
  });

  it('forwards selected paymentCardId into courier order payload', () => {
    const sample: CreateBookingPayload = {
      pickup: {
        name: 'Shop',
        address: 'St 310, Phnom Penh',
        coordinates: { lat: 11.55, lng: 104.92 },
      },
      dropoff: {
        address: 'St 289, Phnom Penh',
        coordinates: { lat: 11.58, lng: 104.89 },
      },
      recipient: { name: 'Buyer', phoneNumber: '012998877' },
      parcel: { sellerOrderRef: 'LIVE-001' },
      cod: { isCod: false, amount: 0 },
      idempotencyKey: 'idem-card',
      paymentMethod: 'card',
      paymentCardId: 'PMC-260640000316151',
      finalFee: 1.75,
    };

    const body = buildCourierOrderPayload(sample, { includePaymentMethod: true });
    expect(body.payment_method).toBe('card');
    expect(body.payment_card_id).toBe('PMC-260640000316151');
  });
});

