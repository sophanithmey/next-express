import { NextResponse } from 'next/server';
import { pinSetupSchema } from '@/features/auth/schemas/auth-schema';
import { authServerService } from '@/server/services/auth-server-service';
import {
  handleApiRouteError,
  parseRequestBody,
  requireAuthenticatedSession,
} from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedSession('Please sign in to set up your PIN.');
    if ('errorResponse' in auth) return auth.errorResponse;

    const parsed = await parseRequestBody(request, pinSetupSchema, 'Invalid PIN');
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const result = await authServerService.setupPin({
      accessToken: auth.session.accessToken,
      newPin: parsed.data.newPin,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Unable to configure PIN', {
      includeSuccessFalse: true,
    });
  }
}

