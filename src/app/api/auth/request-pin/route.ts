import { NextResponse } from 'next/server';
import { phoneSchema } from '@/features/auth/schemas/auth-schema';
import { authServerService } from '@/server/services/auth-server-service';
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

const REQUEST_PIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOriginRequest(request);
    if (csrfError) return csrfError;

    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(
      `auth:request-pin:ip:${clientIp}`,
      25,
      REQUEST_PIN_WINDOW_MS,
    );
    if (!ipLimit.allowed) {
      return rateLimitExceededResponse(ipLimit.retryAfterSeconds);
    }

    const parsed = await parseRequestBody(
      request,
      phoneSchema,
      'Invalid phone number format',
    );
    if ('errorResponse' in parsed) {
      const body = (await parsed.errorResponse.json()) as { message?: string };
      return NextResponse.json(
        { success: false, message: body.message || 'Invalid phone number format' },
        { status: 400 },
      );
    }

    const result = await authServerService.requestPin({
      phoneNumber: parsed.data.phoneNumber,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleApiRouteError(
      error,
      'Internal server error processing PIN request',
      { includeSuccessFalse: true },
    );
  }
}
