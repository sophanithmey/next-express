import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { serverAxios } from '@/lib/axios/server-axios';
import { wingPaymentIntegration } from '@/server/integrations/wing-payment-integration';
import {
  mapPaymentAvailability,
  mapPaymentCardList,
  mapPaymentDetailRecord,
  mapPaymentOptionList,
  resolveLocalizedText,
} from '@/server/integrations/wing-payment-mapper';
import { buildCourierOrderPayload } from '@/server/integrations/wing-order-mapper';
import { ConsumerApiError } from '@/server/lib/api-response';
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

describe('Wing Consumer Payment Integration & Mappers', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.WING_EXPRESS_API_URL = 'https://qa.wingmall.com';
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('resolves localized labels preferring active locale before English fallback', () => {
    expect(resolveLocalizedText({ en: 'Bank Card', km: 'កាតធនាគារ' }, 'KM')).toBe(
      'កាតធនាគារ',
    );
    expect(resolveLocalizedText({ en: 'KHQR Payment' }, 'KM')).toBe('KHQR Payment');
    expect(resolveLocalizedText('Direct Cash')).toBe('Direct Cash');
  });

  it('maps payment options, availability checks, and saved cards cleanly', () => {
    const options = mapPaymentOptionList(
      [
        {
          id: 'OPT-1',
          provider_code: 'KHQR',
          title: { en: 'Wing KHQR', km: 'វីង KHQR' },
          subtitle: { en: 'Scan with any bank app' },
          logo_path: '/assets/khqr.png',
          subtitle_images: ['/assets/bakong.png'],
          is_available: true,
        },
        {
          provider_code: 'CARD',
          title: 'Credit/Debit Card',
          is_available: false,
          unavailable_reason: { en: 'Temporarily under maintenance' },
        },
      ],
      'EN',
    );

    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({
      providerCode: 'KHQR',
      title: 'Wing KHQR',
      subtitle: 'Scan with any bank app',
      logoPath: '/assets/khqr.png',
      subtitleImages: ['/assets/bakong.png'],
      isAvailable: true,
    });
    expect(options[1]).toMatchObject({
      providerCode: 'CARD',
      isAvailable: false,
      unavailableReason: 'Temporarily under maintenance',
    });

    expect(
      mapPaymentAvailability(
        { is_available: false, unavailable_reason: { en: 'Offline' } },
        'CARD',
        'ST_EXPRESS',
      ),
    ).toEqual({
      providerCode: 'CARD',
      serviceType: 'ST_EXPRESS',
      isAvailable: false,
      unavailableReason: 'Offline',
    });

    expect(
      mapPaymentCardList([
        {
          id: 'PMC-1',
          masked_card: '•••• 4242',
          is_default: true,
          card_scheme: 'VISA',
          issuer: 'ABA Bank',
        },
      ]),
    ).toEqual([
      {
        id: 'PMC-1',
        maskedCard: '•••• 4242',
        isDefault: true,
        cardScheme: 'VISA',
        issuer: 'ABA Bank',
      },
    ]);
  });

  it('queries payment options, availability, and card lifecycle via serverAxios', async () => {
    const requestSpy = vi
      .spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: [
            {
              provider_code: 'WING_PAY',
              title: { en: 'WingPay' },
              is_available: true,
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: { is_available: true },
        }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: { redirect_url: 'https://pay.wing.com/tokenize/abc' },
        }),
      )
      .mockResolvedValueOnce(makeAxiosResponse({ result: true, body: {} }))
      .mockResolvedValueOnce(makeAxiosResponse({ result: true, body: {} }));

    const options = await wingPaymentIntegration.listPaymentOptions({
      accessToken: 'tok-1',
      serviceType: 'ST_EXPRESS',
      acceptLanguage: 'EN',
      page: 1,
      rpp: 20,
    });
    expect(options).toHaveLength(1);
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      url: 'https://qa.wingmall.com/payment/v1/consumer/payment-options/ST_EXPRESS',
      method: 'GET',
      params: { page: 1, rpp: 20 },
    });

    const availability = await wingPaymentIntegration.checkPaymentAvailability({
      accessToken: 'tok-1',
      providerCode: 'WING_PAY',
      serviceType: 'ST_EXPRESS',
    });
    expect(availability.isAvailable).toBe(true);
    expect(requestSpy.mock.calls[1][0]).toMatchObject({
      url: 'https://qa.wingmall.com/payment/v1/consumer/payment-options/WING_PAY/availability',
      method: 'GET',
      params: { service_type: 'ST_EXPRESS' },
    });

    const created = await wingPaymentIntegration.createPaymentCard({
      accessToken: 'tok-1',
      platform: 'UNIFIED',
      provider: 'ABA_PAYWAY',
      serviceCode: 'ST_EXPRESS',
    });
    expect(created.redirectUrl).toBe('https://pay.wing.com/tokenize/abc');
    expect(requestSpy.mock.calls[2][0]).toMatchObject({
      url: 'https://qa.wingmall.com/payment/v1/consumer/payment-cards',
      method: 'POST',
      data: {
        platform: 'UNIFIED',
        provider: 'ABA_PAYWAY',
        service_code: 'ST_EXPRESS',
      },
    });

    await wingPaymentIntegration.configurePaymentCard({
      accessToken: 'tok-1',
      paymentCardId: 'PMC-1',
      isDefault: true,
    });
    expect(requestSpy.mock.calls[3][0]).toMatchObject({
      url: 'https://qa.wingmall.com/payment/v1/consumer/payment-cards/PMC-1/setting',
      method: 'POST',
      data: { is_default: true },
    });

    await wingPaymentIntegration.deletePaymentCard({
      accessToken: 'tok-1',
      paymentCardId: 'PMC-1',
    });
    expect(requestSpy.mock.calls[4][0]).toMatchObject({
      url: 'https://qa.wingmall.com/payment/v1/consumer/payment-cards/PMC-1/delete',
      method: 'POST',
    });
  });

  it('retrieves payment transaction details and returns null on 404 while throwing on 400', async () => {
    vi.spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(
        makeAxiosResponse({
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
                transaction_status: 'SUCCESS',
              },
            ],
          },
        }),
      )
      .mockRejectedValueOnce(
        makeAxiosHttpError(404, {
          result: false,
          result_message: 'Payment not found',
        }),
      )
      .mockRejectedValueOnce(
        makeAxiosHttpError(400, {
          result: false,
          result_message: 'Invalid payment reference',
        }),
      );

    const detail = await wingPaymentIntegration.getPaymentDetail({
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

    const missing = await wingPaymentIntegration.getPaymentDetail({
      accessToken: 'tok',
      paymentId: 'PAY-404',
    });
    expect(missing).toBeNull();

    await expect(
      wingPaymentIntegration.getPaymentDetail({
        accessToken: 'tok',
        paymentId: 'PAY-BAD',
      }),
    ).rejects.toThrow(ConsumerApiError);
  });

  it('forwards selected paymentCardId and exposes mapPaymentDetailRecord cleanly', () => {
    expect(mapPaymentDetailRecord(null)).toBeNull();

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
