import { NextResponse } from 'next/server';
import { paymentServerService } from '@/server/services/payment-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
} from '@/server/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ 'payment-id': string }> },
) {
  try {
    const session = await sessionService.getSession();
    const paymentId = (await params)['payment-id']?.trim();
    if (!paymentId) {
      return NextResponse.json(
        { message: 'Missing payment ID' },
        { status: 400 },
      );
    }

    const detail = await paymentServerService.getPaymentDetail({
      session,
      acceptLanguage: getRequestLanguage(request),
      paymentId,
    });
    if (!detail) {
      return NextResponse.json(
        { message: 'Payment detail not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(detail);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to retrieve payment detail');
  }
}
