import { NextResponse } from 'next/server';
import { sessionService } from '@/server/auth/session-service';
import { consumerApiClient } from '@/server/api/consumer-api-client';

export async function POST() {
  try {
    const session = await sessionService.getSession();
    if (session?.accessToken) {
      await consumerApiClient.logout(session.accessToken);
    }
  } catch {
    // await sessionService.clearSession();
  } finally {
    await sessionService.clearSession();
  }

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
