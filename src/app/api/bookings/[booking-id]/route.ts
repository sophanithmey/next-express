import { NextResponse } from 'next/server';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ 'booking-id': string }> }
) {
  try {
    const session = await sessionService.getSession();
    const resolvedParams = await params;
    const bookingId = resolvedParams['booking-id'];

    if (!bookingId) {
      return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
    }

    const booking = await expressApiClient.getBookingById(bookingId, session?.accessToken);

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ message: 'Failed to retrieve booking' }, { status: 500 });
  }
}

