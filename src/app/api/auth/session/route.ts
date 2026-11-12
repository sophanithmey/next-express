import { NextResponse } from 'next/server';
import { authServerService } from '@/server/services/auth-server-service';
import {
  getRequestLanguage,
  handleApiRouteError,
} from '@/server/lib/api-response';

export async function GET(request: Request) {
  try {
    const shouldRefresh =
      new URL(request.url).searchParams.get('refresh') === 'true';
    const state = await authServerService.getSessionState({
      refresh: shouldRefresh,
      acceptLanguage: getRequestLanguage(request),
    });
    return NextResponse.json(state);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to read session');
  }
}
