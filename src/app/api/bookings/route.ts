import { NextResponse } from 'next/server';
import { createBookingRequestSchema } from '@/features/booking/schemas/booking-schema';
import { syncCodWithDropoffs } from '@/features/booking/services/booking-form-helpers';
import {
  mergeOrderFilters,
  parseBookingOrderFilterParam,
} from '@/features/booking/services/booking-order-filter';
import { CreateBookingPayload } from '@/features/booking/types/booking-types';
import { bookingServerService } from '@/server/services/booking-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || undefined;
    const status = searchParams.get('status')?.trim() || undefined;
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const rpp = parsePositiveInt(
      searchParams.get('rpp') ?? searchParams.get('limit'),
      10,
    );
    const directionRaw = searchParams.get('direction')?.trim().toUpperCase();
    const direction =
      directionRaw === 'ASC' || directionRaw === 'DESC' ? directionRaw : undefined;
    const property = searchParams.get('property')?.trim() || undefined;

    const filterResult = parseBookingOrderFilterParam(searchParams.get('filter'));
    if (filterResult.error) {
      return NextResponse.json({ message: filterResult.error }, { status: 400 });
    }

    const data = await bookingServerService.listBookings({
      session,
      acceptLanguage: getRequestLanguage(request),
      page,
      rpp,
      direction,
      property,
      search,
      status,
      filter: mergeOrderFilters(filterResult.filters, status),
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to retrieve bookings');
  }
}

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const parsed = await parseRequestBody(request, createBookingRequestSchema);
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const data = parsed.data;
    const idempotencyKey =
      request.headers.get('x-idempotency-key') ||
      `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const additionalStopsCount = Math.max(0, (data.dropoffs?.length || 1) - 1);
    const deliveryOption = data.deliveryOption || 'instant';
    const effectiveCod = data.dropoffs?.length
      ? syncCodWithDropoffs(data.dropoffs, data.cod)
      : data.cod;

    const feeQuote = await bookingServerService.calculateFee(
      data.pickup.coordinates,
      data.dropoff.coordinates,
      session?.accessToken,
      { additionalStopsCount, deliveryOption },
    );

    const payload: CreateBookingPayload = {
      draftOrderId: data.draftOrderId,
      pickup: data.pickup,
      dropoff: data.dropoff,
      dropoffs: data.dropoffs,
      deliveryOption,
      recipient: data.recipient,
      parcel: data.parcel,
      cod: effectiveCod,
      idempotencyKey,
      feeQuote,
      trackingNumber: data.trackingNumber,
      paymentMethod: data.paymentMethod,
      paymentCardId: data.paymentCardId,
      promoCode: data.promoCode,
      discountAmount: data.discountAmount,
      tipAmount: data.tipAmount,
      finalFee: data.finalFee,
      isDraft: Boolean(data.isDraft),
    };

    const createdBooking = await bookingServerService.createBooking(payload, {
      session,
      acceptLanguage: getRequestLanguage(request),
    });
    return NextResponse.json(createdBooking, { status: 201 });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to create booking');
  }
}
