import { NextResponse } from 'next/server';
import { resolveMapLocationSchema } from '@/features/booking/schemas/location-schema';
import { locationServerService } from '@/server/services/location-server-service';
import {
  assertSameOriginRequest,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
} from '@/server/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOriginRequest(request);
    if (csrfError) return csrfError;

    const clientIp = getClientIp(request);
    const limit = checkRateLimit(`locations:resolve:${clientIp}`, 30, 60_000);
    if (!limit.allowed) {
      return rateLimitExceededResponse(limit.retryAfterSeconds);
    }

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
