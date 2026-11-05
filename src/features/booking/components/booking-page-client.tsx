'use client';

import React from 'react';
import { BookingForm } from '@/components/organisms/booking-form';
import { PickupLocation } from '../types/booking-types';

interface BookingPageClientProps {
  initialLocations: PickupLocation[];
}

export function BookingPageClient({ initialLocations }: BookingPageClientProps) {
  return <BookingForm initialLocations={initialLocations} />;
}
