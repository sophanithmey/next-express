import 'server-only';
import { isAxiosError } from 'axios';
import { serverAxios } from '@/lib/axios/server-axios';
import { getServerEnv } from '@/server/lib/env';
import { ExpressApiError } from '@/server/lib/api-response';
import {
  BookingFeeQuote,
  BookingOrder,
  CreateBookingPayload,
  DeliverySpeedOption,
  GeoCoordinates,
  PickupLocation,
  RecipientRecord,
} from '@/features/booking/types/booking-types';
import { PaginatedResponse } from '@/types/api-types';

function authHeader(accessToken?: string): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const wingExpressIntegration = {
  async calculateFee(
    pickup: GeoCoordinates,
    dropoff: GeoCoordinates,
    accessToken?: string,
    options?: {
      additionalStopsCount?: number;
      deliveryOption?: DeliverySpeedOption;
    },
  ): Promise<BookingFeeQuote> {
    const env = getServerEnv();
    const res = await serverAxios.request<BookingFeeQuote>({
      url: `${env.expressApiBaseUrl}/express/fee`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(accessToken) },
      data: {
        pickup,
        dropoff,
        ...(options?.additionalStopsCount !== undefined
          ? { additionalStopsCount: options.additionalStopsCount }
          : {}),
        ...(options?.deliveryOption ? { deliveryOption: options.deliveryOption } : {}),
      },
    });
    return res.data;
  },

  async getSavedLocations(accessToken?: string): Promise<PickupLocation[]> {
    const env = getServerEnv();
    const res = await serverAxios.request<PickupLocation[]>({
      url: `${env.expressApiBaseUrl}/express/saved-locations`,
      method: 'GET',
      headers: authHeader(accessToken),
    });
    return res.data;
  },

  async savePickupLocation(
    location: PickupLocation,
    accessToken?: string,
  ): Promise<PickupLocation> {
    const env = getServerEnv();
    const res = await serverAxios.request<PickupLocation>({
      url: `${env.expressApiBaseUrl}/express/saved-locations`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(accessToken) },
      data: location,
    });
    return res.data;
  },

  async searchRecipients(
    query: string,
    accessToken?: string,
  ): Promise<RecipientRecord[]> {
    const env = getServerEnv();
    const res = await serverAxios.request<RecipientRecord[]>({
      url: `${env.expressApiBaseUrl}/express/recipients`,
      method: 'GET',
      params: query ? { q: query } : undefined,
      headers: authHeader(accessToken),
    });
    return res.data;
  },

  async createBooking(
    payload: CreateBookingPayload,
    accessToken?: string,
  ): Promise<BookingOrder> {
    const env = getServerEnv();
    try {
      const res = await serverAxios.request<BookingOrder>({
        url: `${env.expressApiBaseUrl}/express/bookings`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': payload.idempotencyKey,
          ...authHeader(accessToken),
        },
        data: payload,
      });
      return res.data;
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response) {
        const msg =
          (err.response.data as { message?: string } | undefined)?.message ||
          'Failed to submit delivery booking to Express API';
        throw new ExpressApiError(msg, err.response.status);
      }
      throw err;
    }
  },

  async getBookings(
    params?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    accessToken?: string,
  ): Promise<PaginatedResponse<BookingOrder>> {
    const env = getServerEnv();
    const res = await serverAxios.request<PaginatedResponse<BookingOrder>>({
      url: `${env.expressApiBaseUrl}/express/bookings`,
      method: 'GET',
      params: {
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
      },
      headers: authHeader(accessToken),
    });
    return res.data;
  },

  async getBookingById(
    id: string,
    accessToken?: string,
  ): Promise<BookingOrder | null> {
    const env = getServerEnv();
    try {
      const res = await serverAxios.request<BookingOrder>({
        url: `${env.expressApiBaseUrl}/express/bookings/${encodeURIComponent(id)}`,
        method: 'GET',
        headers: authHeader(accessToken),
      });
      return res.data;
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },
};

