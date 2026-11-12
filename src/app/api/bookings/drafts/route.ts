import { NextResponse } from 'next/server';
import { bookingDraftRequestSchema } from '@/features/booking/schemas/booking-schema';
import { syncCodWithDropoffs } from '@/features/booking/services/booking-form-helpers';
import { CreateBookingPayload } from '@/features/booking/types/booking-types';
import { bookingServerService } from '@/server/services/booking-server-service';
import { bookingDraftServerService } from '@/server/services/booking-draft-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const items = await bookingDraftServerService.listDrafts(
      session,
      getRequestLanguage(request),
    );
    return NextResponse.json({ items });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to load drafts');
  }
}

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const parsed = await parseRequestBody(
      request,
      bookingDraftRequestSchema,
      'Invalid draft data',
    );
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const data = parsed.data;
    const dropoffs = data.dropoffs?.length ? data.dropoffs : undefined;
    const effectiveCod = dropoffs
      ? syncCodWithDropoffs(dropoffs, data.cod)
      : data.cod;

    const feeQuote = await bookingServerService.calculateFee(
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
        name:
          data.pickup.name ||
          data.pickup.address.split(',')[0] ||
          'Pickup Origin',
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
        phoneNumber:
          data.recipient.phoneNumber || session?.user?.phoneNumber || '',
        notes: data.recipient.notes,
        imageUrl: data.recipient.imageUrl,
      },
      parcel: {
        quantity: data.parcel.quantity ?? 1,
        description: data.parcel.description,
        sellerOrderRef: data.parcel.sellerOrderRef,
        instructions: data.parcel.instructions,
        itemCategory: data.parcel.itemCategory,
      },
      cod: effectiveCod,
      idempotencyKey: `draft-${Date.now()}`,
      feeQuote,
      isDraft: true,
    };

    const result = await bookingDraftServerService.saveDraft(payload, {
      session,
      acceptLanguage: getRequestLanguage(request),
    });

    return NextResponse.json(
      result.order
        ? { draft: result.draft, order: result.order }
        : { draft: result.draft },
      { status: result.isUpdate ? 200 : 201 },
    );
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to save draft');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await sessionService.getSession();
    const orderId = new URL(request.url).searchParams.get('id')?.trim();
    if (!orderId) {
      return NextResponse.json(
        { message: 'Draft ID is required' },
        { status: 400 },
      );
    }

    await bookingDraftServerService.deleteDraft(orderId, {
      session,
      acceptLanguage: getRequestLanguage(request),
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to delete draft');
  }
}
