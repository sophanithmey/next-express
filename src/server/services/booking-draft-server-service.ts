import 'server-only';
import {
  BookingOrder,
  CreateBookingPayload,
  SavedBookingDraft,
} from '@/features/booking/types/booking-types';
import { SessionData } from '@/features/auth/types/auth-types';
import { wingOrderIntegration } from '@/server/integrations/wing-order-integration';
import { ConsumerApiError } from '@/server/lib/api-response';
import { getServerEnv } from '@/server/lib/env';
import { inMemoryStore } from '@/server/lib/mock-booking-store';

export function toSavedBookingDraft(
  order: BookingOrder,
  userId?: string,
): SavedBookingDraft {
  const origin = order.pickup?.address?.split(',')[0] || 'Pickup Origin';
  const dest = order.dropoff?.address?.split(',')[0] || 'Destination';
  const orderRef = order.parcel?.sellerOrderRef;
  const title = orderRef
    ? `${orderRef}: ${origin} → ${dest}`
    : `${origin} → ${dest}`;

  return {
    id: order.id,
    orderId: order.id,
    source: 'api',
    userId,
    title,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    formData: {
      draftOrderId: order.id,
      pickup: order.pickup,
      dropoff: order.dropoff,
      recipient: order.recipient,
      dropoffs: order.dropoffs,
      deliveryOption: order.deliveryOption || 'instant',
      parcel: order.parcel,
      cod: order.cod,
      isBookingOnBehalf: false,
    },
  };
}

export const bookingDraftServerService = {
  async listDrafts(
    session: SessionData | null,
    acceptLanguage = 'EN',
  ): Promise<SavedBookingDraft[]> {
    const env = getServerEnv();
    if (env.mockOrderApi || !session?.accessToken) {
      return [];
    }

    const list = await wingOrderIntegration.listOrders({
      accessToken: session.accessToken,
      acceptLanguage,
      page: 1,
      rpp: 25,
      status: 'draft',
    });

    return list.items.map((order) =>
      toSavedBookingDraft(order, session.user?.id),
    );
  },

  async saveDraft(
    payload: CreateBookingPayload,
    options: { session: SessionData | null; acceptLanguage?: string },
  ): Promise<{
    draft: SavedBookingDraft;
    order?: BookingOrder;
    isUpdate: boolean;
  }> {
    const env = getServerEnv();
    if (!env.mockOrderApi && !options.session?.accessToken) {
      throw new ConsumerApiError('Please sign in to save drafts', 401);
    }

    if (env.mockOrderApi || !options.session?.accessToken) {
      const mockOrder = inMemoryStore.createBooking({
        ...payload,
        isDraft: true,
      });
      return {
        draft: toSavedBookingDraft(
          { ...mockOrder, status: 'draft' },
          options.session?.user?.id,
        ),
        isUpdate: false,
      };
    }

    const orderId = payload.draftOrderId?.trim();
    const order = orderId
      ? await wingOrderIntegration.updateOrder({
          accessToken: options.session.accessToken,
          acceptLanguage: options.acceptLanguage,
          orderId,
          payload: { ...payload, isDraft: true },
          fallbackPhone: options.session.user?.phoneNumber,
          fallbackSenderName: options.session.user?.name,
        })
      : await wingOrderIntegration.createOrder({
          accessToken: options.session.accessToken,
          acceptLanguage: options.acceptLanguage,
          payload: { ...payload, isDraft: true },
          fallbackPhone: options.session.user?.phoneNumber,
          fallbackSenderName: options.session.user?.name,
        });

    return {
      draft: toSavedBookingDraft(
        { ...order, status: 'draft' },
        options.session.user?.id,
      ),
      order,
      isUpdate: Boolean(orderId),
    };
  },

  async deleteDraft(
    orderId: string,
    options: { session: SessionData | null; acceptLanguage?: string },
  ): Promise<void> {
    const env = getServerEnv();
    if (env.mockOrderApi) return;
    if (!options.session?.accessToken) {
      throw new ConsumerApiError('Unauthorized', 401);
    }

    await wingOrderIntegration.deleteOrder({
      accessToken: options.session.accessToken,
      acceptLanguage: options.acceptLanguage,
      orderId,
    });
  },
};
