import { NextResponse } from 'next/server';
import { bookingFormSchema } from '@/features/booking/schemas/booking-schema';
import { syncCodWithDropoffs } from '@/features/booking/services/booking-form-helpers';
import { CreateBookingPayload } from '@/features/booking/types/booking-types';
import { expressApiClient } from '@/server/api/express-api-client';
import { consumerOrderClient } from '@/server/api/consumer-order-client';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { sessionService } from '@/server/auth/session-service';
import { getServerEnv } from '@/server/config/server-env';

function getRequestLanguage(request: Request): string {
  const header = request.headers.get('accept-language') || 'EN';
  return header.slice(0, 2).toUpperCase();
}

export async function GET(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

    if (!env.mockOrderApi) {
      if (!session?.accessToken) {
        return NextResponse.json(
          { message: 'Please sign in to view bookings' },
          { status: 401 },
        );
      }

      const data = await consumerOrderClient.listOrders({
        accessToken: session.accessToken,
        acceptLanguage: getRequestLanguage(request),
        page: Number.isFinite(page) && page > 0 ? page : 1,
        rpp: Number.isFinite(limit) && limit > 0 ? limit : 10,
        search,
        status,
      });
      return NextResponse.json(data);
    }

    const data = await expressApiClient.getBookings(
      { search, status, page, limit },
      session?.accessToken,
    );

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const body = await request.json();

    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.errors[0]?.message || 'Validation failed',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const idempotencyKey =
      request.headers.get('x-idempotency-key') ||
      `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const additionalStopsCount = Math.max(0, (parsed.data.dropoffs?.length || 1) - 1);
    const deliveryOption = parsed.data.deliveryOption || 'instant';
    const effectiveCod = parsed.data.dropoffs?.length
      ? syncCodWithDropoffs(parsed.data.dropoffs, parsed.data.cod)
      : parsed.data.cod;

    const feeQuote = await expressApiClient.calculateFee(
      parsed.data.pickup.coordinates,
      parsed.data.dropoff.coordinates,
      session?.accessToken,
      { additionalStopsCount, deliveryOption },
    );

    const payload: CreateBookingPayload = {
      draftOrderId: typeof body.draftOrderId === 'string' ? body.draftOrderId : undefined,
      pickup: parsed.data.pickup,
      dropoff: parsed.data.dropoff,
      dropoffs: parsed.data.dropoffs,
      deliveryOption,
      recipient: parsed.data.recipient,
      parcel: parsed.data.parcel,
      cod: effectiveCod,
      idempotencyKey,
      feeQuote,
      trackingNumber: typeof body.trackingNumber === 'string' ? body.trackingNumber : undefined,
      paymentMethod: typeof body.paymentMethod === 'string' ? body.paymentMethod : undefined,
      paymentCardId: typeof body.paymentCardId === 'string' ? body.paymentCardId : undefined,
      promoCode: typeof body.promoCode === 'string' ? body.promoCode : undefined,
      discountAmount: typeof body.discountAmount === 'number' ? body.discountAmount : undefined,
      tipAmount: typeof body.tipAmount === 'number' ? body.tipAmount : undefined,
      finalFee: typeof body.finalFee === 'number' ? body.finalFee : undefined,
      isDraft: Boolean(body.isDraft),
    };

    if (!env.mockOrderApi) {
      if (!session?.accessToken) {
        return NextResponse.json(
          { message: 'Please sign in to create a delivery order' },
          { status: 401 },
        );
      }

      const acceptLanguage = getRequestLanguage(request);
      const createdBooking = payload.isDraft
        ? await consumerOrderClient.createOrder({
            accessToken: session.accessToken,
            acceptLanguage,
            payload,
            fallbackPhone: session.user?.phoneNumber,
            fallbackSenderName: session.user?.name,
          })
        : await consumerOrderClient.createAndCheckoutOrder({
            accessToken: session.accessToken,
            acceptLanguage,
            payload,
            fallbackPhone: session.user?.phoneNumber,
            fallbackSenderName: session.user?.name,
          });

      return NextResponse.json(createdBooking, { status: 201 });
    }

    const createdBooking = await expressApiClient.createBooking(payload, session?.accessToken);
    return NextResponse.json(createdBooking, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
