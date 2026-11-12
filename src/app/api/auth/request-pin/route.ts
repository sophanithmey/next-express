import { NextResponse } from 'next/server';
import { phoneSchema } from '@/features/auth/schemas/auth-schema';
import { authServerService } from '@/server/services/auth-server-service';
import {
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
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
