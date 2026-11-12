import { NextResponse } from 'next/server';
import { authServerService } from '@/server/services/auth-server-service';

export async function POST() {
  await authServerService.logoutCurrentSession();
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
