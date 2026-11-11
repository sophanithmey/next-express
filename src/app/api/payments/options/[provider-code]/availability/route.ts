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
  { params }: { params: Promise<{ 'provider-code': string }> },
) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const resolved = await params;
    const providerCode = resolved['provider-code']?.trim();
    const { searchParams } = new URL(request.url);
    const serviceType =
      searchParams.get('service_type') ||
      searchParams.get('serviceType') ||
      'ST_EXPRESS';

    if (!providerCode) {
      return NextResponse.json(
        { message: 'Missing provider code' },
        { status: 400 },
      );
    }

    if (env.mockPaymentApi) {
      return NextResponse.json(
        mockPaymentStore.checkAvailability(providerCode, serviceType),
      );
    }

    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await consumerPaymentClient.checkPaymentAvailability({
      accessToken: session.accessToken,
      acceptLanguage: getRequestLanguage(request),
      providerCode,
      serviceType,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to verify payment availability' },
      { status: 500 },
    );
  }
}

