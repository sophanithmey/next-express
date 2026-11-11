import { NextResponse } from 'next/server';
import { expressApiClient } from '@/server/api/express-api-client';
import { consumerOrderClient } from '@/server/api/consumer-order-client';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { sessionService } from '@/server/auth/session-service';
import { getServerEnv } from '@/server/config/server-env';

function getLang(request: Request): string {
  return (request.headers.get('accept-language') || 'EN').slice(0, 2).toUpperCase();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ 'booking-id': string }> },
) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const resolvedParams = await params;
    const bookingId = resolvedParams['booking-id'];

    if (!bookingId) {
      return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
    }

    if (!env.mockOrderApi) {
      if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const order = await consumerOrderClient.getOrder({
        accessToken: session.accessToken,
        acceptLanguage: getLang(request),
        orderId: bookingId,
      });
      if (!order) {
        return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    const booking = await expressApiClient.getBookingById(bookingId, session?.accessToken);
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: 'Failed to retrieve booking' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ 'booking-id': string }> },
) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const resolvedParams = await params;
    const bookingId = resolvedParams['booking-id'];
    const body = await request.json().catch(() => ({}));

    if (!bookingId) {
      return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
    }

    if (!env.mockOrderApi) {
      if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const acceptLanguage = getLang(request);
      if (body.action === 'cancel') {
        await consumerOrderClient.cancelOrder({
          accessToken: session.accessToken,
          acceptLanguage,
          orderId: bookingId,
          reason: typeof body.reason === 'string' ? body.reason : undefined,
        });
        const refreshed = await consumerOrderClient
          .getOrder({ accessToken: session.accessToken, acceptLanguage, orderId: bookingId })
          .catch(() => null);
        return NextResponse.json(refreshed || { id: bookingId, status: 'cancelled' });
      }

      if (body.action === 'checkout') {
        const result = await consumerOrderClient.checkoutOrder({
          accessToken: session.accessToken,
          acceptLanguage,
          orderId: bookingId,
          metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
        });
        return NextResponse.json(result);
      }

      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (body.action === 'cancel') {
      const updated = await expressApiClient.cancelBooking(
        bookingId,
        body.reason,
        session?.accessToken,
      );
      if (!updated) {
        return NextResponse.json(
          { message: 'Cannot cancel this booking in its current state' },
          { status: 400 },
        );
      }
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ 'booking-id': string }> },
) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const resolvedParams = await params;
    const bookingId = resolvedParams['booking-id'];

    if (!bookingId) {
      return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
    }

    if (!env.mockOrderApi) {
      if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      await consumerOrderClient.deleteOrder({
        accessToken: session.accessToken,
        acceptLanguage: getLang(request),
        orderId: bookingId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: 'Failed to delete booking' }, { status: 500 });
  }
}
