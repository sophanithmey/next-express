import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { serverAxios } from '@/lib/axios/server-axios';
import {
  mapConsumerAddressesToPickupLocations,
  wingAddressIntegration,
} from '@/server/integrations/wing-address-integration';
import { ConsumerApiError } from '@/server/lib/api-response';
import { createSavedLocationSchema } from '@/features/booking/schemas/location-schema';

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

describe('Wing Consumer Address Integration & Schema', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.WING_EXPRESS_API_URL = 'https://qa.wingmall.com';
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('maps consumer address payloads into PickupLocation options cleanly', () => {
    const mapped = mapConsumerAddressesToPickupLocations(
      [
        {
          id: 'ADD-1',
          name: 'Main Boutique',
          information_address: 'St 310, BKK1, Phnom Penh',
          latitude: 11.5512,
          longitude: 104.9256,
          contact: '012888999',
          remark: 'Gate B',
          type: 'work',
        },
        {
          id: 'ADD-INVALID',
          name: 'Broken Pin',
          latitude: null,
          longitude: null,
        },
      ],
      { fallbackPhone: '+85512999000', fallbackSenderName: 'Seller A' },
    );

    expect(mapped).toHaveLength(1);
    expect(mapped[0]).toEqual({
      id: 'ADD-1',
      name: 'Main Boutique',
      address: 'St 310, BKK1, Phnom Penh',
      coordinates: { lat: 11.5512, lng: 104.9256 },
      riderNote: 'Gate B',
      senderPhone: '012888999',
      senderName: 'Seller A',
      imageUrl: undefined,
      tag: 'work',
    });
  });

  it('queries GET /address/v1/consumer/addresses/sort via serverAxios with Wing headers', async () => {
    const requestSpy = vi.spyOn(serverAxios, 'request').mockResolvedValueOnce(
      makeAxiosResponse({
        result: true,
        result_code: '200',
        body: [
          {
            id: 'ADD-SORT-1',
            name: 'Home Hub',
            information_address: 'Street 2004, Phnom Penh',
            latitude: 11.5564,
            longitude: 104.9282,
            remark: 'Guardhouse',
            type: 'home',
          },
        ],
      }),
    );

    const locations = await wingAddressIntegration.getSortedAddresses({
      accessToken: 'qa-bearer-token',
      referenceId: 'USR-253420000018495',
      latitude: 11.5564,
      longitude: 104.9282,
      acceptLanguage: 'KM',
      fallbackPhone: '+85569686234',
    });

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const config = requestSpy.mock.calls[0][0];
    expect(config.url).toBe('https://qa.wingmall.com/address/v1/consumer/addresses/sort');
    expect(config.method).toBe('GET');
    expect(config.params).toEqual({
      reference_id: 'USR-253420000018495',
      latitude: 11.5564,
      longitude: 104.9282,
    });

    const headers = config.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer qa-bearer-token');
    expect(headers['wing-platform']).toBe('WEB');
    expect(headers['accept-language']).toBe('KM');
    expect(headers['device-id']).toBe('wing-express-web');
    expect(headers['request-id']).toBeTruthy();

    expect(locations).toHaveLength(1);
    expect(locations[0].name).toBe('Home Hub');
    expect(locations[0].senderPhone).toBe('+85569686234');
  });

  it('throws ConsumerApiError when address service returns HTTP 400 or result: false', async () => {
    vi.spyOn(serverAxios, 'request').mockRejectedValueOnce(
      makeAxiosHttpError(400, {
        result: false,
        result_code: 'U444',
        result_message: 'reference_id must not be null',
      }),
    );

    await expect(
      wingAddressIntegration.getSortedAddresses({
        accessToken: 'qa-bearer-token',
        referenceId: 'USR-253420000018495',
      }),
    ).rejects.toThrowError(ConsumerApiError);
  });

  it('posts POST /address/v1/consumer/addresses with Wing headers and full payload', async () => {
    const requestSpy = vi.spyOn(serverAxios, 'request').mockResolvedValueOnce(
      makeAxiosResponse(
        {
          result: true,
          result_code: '200',
          result_message: 'Success',
          body: {
            id: 'ADD-NEW-999',
            reference_id: 'USR-253420000018495',
            name: 'BKK1 Flagship',
            type: 'consumer',
            contact: '+85512888999',
            information_address: 'St 310, Sangkat BKK I, Phnom Penh',
            latitude: 11.5512,
            longitude: 104.9256,
            remark: 'Ring warehouse bell',
            status: 'ACTIVE',
          },
        },
        201,
      ),
    );

    const created = await wingAddressIntegration.createAddress({
      accessToken: 'qa-bearer-token',
      referenceId: 'USR-253420000018495',
      name: 'BKK1 Flagship',
      informationAddress: 'St 310, Sangkat BKK I, Phnom Penh',
      latitude: 11.5512,
      longitude: 104.9256,
      type: 'consumer',
      contact: '+85512888999',
      remark: 'Ring warehouse bell',
      addressDetail: {
        house_number: '#18',
        street_number: 'St 310',
        province_id: '',
      },
      acceptLanguage: 'EN',
      fallbackPhone: '+85569686234',
      fallbackSenderName: 'Express Seller',
    });

    const config = requestSpy.mock.calls[0][0];
    expect(config.url).toBe('https://qa.wingmall.com/address/v1/consumer/addresses');
    expect(config.method).toBe('POST');

    const headers = config.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Accept).toBe('application/json');
    expect(headers.Authorization).toBe('Bearer qa-bearer-token');
    expect(headers['wing-platform']).toBe('WEB');
    expect(headers['accept-language']).toBe('EN');
    expect(headers['request-id']).toBeTruthy();

    expect(config.data).toEqual({
      name: 'BKK1 Flagship',
      reference_id: 'USR-253420000018495',
      type: 'consumer',
      contact: '+85512888999',
      information_address: 'St 310, Sangkat BKK I, Phnom Penh',
      latitude: 11.5512,
      longitude: 104.9256,
      remark: 'Ring warehouse bell',
      metadata: {},
      address_detail: {
        house_number: '#18',
        street_number: 'St 310',
      },
    });

    expect(created).toEqual({
      id: 'ADD-NEW-999',
      name: 'BKK1 Flagship',
      address: 'St 310, Sangkat BKK I, Phnom Penh',
      coordinates: { lat: 11.5512, lng: 104.9256 },
      riderNote: 'Ring warehouse bell',
      senderPhone: '+85512888999',
      senderName: 'Express Seller',
      imageUrl: undefined,
      tag: 'consumer',
    });
  });

  it('normalizes minimal body response and throws ConsumerApiError on create failure', async () => {
    vi.spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: { id: 'ADD-MIN-1' },
        }),
      )
      .mockRejectedValueOnce(
        makeAxiosHttpError(400, {
          result: false,
          result_code: 'U400',
          result_message: 'Invalid address payload',
        }),
      );

    const created = await wingAddressIntegration.createAddress({
      accessToken: 'qa-bearer-token',
      referenceId: 'USR-1',
      name: 'Warehouse 2',
      informationAddress: 'St 271, Phnom Penh',
      latitude: 11.5321,
      longitude: 104.9123,
      fallbackPhone: '+85569686234',
    });

    expect(created.id).toBe('ADD-MIN-1');
    expect(created.name).toBe('Warehouse 2');
    expect(created.address).toBe('St 271, Phnom Penh');
    expect(created.senderPhone).toBe('+85569686234');

    await expect(
      wingAddressIntegration.createAddress({
        accessToken: 'qa-bearer-token',
        referenceId: 'USR-1',
        name: 'Warehouse 2',
        informationAddress: 'St 271, Phnom Penh',
        latitude: 11.5321,
        longitude: 104.9123,
      }),
    ).rejects.toThrowError('Invalid address payload');
  });

  it('validates createSavedLocationSchema inputs', () => {
    const valid = createSavedLocationSchema.safeParse({
      name: 'Main Store',
      address: 'Street 93, Phnom Penh',
      coordinates: { lat: 11.55, lng: 104.92 },
      contact: '012888999',
      remark: 'Red gate',
      addressDetail: { house_number: '12A', street_number: '93' },
    });
    expect(valid.success).toBe(true);

    const invalid = createSavedLocationSchema.safeParse({
      name: '',
      address: 'St',
      coordinates: { lat: 11.55, lng: 104.92 },
    });
    expect(invalid.success).toBe(false);
  });
});
