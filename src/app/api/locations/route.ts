import { NextResponse } from 'next/server';
import { pickupSchema } from '@/features/booking/schemas/booking-schema';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';

export async function GET() {
  try {
    const session = await sessionService.getSession();
    const locations = await expressApiClient.getSavedLocations(session?.accessToken);
    return NextResponse.json(locations);
  } catch {
    return NextResponse.json({ message: 'Failed to retrieve saved locations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const body = await request.json();
    const parsed = pickupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || 'Invalid location data' },
        { status: 400 }
      );
    }

    const saved = await expressApiClient.savePickupLocation(parsed.data, session?.accessToken);
    return NextResponse.json(saved, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Failed to save location' }, { status: 500 });
  }
}

