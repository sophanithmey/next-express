import { NextResponse } from 'next/server';
import { sessionService } from '@/server/auth/session-service';

export async function GET() {
  const user = await sessionService.getCurrentUser();
  if (!user) {
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    isAuthenticated: true,
    user,
  });
}
