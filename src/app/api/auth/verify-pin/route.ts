import { NextResponse } from 'next/server';
import { verifyPinPayloadSchema } from '@/features/auth/schemas/auth-schema';
import { authServerService } from '@/server/services/auth-server-service';
import {
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
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
