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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ 'card-id': string }> },
) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const resolved = await params;
    const cardId = resolved['card-id']?.trim();
    const body = (await request.json().catch(() => ({}))) as {
      isDefault?: unknown;
      is_default?: unknown;
    };

    if (!cardId) {
      return NextResponse.json({ message: 'Missing card ID' }, { status: 400 });
    }

    const rawDefault =
      typeof body.isDefault === 'boolean'
        ? body.isDefault
        : typeof body.is_default === 'boolean'
        ? body.is_default
        : undefined;

    if (rawDefault === undefined) {
      return NextResponse.json(
        { message: 'isDefault boolean is required' },
        { status: 400 },
      );
    }

    if (env.mockPaymentApi) {
      mockPaymentStore.setDefaultCard(cardId, rawDefault);
      return NextResponse.json({ success: true });
    }

    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await consumerPaymentClient.configurePaymentCard({
      accessToken: session.accessToken,
      acceptLanguage: getRequestLanguage(request),
      paymentCardId: cardId,
      isDefault: rawDefault,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to update payment card setting' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ 'card-id': string }> },
) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const resolved = await params;
    const cardId = resolved['card-id']?.trim();

    if (!cardId) {
      return NextResponse.json({ message: 'Missing card ID' }, { status: 400 });
    }

    if (env.mockPaymentApi) {
      mockPaymentStore.deleteCard(cardId);
      return NextResponse.json({ success: true });
    }

    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await consumerPaymentClient.deletePaymentCard({
      accessToken: session.accessToken,
      acceptLanguage: getRequestLanguage(request),
      paymentCardId: cardId,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to delete payment card' },
      { status: 500 },
    );
  }
}

