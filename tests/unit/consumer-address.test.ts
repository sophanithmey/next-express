import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  consumerAddressClient,
  mapConsumerAddressesToPickupLocations,
} from '@/server/api/consumer-address-client';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { createSavedLocationSchema } from '@/features/booking/schemas/location-schema';

describe('Consumer Address Service & Mapping', () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('maps sorted consumer addresses with null address_detail, remark, and fallback contact info', () => {
    const result = mapConsumerAddressesToPickupLocations(
      [
        {
          id: 'ADD-261680000363353',
          reference_id: 'USR-253420000018495',
          name: 'kk',
          type: 'consumer',
          information_address: 'Street 93 761, 120111 Phnom Penh, Cambodia',
          latitude: 11.541474,
          longitude: 104.9224353,
          remark: 'Back gate',
          metadata: { icon: 'heart', images: ['https://example.com/gate.jpg'] },
          address_detail: null,
          status: 'ACTIVE',
        },
        {
          id: 'ADD-INACTIVE',
          name: 'Old Store',
          information_address: 'St 100, Phnom Penh',
          latitude: 11.55,
          longitude: 104.92,
          status: 'INACTIVE',
        },
        {
          id: 'ADD-DETAIL-FALLBACK',
          name: '',
          information_address: '',
          latitude: 11.56,
          longitude: 104.93,
          address_detail: {
            address_id: 'ADDR-2',
            house_number: '#12B',
            street_number: 'St 271',
          },
          status: 'ACTIVE',
        },
      ],
      { fallbackPhone: '+85569686234', fallbackSenderName: 'Express Merchant' }
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'ADD-261680000363353',
      name: 'kk',
      address: 'Street 93 761, 120111 Phnom Penh, Cambodia',
      coordinates: { lat: 11.541474, lng: 104.9224353 },
      riderNote: 'Back gate',
      senderPhone: '+85569686234',
      senderName: 'Express Merchant',
      imageUrl: 'https://example.com/gate.jpg',
      tag: 'consumer',
    });
    expect(result[1]).toMatchObject({
      id: 'ADD-DETAIL-FALLBACK',
      name: '#12B',
      address: '#12B, St 271',
      coordinates: { lat: 11.56, lng: 104.93 },
    });
  });

  it('fetches GET /address/v1/consumer/addresses/sort with reference_id, coordinates, and Wing headers', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        result: true,
        result_code: '200',
        result_message: 'Success',
        body: [
          {
            id: 'ADD-1',
            reference_id: 'USR-253420000018495',
            name: 'Home Hub',
            type: 'consumer',
            information_address: 'Street 93 761, Phnom Penh',
            latitude: 11.541474,
            longitude: 104.9224353,
            remark: '',
            status: 'ACTIVE',
          },
        ],
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const locations = await consumerAddressClient.getSortedAddresses({
      accessToken: 'qa-bearer-token',
      referenceId: 'USR-253420000018495',
      latitude: 11.5564,
      longitude: 104.9282,
      acceptLanguage: 'KM',
      fallbackPhone: '+85569686234',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsedUrl = new URL(url);
    expect(parsedUrl.origin + parsedUrl.pathname).toBe(
      'https://qa.wingmall.com/address/v1/consumer/addresses/sort'
    );
    expect(parsedUrl.searchParams.get('reference_id')).toBe('USR-253420000018495');
    expect(parsedUrl.searchParams.get('latitude')).toBe('11.5564');
    expect(parsedUrl.searchParams.get('longitude')).toBe('104.9282');

    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer qa-bearer-token');
    expect(headers['wing-platform']).toBe('WEB');
    expect(headers['accept-language']).toBe('KM');
    expect(headers['device-id']).toBe('wing-express-web');
    expect(headers['request-id']).toBeTruthy();

    expect(locations).toHaveLength(1);
    expect(locations[0].name).toBe('Home Hub');
    expect(locations[0].senderPhone).toBe('+85569686234');
  });

  it('throws ConsumerApiError when address service returns result: false', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        result: false,
        result_code: 'U444',
        result_message: 'reference_id must not be null',
      }),
    }) as unknown as typeof fetch;

    await expect(
      consumerAddressClient.getSortedAddresses({
        accessToken: 'qa-bearer-token',
        referenceId: 'USR-253420000018495',
      })
    ).rejects.toThrowError(ConsumerApiError);
  });

  it('posts POST /address/v1/consumer/addresses with Wing headers and full payload', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
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
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const created = await consumerAddressClient.createAddress({
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

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://qa.wingmall.com/address/v1/consumer/addresses');
    expect(init.method).toBe('POST');

    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Accept).toBe('application/json');
    expect(headers.Authorization).toBe('Bearer qa-bearer-token');
    expect(headers['wing-platform']).toBe('WEB');
    expect(headers['accept-language']).toBe('EN');
    expect(headers['request-id']).toBeTruthy();

    const sentBody = JSON.parse(String(init.body));
    expect(sentBody).toEqual({
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
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        result: true,
        body: { id: 'ADD-MIN-1' },
      }),
    }) as unknown as typeof fetch;

    const created = await consumerAddressClient.createAddress({
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

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        result: false,
        result_code: 'U400',
        result_message: 'Invalid address payload',
      }),
    }) as unknown as typeof fetch;

    await expect(
      consumerAddressClient.createAddress({
        accessToken: 'qa-bearer-token',
        referenceId: 'USR-1',
        name: 'Warehouse 2',
        informationAddress: 'St 271, Phnom Penh',
        latitude: 11.5321,
        longitude: 104.9123,
      })
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

