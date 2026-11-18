import { NextResponse } from 'next/server';
import { createBookingRequestSchema } from '@/features/booking/schemas/booking-schema';
import { syncCodWithDropoffs } from '@/features/booking/services/booking-form-helpers';
import { validatePromoCode } from '@/features/booking/services/promo-service';
import {
  mergeOrderFilters,
  parseBookingOrderFilterParam,
} from '@/features/booking/services/booking-order-filter';
import { BookingDatePreset } from '@/features/booking/services/booking-date-filter';
import { CreateBookingPayload } from '@/features/booking/types/booking-types';
import { bookingServerService } from '@/server/services/booking-server-service';
import { sessionService } from '@/server/lib/session';
import {
  assertSameOriginRequest,
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

const MAX_PAGE_SIZE = 100;
const MAX_PAGE_NUMBER = 10_000;

function parseBoundedInt(
  value: string | null,
  fallback: number,
  max: number,
): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function sanitizeIdempotencyKey(raw: string | null): string {
  const trimmed = raw?.trim();
  if (trimmed && /^[A-Za-z0-9_.:-]{4,128}$/.test(trimmed)) {
    return trimmed;
  }
  return `idem-${crypto.randomUUID()}`;
}

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || undefined;
    const status = searchParams.get('status')?.trim() || undefined;
    const datePreset = (searchParams.get('datePreset')?.trim() as BookingDatePreset) || undefined;
    const startDate = searchParams.get('startDate')?.trim() || undefined;
    const endDate = searchParams.get('endDate')?.trim() || undefined;
    const page = parseBoundedInt(searchParams.get('page'), 1, MAX_PAGE_NUMBER);
    const rpp = parseBoundedInt(
      searchParams.get('rpp') ?? searchParams.get('limit'),
      10,
      MAX_PAGE_SIZE,
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
      datePreset,
      startDate,
      endDate,
      filter: mergeOrderFilters(filterResult.filters, status),
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to retrieve bookings');
  }
}

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOriginRequest(request);
    if (csrfError) return csrfError;

    const session = await sessionService.getSession();
    const parsed = await parseRequestBody(request, createBookingRequestSchema);
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const data = parsed.data;
    const idempotencyKey = sanitizeIdempotencyKey(
      request.headers.get('x-idempotency-key'),
    );

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

    // Server-side financial verification: never trust raw client discount or finalFee
    let validatedDiscount = 0;
    let validatedPromoCode: string | undefined;
    if (data.promoCode) {
      const promoResult = validatePromoCode(
        data.promoCode,
        feeQuote.totalDeliveryFee,
      );
      if (promoResult.isValid && promoResult.promo) {
        validatedPromoCode = promoResult.promo.code;
        const requestedDiscount =
          typeof data.discountAmount === 'number'
            ? Math.max(0, data.discountAmount)
            : promoResult.discountAmount;
        validatedDiscount =
          Math.round(
            Math.min(
              requestedDiscount,
              promoResult.discountAmount,
              feeQuote.totalDeliveryFee,
            ) * 100,
          ) / 100;
      }
    }

    const validatedTip =
      typeof data.tipAmount === 'number'
        ? Math.round(Math.min(100, Math.max(0, data.tipAmount)) * 100) / 100
        : 0;

    const computedFinalFee =
      Math.round(
        (Math.max(0, feeQuote.totalDeliveryFee - validatedDiscount) +
          validatedTip) *
          100,
      ) / 100;

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
      promoCode: validatedPromoCode,
      discountAmount: validatedDiscount > 0 ? validatedDiscount : undefined,
      tipAmount: validatedTip > 0 ? validatedTip : undefined,
      finalFee: computedFinalFee,
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
