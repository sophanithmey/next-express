import { NextResponse } from 'next/server';
import { bookingPatchSchema } from '@/features/booking/schemas/booking-schema';
import { bookingServerService } from '@/server/services/booking-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ 'booking-id': string }> },
) {
  try {
    const session = await sessionService.getSession();
    const { 'booking-id': bookingId } = await params;
    if (!bookingId) {
      return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
    }

    const booking = await bookingServerService.getBookingById(bookingId, {
      session,
      acceptLanguage: getRequestLanguage(request),
    });
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to retrieve booking');
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ 'booking-id': string }> },
) {
  try {
    const session = await sessionService.getSession();
    const { 'booking-id': bookingId } = await params;
    if (!bookingId) {
      return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
    }

    const parsed = await parseRequestBody(request, bookingPatchSchema, 'Invalid action');
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const acceptLanguage = getRequestLanguage(request);
    if (parsed.data.action === 'cancel') {
      const updated = await bookingServerService.cancelBooking(bookingId, {
        session,
        acceptLanguage,
        reason: parsed.data.reason,
      });
      if (!updated) {
        return NextResponse.json(
          { message: 'Cannot cancel this booking in its current state' },
          { status: 400 },
        );
      }
      return NextResponse.json(updated);
    }

    const result = await bookingServerService.checkoutBooking(bookingId, {
      session,
      acceptLanguage,
      metadata: parsed.data.metadata,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to update booking');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ 'booking-id': string }> },
) {
  try {
    const session = await sessionService.getSession();
    const { 'booking-id': bookingId } = await params;
    if (!bookingId) {
      return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
    }

    await bookingServerService.deleteBooking(bookingId, {
      session,
      acceptLanguage: getRequestLanguage(request),
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to delete booking');
  }
}
