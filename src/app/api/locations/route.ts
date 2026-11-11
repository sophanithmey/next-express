import { NextResponse } from 'next/server';
import { createSavedLocationSchema } from '@/features/booking/schemas/location-schema';
import { expressApiClient } from '@/server/api/express-api-client';
import { consumerAddressClient } from '@/server/api/consumer-address-client';
import { ConsumerApiError } from '@/server/api/consumer-api-client';
import { sessionService } from '@/server/auth/session-service';
import { getServerEnv } from '@/server/config/server-env';

export async function GET(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();

    if (!env.mockAddressApi && session?.accessToken && session.user?.id) {
      const { searchParams } = new URL(request.url);
      const latParam = Number(searchParams.get('lat'));
      const lngParam = Number(searchParams.get('lng'));
      const langParam =
        searchParams.get('lang') ||
        request.headers.get('accept-language') ||
        'EN';

      const locations = await consumerAddressClient.getSortedAddresses({
        accessToken: session.accessToken,
        referenceId: session.user.id,
        latitude:
          Number.isFinite(latParam) && latParam !== 0 ? latParam : undefined,
        longitude:
          Number.isFinite(lngParam) && lngParam !== 0 ? lngParam : undefined,
        acceptLanguage: langParam.slice(0, 2).toUpperCase(),
        fallbackPhone: session.user.phoneNumber,
        fallbackSenderName: session.user.name,
      });
      return NextResponse.json(locations);
    }

    const locations = await expressApiClient.getSavedLocations(
      session?.accessToken,
    );
    return NextResponse.json(locations);
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to retrieve saved locations' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const session = await sessionService.getSession();
    const body = await request.json();
    const parsed = createSavedLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || 'Invalid location data' },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const contact =
      data.contact || data.senderPhone || session?.user?.phoneNumber;
    const remark = data.remark || data.riderNote;
    const langHeader = request.headers.get('accept-language') || 'EN';

    if (!env.mockAddressApi) {
      if (!session?.accessToken || !session.user?.id) {
        return NextResponse.json(
          { message: 'Please sign in to save a new location.' },
          { status: 401 },
        );
      }

      const saved = await consumerAddressClient.createAddress({
        accessToken: session.accessToken,
        referenceId: session.user.id,
        name: data.name,
        informationAddress: data.address,
        latitude: data.coordinates.lat,
        longitude: data.coordinates.lng,
        type: data.type,
        contact,
        remark,
        metadata: data.senderName
          ? { contact_name: data.senderName }
          : undefined,
        addressDetail: data.addressDetail,
        acceptLanguage: langHeader.slice(0, 2).toUpperCase(),
        fallbackPhone: session.user.phoneNumber,
        fallbackSenderName: session.user.name,
      });
      return NextResponse.json(saved, { status: 201 });
    }

    const saved = await expressApiClient.savePickupLocation(
      {
        name: data.name,
        address: data.address,
        coordinates: data.coordinates,
        senderPhone: contact,
        senderName: data.senderName || session?.user?.name,
        riderNote: remark,
      },
      session?.accessToken,
    );
    return NextResponse.json(
      { ...saved, tag: data.type || 'consumer' },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof ConsumerApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: 'Failed to save location' },
      { status: 500 },
    );
  }
}
