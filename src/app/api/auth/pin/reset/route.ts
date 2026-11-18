import { NextResponse } from 'next/server';
import { pinResetSchema } from '@/features/auth/schemas/auth-schema';
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

const PIN_RESET_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOriginRequest(request);
    if (csrfError) return csrfError;

    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(
      `auth:pin-reset:ip:${clientIp}`,
      8,
      PIN_RESET_WINDOW_MS,
    );
    if (!ipLimit.allowed) {
      return rateLimitExceededResponse(
        ipLimit.retryAfterSeconds,
        'Too many PIN reset attempts. Please try again later.',
      );
    }

    const parsed = await parseRequestBody(
      request,
      pinResetSchema,
      'Invalid PIN reset request',
    );
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const result = await authServerService.resetPin(parsed.data);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Unable to reset PIN', {
      includeSuccessFalse: true,
    });
  }
}

