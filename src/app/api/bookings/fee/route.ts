import { NextResponse } from 'next/server';
import { feeCalculationSchema } from '@/features/booking/schemas/booking-schema';
import { bookingServerService } from '@/server/services/booking-server-service';
import { sessionService } from '@/server/lib/session';
import {
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
    const session = await sessionService.getSession();
    const parsed = await parseRequestBody(
      request,
      feeCalculationSchema,
      'Invalid coordinates provided for fee calculation',
    );
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const feeQuote = await bookingServerService.calculateFee(
      parsed.data.pickup,
      parsed.data.dropoff,
      session?.accessToken,
      {
        additionalStopsCount: parsed.data.additionalStopsCount,
        deliveryOption: parsed.data.deliveryOption,
      },
    );

    return NextResponse.json(feeQuote);
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to calculate delivery fee');
  }
}
