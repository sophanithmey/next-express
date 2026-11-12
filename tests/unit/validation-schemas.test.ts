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
  createDefaultBookingForm,
  isDropoffStopDirty,
  validateBookingFormData,
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
        settlementBank: 'WING',
        settlementAccountName: 'Main Warehouse Shop',
        settlementAccountNumber: '012345678',
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

  it('rejects bookings with more than 5 drop-off stops', () => {
    const stops = Array.from({ length: 6 }, (_, index) => ({
      id: `stop-${index + 1}`,
      recipient: {
        name: `Recipient ${index + 1}`,
        phoneNumber: `01234567${index}`,
      },
      dropoff: {
        address: `Street ${100 + index}, Phnom Penh`,
        coordinates: { lat: 11.5512, lng: 104.9256 },
      },
    }));

    const result = bookingFormSchema.safeParse({
      pickup: {
        name: 'Main Warehouse',
        address: 'St 271, Phnom Penh',
        coordinates: { lat: 11.532, lng: 104.912 },
        senderPhone: '012888999',
      },
      recipient: {
        name: 'Recipient 1',
        phoneNumber: '012345670',
      },
      isBookingOnBehalf: false,
      dropoff: {
        address: 'Street 100, Phnom Penh',
        coordinates: { lat: 11.5512, lng: 104.9256 },
      },
      dropoffs: stops,
      parcel: {
        description: 'Clothes',
        quantity: 1,
      },
      cod: {
        isCod: false,
        amount: 0,
      },
    });

    expect(result.success).toBe(false);
  });

  it('requires Wing Bank account details when COD is enabled and skips when COD is off', () => {
    const codForm = createDefaultBookingForm();
    codForm.cod = { isCod: true, amount: 25 };

    const missingErrors = validateBookingFormData(codForm);
    expect(missingErrors['pickup.settlementAccountName']).toBeDefined();
    expect(missingErrors['pickup.settlementAccountNumber']).toBeDefined();

    const invalidSchemaResult = bookingFormSchema.safeParse(codForm);
    expect(invalidSchemaResult.success).toBe(false);

    const noCodForm = {
      ...codForm,
      cod: { isCod: false, amount: 0 },
      dropoffs: codForm.dropoffs?.map((s) => ({ ...s, codAmount: 0 })),
    };
    expect(validateBookingFormData(noCodForm)).toEqual({});
    expect(bookingFormSchema.safeParse(noCodForm).success).toBe(true);

    const completeCodForm = {
      ...codForm,
      pickup: {
        ...codForm.pickup,
        settlementBank: 'WING',
        settlementAccountName: 'Sokha Boutique',
        settlementAccountNumber: '012 345 678',
      },
    };
    expect(validateBookingFormData(completeCodForm)).toEqual({});
    expect(bookingFormSchema.safeParse(completeCodForm).success).toBe(true);
  });

  it('rejects total COD exceeding $60 USD across single or multiple drop-off points', () => {
    const overSingleCod = codSchema.safeParse({ isCod: true, amount: 61 });
    expect(overSingleCod.success).toBe(false);

    const exactLimitForm = createDefaultBookingForm();
    exactLimitForm.pickup.settlementBank = 'WING';
    exactLimitForm.pickup.settlementAccountName = 'Sokha Boutique';
    exactLimitForm.pickup.settlementAccountNumber = '012345678';
    exactLimitForm.dropoffs = [
      {
        id: 'stop-1',
        recipient: { name: 'A', phoneNumber: '012998877' },
        dropoff: { address: 'St 310, Phnom Penh', coordinates: { lat: 11.55, lng: 104.92 } },
        codAmount: 40,
      },
      {
        id: 'stop-2',
        recipient: { name: 'B', phoneNumber: '098112233' },
        dropoff: { address: 'St 63, Phnom Penh', coordinates: { lat: 11.56, lng: 104.93 } },
        codAmount: 20,
      },
    ];
    exactLimitForm.cod = { isCod: true, amount: 60 };
    expect(validateBookingFormData(exactLimitForm)).toEqual({});
    expect(bookingFormSchema.safeParse(exactLimitForm).success).toBe(true);

    const overLimitForm = {
      ...exactLimitForm,
      dropoffs: [
        ...exactLimitForm.dropoffs,
        {
          id: 'stop-3',
          recipient: { name: 'C', phoneNumber: '077445566' },
          dropoff: { address: 'St 271, Phnom Penh', coordinates: { lat: 11.54, lng: 104.91 } },
          codAmount: 1,
        },
      ],
      cod: { isCod: true, amount: 61 },
    };
    const errors = validateBookingFormData(overLimitForm);
    expect(errors['cod.amount']).toContain('$60');
    expect(bookingFormSchema.safeParse(overLimitForm).success).toBe(false);
  });
});

