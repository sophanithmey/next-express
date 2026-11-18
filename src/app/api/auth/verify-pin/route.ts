import { NextResponse } from 'next/server';
import { verifyPinPayloadSchema } from '@/features/auth/schemas/auth-schema';
import { authServerService } from '@/server/services/auth-server-service';
import {
  assertSameOriginRequest,
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
} from '@/server/lib/rate-limit';

const VERIFY_PIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOriginRequest(request);
    if (csrfError) return csrfError;

    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(
      `auth:verify-pin:ip:${clientIp}`,
      30,
      VERIFY_PIN_WINDOW_MS,
    );
    if (!ipLimit.allowed) {
      return rateLimitExceededResponse(
        ipLimit.retryAfterSeconds,
        'Too many login attempts. Please wait and try again.',
      );
    }

    const parsed = await parseRequestBody(
      request,
      verifyPinPayloadSchema,
      'Invalid phone number or PIN',
    );
    if ('errorResponse' in parsed) {
      const body = (await parsed.errorResponse.json()) as { message?: string };
      return NextResponse.json(
        { success: false, message: body.message || 'Invalid phone number or PIN' },
        { status: 400 },
      );
    }

    const normalizedPhone = parsed.data.phoneNumber.replace(/[^\d]/g, '');
    const accountLimit = checkRateLimit(
      `auth:verify-pin:acct:${clientIp}:${normalizedPhone}`,
      10,
      VERIFY_PIN_WINDOW_MS,
    );
    if (!accountLimit.allowed) {
      return rateLimitExceededResponse(
        accountLimit.retryAfterSeconds,
        'Too many PIN attempts for this account. Please try again later.',
      );
    }

    const user = await authServerService.loginWithPinAndCreateSession(
      { phoneNumber: parsed.data.phoneNumber, pin: parsed.data.pin },
      getRequestLanguage(request),
    );

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user,
    });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Authentication verification failed', {
      includeSuccessFalse: true,
    });
  }
}
