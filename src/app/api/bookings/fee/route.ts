import { NextResponse } from 'next/server';
import { z } from 'zod';
import { coordinatesSchema } from '@/features/booking/schemas/booking-schema';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';

const feeCalculationSchema = z.object({
  pickup: coordinatesSchema,
  dropoff: coordinatesSchema,
  additionalStopsCount: z.number().int().min(0).optional(),
  deliveryOption: z.enum(['instant', 'same_day', 'scheduled']).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const body = await request.json();
    const parsed = feeCalculationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid coordinates provided for fee calculation' },
        { status: 400 }
      );
    }

    const feeQuote = await expressApiClient.calculateFee(
      parsed.data.pickup,
      parsed.data.dropoff,
      session?.accessToken,
      {
        additionalStopsCount: parsed.data.additionalStopsCount,
        deliveryOption: parsed.data.deliveryOption,
      }
    );

    return NextResponse.json(feeQuote);
  } catch {
    return NextResponse.json({ message: 'Failed to calculate delivery fee' }, { status: 500 });
  }
}

