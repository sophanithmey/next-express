import { NextResponse } from 'next/server';
import { createSavedLocationSchema } from '@/features/booking/schemas/location-schema';
import { locationServerService } from '@/server/services/location-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);
    const latParam = Number(searchParams.get('lat'));
    const lngParam = Number(searchParams.get('lng'));
    const langParam = searchParams.get('lang');
    const acceptLanguage = langParam
      ? langParam.slice(0, 2).toUpperCase()
      : getRequestLanguage(request);

    const locations = await locationServerService.listSavedLocations({
      session,
      acceptLanguage,
      latitude: Number.isFinite(latParam) && latParam !== 0 ? latParam : undefined,
      longitude: Number.isFinite(lngParam) && lngParam !== 0 ? lngParam : undefined,
    });
    return NextResponse.json(locations);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to retrieve saved locations');
  }
}

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const parsed = await parseRequestBody(
      request,
      createSavedLocationSchema,
      'Invalid location data',
    );
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const saved = await locationServerService.createSavedLocation({
      data: parsed.data,
      session,
      acceptLanguage: getRequestLanguage(request),
    });
    return NextResponse.json(saved, { status: 201 });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to save location');
  }
}
