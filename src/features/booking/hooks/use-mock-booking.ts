'use client';

import { useState } from 'react';
import { BookingFormData, BookingOrder } from '../types/booking-types';

function generateTrackingNumber(): string {
  const digits = Math.floor(10_000_000 + Math.random() * 90_000_000).toString();
  return `EXP-${digits}`;
}

function generateBookingId(): string {
  return `ord-${Date.now()}`;
}

export function useMockBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMockBooking = async (formData: BookingFormData): Promise<BookingOrder> => {
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));

    const trackingNumber = generateTrackingNumber();
    const id = generateBookingId();
    const now = new Date().toISOString();

    const order: BookingOrder = {
      id,
      trackingNumber,
      trackingUrl: `https://track.expresseller.com/${trackingNumber}`,
      status: 'confirmed',
      pickup: formData.pickup,
      dropoff: formData.dropoff,
      recipient: formData.recipient,
      parcel: formData.parcel,
      cod: formData.cod,
      deliveryFee: 1.6,
      totalSellerCharge: 1.6,
      createdAt: now,
      updatedAt: now,
    };

    setIsSubmitting(false);
    return order;
  };

  return { submitMockBooking, isSubmitting };
}

