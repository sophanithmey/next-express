import 'server-only';
import { APP_CONFIG } from '@/lib/constants';
import { getServerEnv } from '../config/server-env';
import { ConsumerApiError } from './consumer-api-client';
import {
  extractUnifiedErrorMessage,
  isUnifiedFailureResponse,
} from '../auth/unified-jwt';
import {
  ConsumerAddressDetail,
  ConsumerAddressItem,
  SavedLocationOption,
  mapConsumerAddressesToPickupLocations,
} from './consumer-address-mapper';

export type {
  ConsumerAddressDetail,
  ConsumerAddressItem,
  SavedLocationOption,
};
export { mapConsumerAddressesToPickupLocations };

export interface GetConsumerAddressesOptions {
  accessToken: string;
  referenceId: string;
  latitude?: number;
  longitude?: number;
  acceptLanguage?: string;
  fallbackPhone?: string;
  fallbackSenderName?: string;
}

export interface CreateConsumerAddressDetail {
  house_number?: string;
  street_number?: string;
  province_id?: string;
  district_id?: string;
  commune_id?: string;
  village_id?: string;
}

export interface CreateConsumerAddressOptions {
  accessToken: string;
  referenceId: string;
  name: string;
  informationAddress: string;
  latitude: number;
  longitude: number;
  type?: string;
  contact?: string;
  remark?: string;
  metadata?: Record<string, unknown>;
  addressDetail?: CreateConsumerAddressDetail;
  acceptLanguage?: string;
  fallbackPhone?: string;
  fallbackSenderName?: string;
}

function buildAddressHeaders(
  accessToken: string,
  acceptLanguage = 'EN',
  includeJsonContentType = false,
): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(includeJsonContentType ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${accessToken}`,
    'wing-platform': 'WEB',
    'os-version': '1.0.0',
    'device-model': 'Web',
    'device-id': 'wing-express-web',
    'app-version': '1.0.0',
    'api-version': '1.0.0',
    'request-id': crypto.randomUUID(),
    'accept-language': acceptLanguage.toUpperCase(),
  };
}

function buildAddressDetailPayload(
  detail?: CreateConsumerAddressDetail,
): CreateConsumerAddressDetail {
  if (!detail) return {};
  const entries = Object.entries({
    house_number: detail.house_number?.trim(),
    street_number: detail.street_number?.trim(),
    province_id: detail.province_id?.trim(),
    district_id: detail.district_id?.trim(),
    commune_id: detail.commune_id?.trim(),
    village_id: detail.village_id?.trim(),
  }).filter(([, value]) => Boolean(value));

  return Object.fromEntries(entries) as CreateConsumerAddressDetail;
}

async function parseAddressResponse<T>(response: Response): Promise<T> {
  const rawData: unknown = await response.json().catch(() => ({}));
  if (!response.ok || isUnifiedFailureResponse(rawData)) {
    const status = response.ok ? 400 : response.status;
    throw new ConsumerApiError(extractUnifiedErrorMessage(rawData, status), status);
  }
  return rawData as T;
}

export const consumerAddressClient = {
  /**
   * Fetches distance-sorted consumer saved addresses via
   * `GET /address/v1/consumer/addresses/sort`.
   */
  async getSortedAddresses({
    accessToken,
    referenceId,
    latitude = APP_CONFIG.defaultCoordinates.lat,
    longitude = APP_CONFIG.defaultCoordinates.lng,
    acceptLanguage = 'EN',
    fallbackPhone,
    fallbackSenderName,
  }: GetConsumerAddressesOptions): Promise<SavedLocationOption[]> {
    const env = getServerEnv();
    const url = new URL(`${env.addressApiBaseUrl}/consumer/addresses/sort`);
    url.searchParams.set('reference_id', referenceId);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildAddressHeaders(accessToken, acceptLanguage),
        cache: 'no-store',
      });

      const rawData = await parseAddressResponse<{ body?: unknown }>(response);
      if (!Array.isArray(rawData.body)) return [];

      return mapConsumerAddressesToPickupLocations(
        rawData.body as ConsumerAddressItem[],
        { fallbackPhone, fallbackSenderName },
      );
    } catch (err: unknown) {
      if (err instanceof ConsumerApiError) throw err;
      throw new ConsumerApiError(
        'Unable to reach Consumer Address Service. Please try again.',
        503,
      );
    }
  },

  /**
   * Creates a new saved consumer address via
   * `POST /address/v1/consumer/addresses`.
   */
  async createAddress(
    options: CreateConsumerAddressOptions,
  ): Promise<SavedLocationOption> {
    const env = getServerEnv();
    const payload = {
      name: options.name.trim(),
      reference_id: options.referenceId,
      type: options.type?.trim() || 'consumer',
      contact: options.contact?.trim() || options.fallbackPhone || '',
      information_address: options.informationAddress.trim(),
      latitude: options.latitude,
      longitude: options.longitude,
      remark: options.remark?.trim() || '',
      metadata: options.metadata ?? {},
      address_detail: buildAddressDetailPayload(options.addressDetail),
    };

    try {
      const response = await fetch(`${env.addressApiBaseUrl}/consumer/addresses`, {
        method: 'POST',
        headers: buildAddressHeaders(
          options.accessToken,
          options.acceptLanguage,
          true,
        ),
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const rawData = await parseAddressResponse<{ body?: unknown }>(response);
      const bodyObj =
        rawData.body && typeof rawData.body === 'object' && !Array.isArray(rawData.body)
          ? (rawData.body as ConsumerAddressItem)
          : undefined;

      const normalized = mapConsumerAddressesToPickupLocations(
        [
          {
            id: bodyObj?.id || `addr-${Date.now()}`,
            name: bodyObj?.name || payload.name,
            type: bodyObj?.type || payload.type,
            contact: bodyObj?.contact || payload.contact,
            information_address:
              bodyObj?.information_address || payload.information_address,
            latitude:
              typeof bodyObj?.latitude === 'number'
                ? bodyObj.latitude
                : payload.latitude,
            longitude:
              typeof bodyObj?.longitude === 'number'
                ? bodyObj.longitude
                : payload.longitude,
            remark: bodyObj?.remark ?? payload.remark,
            metadata: bodyObj?.metadata ?? payload.metadata,
            address_detail: bodyObj?.address_detail ?? payload.address_detail,
            status: bodyObj?.status || 'ACTIVE',
          },
        ],
        {
          fallbackPhone: options.fallbackPhone,
          fallbackSenderName: options.fallbackSenderName,
        },
      );

      return normalized[0];
    } catch (err: unknown) {
      if (err instanceof ConsumerApiError) throw err;
      throw new ConsumerApiError(
        'Unable to reach Consumer Address Service. Please try again.',
        503,
      );
    }
  },
};
