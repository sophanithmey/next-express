import { NextResponse } from 'next/server';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';

export async function GET(request: Request) {
  try {
    const session = await sessionService.getSession();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const recipients = await expressApiClient.searchRecipients(query, session?.accessToken);
    return NextResponse.json(recipients);
  } catch {
    return NextResponse.json({ message: 'Failed to search recipients' }, { status: 500 });
  }
}

