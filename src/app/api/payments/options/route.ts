import { NextResponse } from 'next/server';
import { paymentServerService } from '@/server/services/payment-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
} from '@/server/lib/api-response';

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);

    const serviceType = searchParams.get('serviceType') || 'ST_EXPRESS';
    const pageRaw = searchParams.get('page');
    const rppRaw = searchParams.get('rpp');
    const directionRaw = searchParams.get('direction');
    const page = pageRaw ? parseInt(pageRaw, 10) : undefined;
    const rpp = rppRaw ? parseInt(rppRaw, 10) : undefined;
    const direction =
      directionRaw === 'ASC' || directionRaw === 'DESC' ? directionRaw : undefined;

    const result = await paymentServerService.listPaymentOptions({
      session,
      acceptLanguage: getRequestLanguage(request),
      serviceType,
      page: page && Number.isFinite(page) ? page : undefined,
      rpp: rpp && Number.isFinite(rpp) ? rpp : undefined,
      direction,
      property: searchParams.get('property') || undefined,
      search: searchParams.get('search') || undefined,
      filter: searchParams.get('filter') || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to load payment options');
  }
}
