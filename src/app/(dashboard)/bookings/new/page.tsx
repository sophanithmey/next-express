import React from 'react';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';
import { BookingLayout } from '@/components/templates/booking-layout';
import { BookingForm } from '@/components/organisms/booking-form';
import { BookingFormData } from '@/features/booking/types/booking-types';

interface NewBookingPageProps {
  searchParams: Promise<{ repeat?: string }>;
}

export default async function NewBookingPage({ searchParams }: NewBookingPageProps) {
  const session = await sessionService.getSession();
  const resolvedSearchParams = await searchParams;
  const repeatId = resolvedSearchParams.repeat;

  const locations = await expressApiClient.getSavedLocations(session?.accessToken);

  let initialDraft: Partial<BookingFormData> | undefined = undefined;

  if (repeatId) {
    const previousOrder = await expressApiClient.getBookingById(
      repeatId,
      session?.accessToken
    );

    if (previousOrder) {
      initialDraft = {
        pickup: previousOrder.pickup,
        recipient: {
          name: previousOrder.recipient.name,
          phoneNumber: previousOrder.recipient.phoneNumber,
          notes: previousOrder.recipient.notes,
        },
        dropoff: previousOrder.dropoff,
        parcel: {
          description: previousOrder.parcel.description,
          sellerOrderRef: `${previousOrder.parcel.sellerOrderRef || 'ORDER'}-REPEAT`,
          quantity: previousOrder.parcel.quantity,
        },
        cod: previousOrder.cod,
      };
    }
  }

  return (
    <BookingLayout
      title="Create Express Delivery"
      subtitle="Fast 5-step booking optimized for high-volume daily merchant orders"
    >
      <BookingForm initialLocations={locations} initialDraft={initialDraft} />
    </BookingLayout>
  );
}

