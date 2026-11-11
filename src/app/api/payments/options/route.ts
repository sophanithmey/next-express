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

export async function GET(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);

    const serviceType = searchParams.get('serviceType') || 'ST_EXPRESS';
    const pageRaw = searchParams.get('page');
    const rppRaw = searchParams.get('rpp');
    const directionRaw = searchParams.get('direction');
    const property = searchParams.get('property') || undefined;
    const search = searchParams.get('search') || undefined;
    const filter = searchParams.get('filter') || undefined;

    if (env.mockPaymentApi) {
      return NextResponse.json({
        options: mockPaymentStore.getOptions(),
        source: 'mock',
      });
    }

    if (!session?.accessToken) {
      return NextResponse.json({
        options: mockPaymentStore.getOptions(),
        source: 'preview',
      });
    }

    const page = pageRaw ? parseInt(pageRaw, 10) : undefined;
    const rpp = rppRaw ? parseInt(rppRaw, 10) : undefined;
    const direction =
      directionRaw === 'ASC' || directionRaw === 'DESC' ? directionRaw : undefined;

    const options = await consumerPaymentClient.listPaymentOptions({
      accessToken: session.accessToken,
      acceptLanguage: getRequestLanguage(request),
      serviceType,
      page: page && Number.isFinite(page) ? page : undefined,
      rpp: rpp && Number.isFinite(rpp) ? rpp : undefined,
      direction,
      property,
      search,
      filter,
    });

    return NextResponse.json({
      options: options.length > 0 ? options : mockPaymentStore.getOptions(),
      source: options.length > 0 ? 'live' : 'preview',
    });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to load payment options' },
      { status: 500 },
    );
  }
}

