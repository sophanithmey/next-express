import { NextResponse } from 'next/server';
import { phoneSchema } from '@/features/auth/schemas/auth-schema';
import { consumerApiClient, ConsumerApiError } from '@/server/api/consumer-api-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = phoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message || 'Invalid phone number format',
        },
        { status: 400 }
      );
    }

    const result = await consumerApiClient.requestPin({
      phoneNumber: parsed.data.phoneNumber,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error processing PIN request' },
      { status: 500 }
    );
  }
}
