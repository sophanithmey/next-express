import { NextResponse } from 'next/server';
import { paymentServerService } from '@/server/services/payment-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
} from '@/server/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ 'provider-code': string }> },
) {
  try {
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

    const result = await paymentServerService.checkAvailability({
      session,
      acceptLanguage: getRequestLanguage(request),
      providerCode,
      serviceType,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to verify payment availability');
  }
}
