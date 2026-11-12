import { clientAxios, withAcceptLanguage } from '@/lib/axios/client-axios';
import { isLocalDemoStorageEnabled } from '@/lib/local-demo-storage';
import { PaginatedResponse } from '@/types/api-types';
import {
  deleteUserBookingDraft,
  getUserSavedDrafts,
  saveUserBookingDraft,
} from './booking-draft-service';
import { BookingOrderFilter } from './booking-order-filter';
import { localDemoBookingStore } from './local-demo-store';
import {
  BookingFeeQuote,
  BookingFormData,
  BookingOrder,
  DeliverySpeedOption,
  GeoCoordinates,
  SavedBookingDraft,
} from '../types/booking-types';

export interface ListBookingsParams {
  page?: number;
  rpp?: number;
  search?: string;
  status?: string;
  direction?: 'ASC' | 'DESC';
  property?: string;
  filter?: BookingOrderFilter[];
  locale?: string;
}

export interface CreateBookingSubmission {
  draftOrderId?: BookingFormData['draftOrderId'];
  pickup: BookingFormData['pickup'];
  dropoff: BookingFormData['dropoff'];
  dropoffs?: BookingFormData['dropoffs'];
  deliveryOption?: BookingFormData['deliveryOption'];
  recipient: BookingFormData['recipient'];
  parcel: BookingFormData['parcel'];
  cod: BookingFormData['cod'];
  paymentMethod?: string;
  paymentCardId?: string;
  promoCode?: string;
  discountAmount?: number;
  tipAmount?: number;
  finalFee?: number;
  isDraft?: boolean;
}

export const bookingApiService = {
  async listBookings(
    params: ListBookingsParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<BookingOrder>> {
    if (isLocalDemoStorageEnabled()) return localDemoBookingStore.listOrders(params);
    const { locale, filter, ...rest } = params;
    const response = await clientAxios.get<PaginatedResponse<BookingOrder>>(
      '/bookings',
      withAcceptLanguage(locale, {
        signal,
        params: {
          ...rest,
          ...(filter?.length ? { filter: JSON.stringify(filter) } : {}),
        },
      }),
    );
    return response.data;
  },

  async getBookingById(
    bookingId: string,
    locale?: string,
    signal?: AbortSignal,
  ): Promise<BookingOrder> {
    if (isLocalDemoStorageEnabled()) {
      const order = localDemoBookingStore.getOrderById(bookingId);
      if (!order) throw new Error('Booking not found');
      return order;
    }
    const response = await clientAxios.get<BookingOrder>(
      `/bookings/${encodeURIComponent(bookingId)}`,
      withAcceptLanguage(locale, { signal }),
    );
    return response.data;
  },

  async createBooking(
    payload: CreateBookingSubmission,
    options?: { locale?: string; idempotencyKey?: string },
  ): Promise<BookingOrder> {
    if (isLocalDemoStorageEnabled()) return localDemoBookingStore.createOrder(payload);
    const response = await clientAxios.post<BookingOrder>(
      '/bookings',
      payload,
      withAcceptLanguage(options?.locale, {
        headers: options?.idempotencyKey
          ? { 'x-idempotency-key': options.idempotencyKey }
          : undefined,
      }),
    );
    return response.data;
  },

  async cancelBooking(params: {
    bookingId: string;
    reason?: string;
    locale?: string;
  }): Promise<BookingOrder> {
    if (isLocalDemoStorageEnabled()) {
      const cancelled = localDemoBookingStore.cancelOrder(params.bookingId, params.reason);
      if (!cancelled) throw new Error('Booking not found or cannot be cancelled');
      return cancelled;
    }
    const response = await clientAxios.patch<BookingOrder>(
      `/bookings/${encodeURIComponent(params.bookingId)}`,
      { action: 'cancel', reason: params.reason },
      withAcceptLanguage(params.locale),
    );
    return response.data;
  },

  async checkoutBooking(params: {
    bookingId: string;
    metadata?: Record<string, unknown>;
    locale?: string;
  }): Promise<{ paymentId?: string; paymentRedirectUrl?: string }> {
    if (isLocalDemoStorageEnabled()) {
      return { paymentId: `PAY-DEMO-${Date.now()}`, paymentRedirectUrl: undefined };
    }
    const response = await clientAxios.patch<{
      paymentId?: string;
      paymentRedirectUrl?: string;
    }>(
      `/bookings/${encodeURIComponent(params.bookingId)}`,
      { action: 'checkout', metadata: params.metadata },
      withAcceptLanguage(params.locale),
    );
    return response.data;
  },

  async deleteBooking(bookingId: string, locale?: string): Promise<{ success: boolean }> {
    if (isLocalDemoStorageEnabled()) {
      localDemoBookingStore.deleteOrder(bookingId);
      return { success: true };
    }
    const response = await clientAxios.delete<{ success: boolean }>(
      `/bookings/${encodeURIComponent(bookingId)}`,
      withAcceptLanguage(locale),
    );
    return response.data;
  },

  async calculateFee(
    payload: {
      pickup: GeoCoordinates;
      dropoff: GeoCoordinates;
      additionalStopsCount?: number;
      deliveryOption?: DeliverySpeedOption;
    },
    locale?: string,
  ): Promise<BookingFeeQuote> {
    if (isLocalDemoStorageEnabled()) return localDemoBookingStore.calculateFee(payload);
    const response = await clientAxios.post<BookingFeeQuote>(
      '/bookings/fee',
      payload,
      withAcceptLanguage(locale),
    );
    return response.data;
  },

  async listDrafts(locale?: string): Promise<SavedBookingDraft[]> {
    if (isLocalDemoStorageEnabled()) return getUserSavedDrafts();
    const response = await clientAxios.get<{ items?: SavedBookingDraft[] }>(
      '/bookings/drafts',
      withAcceptLanguage(locale),
    );
    return response.data.items || [];
  },

  async saveDraft(
    formData: BookingFormData,
    locale?: string,
  ): Promise<SavedBookingDraft> {
    if (isLocalDemoStorageEnabled()) return saveUserBookingDraft(formData);
    const response = await clientAxios.post<{ draft?: SavedBookingDraft }>(
      '/bookings/drafts',
      formData,
      withAcceptLanguage(locale),
    );
    if (!response.data.draft) {
      throw new Error('Draft response did not include saved draft data.');
    }
    return response.data.draft;
  },

  async deleteDraft(orderId: string, locale?: string): Promise<{ success: boolean }> {
    if (isLocalDemoStorageEnabled()) {
      deleteUserBookingDraft(orderId);
      localDemoBookingStore.deleteOrder(orderId);
      return { success: true };
    }
    const response = await clientAxios.delete<{ success: boolean }>(
      '/bookings/drafts',
      withAcceptLanguage(locale, { params: { id: orderId } }),
    );
    return response.data;
  },
};

