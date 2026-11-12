import { NextResponse } from 'next/server';
import { resolveMapLocationSchema } from '@/features/booking/schemas/location-schema';
import { locationServerService } from '@/server/services/location-server-service';
import {
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
    const parsed = await parseRequestBody(
      request,
      resolveMapLocationSchema,
      'Location input is required',
    );
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const resolved = await locationServerService.resolveMapLocationInput(
      parsed.data.input,
    );
    return NextResponse.json(resolved);
  } catch (error: unknown) {
    return handleApiRouteError(
      error,
      'Unable to resolve Google Maps link right now.',
    );
  }
}
