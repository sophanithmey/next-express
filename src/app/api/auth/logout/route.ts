import { NextResponse } from 'next/server';
import { sessionService } from '@/server/auth/session-service';

export async function POST() {
  await sessionService.clearSession();
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
