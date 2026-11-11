import { describe, it, expect } from 'vitest';
import { phoneSchema, pinSchema } from '@/features/auth/schemas/auth-schema';
import {
  bookingFormSchema,
  codSchema,
  coordinatesSchema,
  pickupSchema,
  recipientSchema,
} from '@/features/booking/schemas/booking-schema';
import {
  isDropoffStopDirty,
  validateDropoffStops,
} from '@/features/booking/services/booking-form-helpers';

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
        senderPhone: '012888999',
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

  it('validates required pickup contact phone', () => {
    const validPickup = pickupSchema.safeParse({
      name: 'Main Warehouse',
      address: 'St 271, Phnom Penh',
      coordinates: { lat: 11.532, lng: 104.912 },
      senderPhone: '012 888 999',
    });
    expect(validPickup.success).toBe(true);

    const missingPhone = pickupSchema.safeParse({
      name: 'Main Warehouse',
      address: 'St 271, Phnom Penh',
      coordinates: { lat: 11.532, lng: 104.912 },
    });
    expect(missingPhone.success).toBe(false);

    const shortPhone = pickupSchema.safeParse({
      name: 'Main Warehouse',
      address: 'St 271, Phnom Penh',
      coordinates: { lat: 11.532, lng: 104.912 },
      senderPhone: '123',
    });
    expect(shortPhone.success).toBe(false);
  });

  it('validates delivery speed options correctly', () => {
    const base = {
      pickup: {
        name: 'Main Warehouse',
        address: 'St 271, Phnom Penh',
        coordinates: { lat: 11.532, lng: 104.912 },
        senderPhone: '012888999',
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
      parcel: { description: 'Clothes' },
      cod: { isCod: false, amount: 0 },
    };

    const instant = bookingFormSchema.safeParse({ ...base, deliveryOption: 'instant' });
    expect(instant.success).toBe(true);

    const sameDay = bookingFormSchema.safeParse({ ...base, deliveryOption: 'same_day' });
    expect(sameDay.success).toBe(true);

    const invalid = bookingFormSchema.safeParse({ ...base, deliveryOption: 'next_week' });
    expect(invalid.success).toBe(false);
  });

  describe('validateDropoffStops (Destination Modal Required Fields)', () => {
    it('accepts valid stops when recipient name is omitted (optional)', () => {
      const errors = validateDropoffStops([
        {
          id: 'stop-1',
          recipient: { name: '', phoneNumber: '012 998 877' },
          dropoff: {
            address: 'BKK1, Phnom Penh',
            coordinates: { lat: 11.5512, lng: 104.9256 },
          },
        },
      ]);
      expect(errors).toEqual({});
    });

    it('rejects missing phone, invalid phone, and short or empty drop-off address across stops', () => {
      const errors = validateDropoffStops([
        {
          id: 'stop-1',
          recipient: { name: 'Sokha Chan', phoneNumber: '012 998 877' },
          dropoff: {
            address: 'BKK1, Phnom Penh',
            coordinates: { lat: 11.5512, lng: 104.9256 },
          },
        },
        {
          id: 'stop-2',
          recipient: { name: '', phoneNumber: '' },
          dropoff: {
            address: 'ab',
            coordinates: { lat: 11.556, lng: 104.93 },
          },
        },
        {
          id: 'stop-3',
          recipient: { name: 'Dara', phoneNumber: '123' },
          dropoff: {
            address: '   ',
            coordinates: { lat: 11.56, lng: 104.935 },
          },
        },
      ]);

      expect(errors['dropoffs.0.phoneNumber']).toBeUndefined();
      expect(errors['dropoffs.0.address']).toBeUndefined();
      expect(errors['dropoffs.1.phoneNumber']).toBeDefined();
      expect(errors['dropoffs.1.address']).toBeDefined();
      expect(errors['dropoffs.2.phoneNumber']).toBeDefined();
      expect(errors['dropoffs.2.address']).toBeDefined();
    });
  });

  describe('isDropoffStopDirty (Delete Stop Confirmation Guard)', () => {
    it('returns false for an untouched empty stop', () => {
      expect(
        isDropoffStopDirty({
          id: 'stop-2',
          recipient: { name: '', phoneNumber: '', notes: '' },
          dropoff: {
            address: '',
            coordinates: { lat: 11.556, lng: 104.93 },
          },
        })
      ).toBe(false);
    });

    it('returns true when recipient name, phone, address, notes, or photo is populated', () => {
      const base = {
        id: 'stop-2',
        recipient: { name: '', phoneNumber: '', notes: '' },
        dropoff: {
          address: '',
          coordinates: { lat: 11.556, lng: 104.93 },
        },
      };

      expect(
        isDropoffStopDirty({
          ...base,
          recipient: { ...base.recipient, name: 'Dara' },
        })
      ).toBe(true);
      expect(
        isDropoffStopDirty({
          ...base,
          recipient: { ...base.recipient, phoneNumber: '012998877' },
        })
      ).toBe(true);
      expect(
        isDropoffStopDirty({
          ...base,
          dropoff: { ...base.dropoff, address: 'St 271' },
        })
      ).toBe(true);
      expect(
        isDropoffStopDirty({
          ...base,
          recipient: { ...base.recipient, notes: 'Call on arrival' },
        })
      ).toBe(true);
      expect(
        isDropoffStopDirty({
          ...base,
          imageUrl: 'data:image/png;base64,abc',
        })
      ).toBe(true);
    });
  });
});

