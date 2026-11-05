import 'server-only';
import { getServerEnv } from '../config/server-env';
import { inMemoryStore } from '../repositories/in-memory-store';
import {
  BookingFeeQuote,
  BookingOrder,
  CreateBookingPayload,
  DashboardStatistics,
  GeoCoordinates,
  PickupLocation,
  RecipientRecord,
} from '@/features/booking/types/booking-types';
import { PaginatedResponse } from '@/types/api-types';

export class ExpressApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
  ) {
    super(message);
    this.name = 'ExpressApiError';
  }
}

export const expressApiClient = {
  /**
   * Calculate delivery fee between pickup and dropoff
   */
  async calculateFee(
    pickup: GeoCoordinates,
    dropoff: GeoCoordinates,
    accessToken?: string,
  ): Promise<BookingFeeQuote> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      return inMemoryStore.calculateFee(pickup, dropoff);
    }

    try {
      const response = await fetch(`${env.expressApiBaseUrl}/express/fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ pickup, dropoff }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ExpressApiError(
          errorData.message || 'Failed to calculate delivery fee',
          response.status,
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ExpressApiError) throw err;
      // Fallback calculation if network fails
      return inMemoryStore.calculateFee(pickup, dropoff);
    }
  },

  /**
   * Retrieve saved pickup locations
   */
  async getSavedLocations(accessToken?: string): Promise<PickupLocation[]> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      return inMemoryStore.getLocations();
    }

    try {
      const response = await fetch(
        `${env.expressApiBaseUrl}/express/saved-locations`,
        {
          headers: {
            Accept: 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new ExpressApiError(
          'Failed to retrieve saved locations',
          response.status,
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ExpressApiError) throw err;
      return inMemoryStore.getLocations();
    }
  },

  /**
   * Save a new pickup location
   */
  async savePickupLocation(
    location: PickupLocation,
    accessToken?: string,
  ): Promise<PickupLocation> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      return inMemoryStore.addLocation(location);
    }

    try {
      const response = await fetch(
        `${env.expressApiBaseUrl}/express/saved-locations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify(location),
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new ExpressApiError(
          'Failed to save pickup location',
          response.status,
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ExpressApiError) throw err;
      return inMemoryStore.addLocation(location);
    }
  },

  /**
   * Search recipients history
   */
  async searchRecipients(
    query: string,
    accessToken?: string,
  ): Promise<RecipientRecord[]> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      return inMemoryStore.getRecipients(query);
    }

    try {
      const url = new URL(`${env.expressApiBaseUrl}/express/recipients`);
      if (query) url.searchParams.set('q', query);

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new ExpressApiError(
          'Failed to query recipients',
          response.status,
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ExpressApiError) throw err;
      return inMemoryStore.getRecipients(query);
    }
  },

  /**
   * Create a new booking delivery order
   */
  async createBooking(
    payload: CreateBookingPayload,
    accessToken?: string,
  ): Promise<BookingOrder> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      return inMemoryStore.createBooking(payload);
    }

    try {
      const response = await fetch(
        `${env.expressApiBaseUrl}/express/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-idempotency-key': payload.idempotencyKey,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify(payload),
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ExpressApiError(
          errorData.message ||
            'Failed to submit delivery booking to Express API',
          response.status,
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ExpressApiError) throw err;
      return inMemoryStore.createBooking(payload);
    }
  },

  /**
   * Retrieve list of bookings with filtering and pagination
   */
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

    if (env.mockUpstreamApi) {
      const result = inMemoryStore.getOrders(params);
      return {
        items: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    }

    try {
      const url = new URL(`${env.expressApiBaseUrl}/express/bookings`);
      if (params?.search) url.searchParams.set('search', params.search);
      if (params?.status) url.searchParams.set('status', params.status);
      if (params?.page) url.searchParams.set('page', String(params.page));
      if (params?.limit) url.searchParams.set('limit', String(params.limit));

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new ExpressApiError('Failed to load bookings', response.status);
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ExpressApiError) throw err;
      const result = inMemoryStore.getOrders(params);
      return {
        items: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    }
  },

  /**
   * Retrieve single booking details by ID or tracking number
   */
  async getBookingById(
    id: string,
    accessToken?: string,
  ): Promise<BookingOrder | null> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      return inMemoryStore.getOrderById(id);
    }

    try {
      const response = await fetch(
        `${env.expressApiBaseUrl}/express/bookings/${id}`,
        {
          headers: {
            Accept: 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new ExpressApiError(
          'Failed to load booking details',
          response.status,
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ExpressApiError) throw err;
      return inMemoryStore.getOrderById(id);
    }
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    return inMemoryStore.getStatistics();
  },
};
