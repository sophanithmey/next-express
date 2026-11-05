import { describe, it, expect } from 'vitest';
import { phoneSchema, pinSchema } from '@/features/auth/schemas/auth-schema';
import {
  bookingFormSchema,
  codSchema,
  coordinatesSchema,
  pickupSchema,
  recipientSchema,
} from '@/features/booking/schemas/booking-schema';

describe('Authentication Validation Schemas', () => {
  it('validates standard phone numbers correctly', () => {
    const valid = phoneSchema.safeParse({ phoneNumber: '012 888 999' });
    expect(valid.success).toBe(true);

    const validIntl = phoneSchema.safeParse({ phoneNumber: '+855 12 345 678' });
    expect(validIntl.success).toBe(true);
  });

  it('rejects too short or invalid phone numbers', () => {
    const short = phoneSchema.safeParse({ phoneNumber: '123' });
    expect(short.success).toBe(false);

    const invalidChars = phoneSchema.safeParse({ phoneNumber: '012abc888' });
    expect(invalidChars.success).toBe(false);
  });

  it('validates 4-digit PIN codes strictly', () => {
    const valid = pinSchema.safeParse({ pin: '1234' });
    expect(valid.success).toBe(true);

    const tooShort = pinSchema.safeParse({ pin: '12' });
    expect(tooShort.success).toBe(false);

    const nonDigits = pinSchema.safeParse({ pin: '12a4' });
    expect(nonDigits.success).toBe(false);
  });
});

describe('Booking Validation Schemas', () => {
  it('validates geographical coordinates within legal bounds', () => {
    const valid = coordinatesSchema.safeParse({ lat: 11.5564, lng: 104.9282 });
    expect(valid.success).toBe(true);

    const invalidLat = coordinatesSchema.safeParse({ lat: 95.0, lng: 104.0 });
    expect(invalidLat.success).toBe(false);
  });

  it('requires COD amount greater than 0 when COD is enabled', () => {
    const validCod = codSchema.safeParse({ isCod: true, amount: 25.5 });
    expect(validCod.success).toBe(true);

    const invalidZeroCod = codSchema.safeParse({ isCod: true, amount: 0 });
    expect(invalidZeroCod.success).toBe(false);

    const noCodZeroAmount = codSchema.safeParse({ isCod: false, amount: 0 });
    expect(noCodZeroAmount.success).toBe(true);
  });

  it('validates complete booking form data', () => {
    const payload = {
      pickup: {
        name: 'Main Warehouse',
        address: 'St 271, Phnom Penh',
        coordinates: { lat: 11.532, lng: 104.912 },
      },
      recipient: {
        name: 'Sokha Chan',
        phoneNumber: '012998877',
      },
      isBookingOnBehalf: false,
      dropoff: {
        address: 'St 2004, Phnom Penh',
        coordinates: { lat: 11.545, lng: 104.862 },
      },
      parcel: {
        description: 'Clothes',
        quantity: 2,
      },
      cod: {
        isCod: true,
        amount: 30.0,
      },
    };

    const result = bookingFormSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
