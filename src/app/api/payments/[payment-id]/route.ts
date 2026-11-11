import { NextResponse } from 'next/server';
import { consumerPaymentClient } from '@/server/api/consumer-payment-client';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { sessionService } from '@/server/auth/session-service';
import { getServerEnv } from '@/server/config/server-env';
import { mockPaymentStore } from '@/server/repositories/mock-payment-store';

function getRequestLanguage(request: Request): string {
  const header = request.headers.get('accept-language') || 'EN';
  return header.slice(0, 2).toUpperCase();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ 'payment-id': string }> },
) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const resolved = await params;
    const paymentId = resolved['payment-id']?.trim();

    if (!paymentId) {
      return NextResponse.json(
        { message: 'Missing payment ID' },
        { status: 400 },
      );
    }

    if (env.mockPaymentApi) {
      return NextResponse.json(mockPaymentStore.getPaymentDetail(paymentId));
    }

    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const detail = await consumerPaymentClient.getPaymentDetail({
      accessToken: session.accessToken,
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
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to retrieve payment detail' },
      { status: 500 },
    );
  }
}

