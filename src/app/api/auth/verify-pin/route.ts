import { NextResponse } from 'next/server';
import { z } from 'zod';
import { phoneSchema, pinSchema } from '@/features/auth/schemas/auth-schema';
import { consumerApiClient, ConsumerApiError } from '@/server/api/consumer-api-client';
import { sessionService } from '@/server/auth/session-service';

const verifyPayloadSchema = z.object({
  phoneNumber: phoneSchema.shape.phoneNumber,
  pin: pinSchema.shape.pin,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message || 'Invalid phone number or PIN',
        },
        { status: 400 }
      );
    }

    const authResult = await consumerApiClient.verifyPin({
      phoneNumber: parsed.data.phoneNumber,
      pin: parsed.data.pin,
    });

    const userProfile = authResult.user || {
      id: `seller-${parsed.data.phoneNumber}`,
      phoneNumber: parsed.data.phoneNumber,
      name: 'Express Merchant',
      role: 'SELLER',
    };

    // Establish encrypted HttpOnly session cookie
    await sessionService.createSession({
      user: userProfile,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn,
    });

    // Return safe user profile only, NEVER the accessToken
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: userProfile,
    });
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}

