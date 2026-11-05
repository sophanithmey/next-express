import { NextResponse } from 'next/server';
import { bookingFormSchema } from '@/features/booking/schemas/booking-schema';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

    const data = await expressApiClient.getBookings(
      { search, status, page, limit },
      session?.accessToken
    );

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const body = await request.json();

    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.errors[0]?.message || 'Validation failed',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const idempotencyKey =
      request.headers.get('x-idempotency-key') ||
      `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Verify pricing server-side to avoid client tampering
    const feeQuote = await expressApiClient.calculateFee(
      parsed.data.pickup.coordinates,
      parsed.data.dropoff.coordinates,
      session?.accessToken
    );

    const createdBooking = await expressApiClient.createBooking(
      {
        pickup: parsed.data.pickup,
        dropoff: parsed.data.dropoff,
        recipient: parsed.data.recipient,
        parcel: parsed.data.parcel,
        cod: parsed.data.cod,
        idempotencyKey,
        feeQuote,
      },
      session?.accessToken
    );

    return NextResponse.json(createdBooking, { status: 201 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

