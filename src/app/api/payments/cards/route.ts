import { NextResponse } from 'next/server';
import { createPaymentCardSchema } from '@/features/payment/schemas/payment-schema';
import { paymentServerService } from '@/server/services/payment-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const cards = await paymentServerService.listCards({
      session,
      acceptLanguage: getRequestLanguage(request),
    });
    return NextResponse.json({ cards });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to retrieve payment cards');
  }
}

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const parsed = await parseRequestBody(
      request,
      createPaymentCardSchema,
      'Invalid card payload',
    );
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const result = await paymentServerService.createCard({
      session,
      acceptLanguage: getRequestLanguage(request),
      platform: parsed.data.platform || 'UNIFIED',
      provider: parsed.data.provider,
      serviceCode:
        parsed.data.serviceCode || parsed.data.service_code || 'ST_EXPRESS',
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to register payment card');
  }
}
