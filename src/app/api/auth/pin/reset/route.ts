import { NextResponse } from 'next/server';
import { pinResetSchema } from '@/features/auth/schemas/auth-schema';
import { authServerService } from '@/server/services/auth-server-service';
import {
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
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

