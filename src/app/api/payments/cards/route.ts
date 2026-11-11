import { NextResponse } from 'next/server';
import { z } from 'zod';
import { consumerPaymentClient } from '@/server/api/consumer-payment-client';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { sessionService } from '@/server/auth/session-service';
import { getServerEnv } from '@/server/config/server-env';
import { mockPaymentStore } from '@/server/repositories/mock-payment-store';

const createCardSchema = z.object({
  platform: z.string().trim().min(1).optional(),
  provider: z.string().trim().min(1),
  serviceCode: z.string().trim().min(1).optional(),
  service_code: z.string().trim().min(1).optional(),
});

function getRequestLanguage(request: Request): string {
  const header = request.headers.get('accept-language') || 'EN';
  return header.slice(0, 2).toUpperCase();
}

export async function GET(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();

    if (env.mockPaymentApi) {
      return NextResponse.json({ cards: mockPaymentStore.listCards() });
    }

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Please sign in to view saved cards' },
        { status: 401 },
      );
    }

    const cards = await consumerPaymentClient.listPaymentCards({
      accessToken: session.accessToken,
      acceptLanguage: getRequestLanguage(request),
    });

    return NextResponse.json({ cards });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to retrieve payment cards' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const body = await request.json().catch(() => ({}));
    const parsed = createCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || 'Invalid card payload' },
        { status: 400 },
      );
    }

    const platform = parsed.data.platform || 'UNIFIED';
    const provider = parsed.data.provider;
    const serviceCode =
      parsed.data.serviceCode || parsed.data.service_code || 'ST_EXPRESS';

    if (env.mockPaymentApi) {
      const card = mockPaymentStore.createMockCard();
      return NextResponse.json({ card, redirectUrl: undefined }, { status: 201 });
    }

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: 'Please sign in to link a payment card' },
        { status: 401 },
      );
    }

    const result = await consumerPaymentClient.createPaymentCard({
      accessToken: session.accessToken,
      acceptLanguage: getRequestLanguage(request),
      platform,
      provider,
      serviceCode,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to create payment card' },
      { status: 500 },
    );
  }
}

