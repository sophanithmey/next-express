import { NextResponse } from 'next/server';
import { updatePaymentCardSettingSchema } from '@/features/payment/schemas/payment-schema';
import { paymentServerService } from '@/server/services/payment-server-service';
import { sessionService } from '@/server/lib/session';
import {
  getRequestLanguage,
  handleApiRouteError,
  parseRequestBody,
} from '@/server/lib/api-response';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ 'card-id': string }> },
) {
  try {
    const session = await sessionService.getSession();
    const cardId = (await params)['card-id']?.trim();
    if (!cardId) {
      return NextResponse.json({ message: 'Missing card ID' }, { status: 400 });
    }

    const parsed = await parseRequestBody(
      request,
      updatePaymentCardSettingSchema,
      'isDefault boolean is required',
    );
    if ('errorResponse' in parsed) return parsed.errorResponse;

    const isDefault =
      typeof parsed.data.isDefault === 'boolean'
        ? parsed.data.isDefault
        : Boolean(parsed.data.is_default);

    await paymentServerService.setDefaultCard({
      session,
      acceptLanguage: getRequestLanguage(request),
      cardId,
      isDefault,
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to update payment card setting');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ 'card-id': string }> },
) {
  try {
    const session = await sessionService.getSession();
    const cardId = (await params)['card-id']?.trim();
    if (!cardId) {
      return NextResponse.json({ message: 'Missing card ID' }, { status: 400 });
    }

    await paymentServerService.deleteCard({
      session,
      acceptLanguage: getRequestLanguage(request),
      cardId,
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleApiRouteError(error, 'Failed to delete payment card');
  }
}
