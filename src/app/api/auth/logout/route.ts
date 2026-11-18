import { NextResponse } from 'next/server';
import { authServerService } from '@/server/services/auth-server-service';
import { assertSameOriginRequest } from '@/server/lib/api-response';

export async function POST(request: Request) {
  const csrfError = assertSameOriginRequest(request);
  if (csrfError) return csrfError;

  await authServerService.logoutCurrentSession();
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
