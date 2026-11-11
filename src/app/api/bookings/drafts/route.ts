import { NextResponse } from 'next/server';
import { z } from 'zod';
import { APP_CONFIG } from '@/lib/constants';
import { syncCodWithDropoffs } from '@/features/booking/services/booking-form-helpers';
import { BookingOrder, CreateBookingPayload } from '@/features/booking/types/booking-types';
import { consumerOrderClient } from '@/server/api/consumer-order-client';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';
import { getServerEnv } from '@/server/config/server-env';

const draftPayloadSchema = z.object({
  draftOrderId: z.string().optional(),
  pickup: z.object({
    id: z.string().optional(),
    name: z.string().optional().default('Pickup Origin'),
    address: z.string().optional().default(''),
    coordinates: z
      .object({ lat: z.number(), lng: z.number() })
      .optional()
      .default(APP_CONFIG.defaultCoordinates),
    senderName: z.string().optional(),
    senderPhone: z.string().optional(),
    riderNote: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
  dropoff: z.object({
    addressId: z.string().optional(),
    address: z.string().optional().default(''),
    coordinates: z
      .object({ lat: z.number(), lng: z.number() })
      .optional()
      .default(APP_CONFIG.defaultCoordinates),
  }),
  recipient: z.object({
    name: z.string().optional().default(''),
    phoneNumber: z.string().optional().default(''),
    notes: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
  dropoffs: z.array(z.any()).optional(),
  deliveryOption: z.enum(['instant', 'same_day', 'scheduled']).optional().default('instant'),
  parcel: z
    .object({
      description: z.string().optional(),
      sellerOrderRef: z.string().optional(),
      quantity: z.coerce.number().optional().default(1),
      instructions: z.string().optional(),
      itemCategory: z.string().optional(),
    })
    .optional()
    .default({}),
  cod: z
    .object({
      isCod: z.boolean().default(false),
      amount: z.coerce.number().min(0).default(0),
    })
    .optional()
    .default({ isCod: false, amount: 0 }),
});

function toSavedDraft(order: BookingOrder, userId?: string) {
  const origin = order.pickup?.address?.split(',')[0] || 'Pickup Origin';
  const dest = order.dropoff?.address?.split(',')[0] || 'Destination';
  const orderRef = order.parcel?.sellerOrderRef;
  const title = orderRef ? `${orderRef}: ${origin} → ${dest}` : `${origin} → ${dest}`;

  return {
    id: order.id,
    orderId: order.id,
    source: 'api' as const,
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

export async function GET(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    if (env.mockOrderApi || !session?.accessToken) {
      return NextResponse.json({ items: [] });
    }

    const lang = (request.headers.get('accept-language') || 'EN').slice(0, 2).toUpperCase();
    const list = await consumerOrderClient.listOrders({
      accessToken: session.accessToken,
      acceptLanguage: lang,
      page: 1,
      rpp: 25,
      status: 'draft',
    });

    return NextResponse.json({
      items: list.items.map((order) => toSavedDraft(order, session.user?.id)),
    });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: 'Failed to load drafts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const body = await request.json().catch(() => ({}));
    const parsed = draftPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || 'Invalid draft data' },
        { status: 400 },
      );
    }

    if (!env.mockOrderApi && !session?.accessToken) {
      return NextResponse.json({ message: 'Please sign in to save drafts' }, { status: 401 });
    }

    const data = parsed.data;
    const dropoffs = Array.isArray(data.dropoffs) && data.dropoffs.length > 0 ? data.dropoffs : undefined;
    const effectiveCod = dropoffs ? syncCodWithDropoffs(dropoffs, data.cod) : data.cod;
    const feeQuote = await expressApiClient.calculateFee(
      data.pickup.coordinates,
      data.dropoff.coordinates,
      session?.accessToken,
      {
        additionalStopsCount: Math.max(0, (dropoffs?.length || 1) - 1),
        deliveryOption: data.deliveryOption,
      },
    );

    const payload: CreateBookingPayload = {
      draftOrderId: data.draftOrderId,
      pickup: {
        ...data.pickup,
        name: data.pickup.name || data.pickup.address.split(',')[0] || 'Pickup Origin',
        address: data.pickup.address || 'Phnom Penh',
      },
      dropoff: {
        ...data.dropoff,
        address: data.dropoff.address || 'Phnom Penh',
      },
      dropoffs,
      deliveryOption: data.deliveryOption,
      recipient: {
        name: data.recipient.name || '',
        phoneNumber: data.recipient.phoneNumber || session?.user?.phoneNumber || '',
        notes: data.recipient.notes,
        imageUrl: data.recipient.imageUrl,
      },
      parcel: data.parcel,
      cod: effectiveCod,
      idempotencyKey: `draft-${Date.now()}`,
      feeQuote,
      isDraft: true,
    };

    if (env.mockOrderApi || !session?.accessToken) {
      const mockOrder = await expressApiClient.createBooking(payload, session?.accessToken);
      return NextResponse.json(
        { draft: toSavedDraft({ ...mockOrder, status: 'draft' }, session?.user?.id) },
        { status: 201 },
      );
    }

    const lang = (request.headers.get('accept-language') || 'EN').slice(0, 2).toUpperCase();
    const order = data.draftOrderId
      ? await consumerOrderClient.updateOrder({
          accessToken: session.accessToken,
          acceptLanguage: lang,
          orderId: data.draftOrderId,
          payload,
          fallbackPhone: session.user?.phoneNumber,
          fallbackSenderName: session.user?.name,
        })
      : await consumerOrderClient.createOrder({
          accessToken: session.accessToken,
          acceptLanguage: lang,
          payload,
          fallbackPhone: session.user?.phoneNumber,
          fallbackSenderName: session.user?.name,
        });

    return NextResponse.json(
      { draft: toSavedDraft({ ...order, status: 'draft' }, session.user?.id), order },
      { status: data.draftOrderId ? 200 : 201 },
    );
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: 'Failed to save draft' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id')?.trim();

    if (!orderId) {
      return NextResponse.json({ message: 'Draft ID is required' }, { status: 400 });
    }

    if (!env.mockOrderApi) {
      if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const lang = (request.headers.get('accept-language') || 'EN').slice(0, 2).toUpperCase();
      await consumerOrderClient.deleteOrder({
        accessToken: session.accessToken,
        acceptLanguage: lang,
        orderId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: 'Failed to delete draft' }, { status: 500 });
  }
}

