import { describe, it, expect } from 'vitest';
import {
  parsePhoneNumber,
  validatePhoneNumber,
  formatPhoneNumber,
  normalizePhoneNumber,
  isValidCambodiaPhoneNumber,
  sanitizeCambodiaPhoneInput,
  DEFAULT_COUNTRY,
  DEFAULT_CALLING_CODE,
} from '@/lib/phone-number';

describe('Phone Number Utility — Cambodia (+855)', () => {
  it('has Cambodia defaults', () => {
    expect(DEFAULT_COUNTRY).toBe('KH');
    expect(DEFAULT_CALLING_CODE).toBe('+855');
  });

  describe('Validation & Normalization Table', () => {
    const validCases = [
      { input: '012345678', expectedE164: '+85512345678', expectedNational: '012 345 678' },
      { input: '012 345 678', expectedE164: '+85512345678', expectedNational: '012 345 678' },
      { input: '+85512345678', expectedE164: '+85512345678', expectedNational: '012 345 678' },
      { input: '+855 12 345 678', expectedE164: '+85512345678', expectedNational: '012 345 678' },
      { input: '12 345 678', expectedE164: '+85512345678', expectedNational: '012 345 678' },
      { input: '012 888 999', expectedE164: '+85512888999', expectedNational: '012 888 999' },
    ];

    validCases.forEach(({ input, expectedE164, expectedNational }) => {
      it(`recognizes "${input}" as a valid Cambodian number`, () => {
        expect(isValidCambodiaPhoneNumber(input)).toBe(true);
        expect(normalizePhoneNumber(input)).toBe(expectedE164);
        expect(formatPhoneNumber(input)).toBe(expectedNational);

        const res = validatePhoneNumber(input);
        expect(res.isValid).toBe(true);
        expect(res.error).toBeUndefined();
      });
    });

    const invalidCases = [
      { input: '123', reason: 'too short / incomplete' },
      { input: '', reason: 'empty value' },
      { input: '   ', reason: 'whitespace only' },
      { input: 'abc123', reason: 'contains letters' },
      { input: '+123456789', reason: 'non-Cambodia country code' },
      { input: 'call me 012345678', reason: 'embedded in sentence text' },
      { input: '012345678 extra', reason: 'trailing text' },
    ];

    invalidCases.forEach(({ input, reason }) => {
      it(`rejects invalid input "${input}" (${reason})`, () => {
        expect(isValidCambodiaPhoneNumber(input)).toBe(false);

        const res = validatePhoneNumber(input, { isRequired: true });
        expect(res.isValid).toBe(false);
        expect(res.error).toBeDefined();
      });
    });
  });

  describe('Optional Phone Number handling', () => {
    it('allows empty value when isRequired is false', () => {
      const res = validatePhoneNumber('', { isRequired: false });
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects invalid non-empty value even when isRequired is false', () => {
      const res = validatePhoneNumber('123', { isRequired: false });
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('Formatting styles', () => {
    it('formats as national, international, and e164', () => {
      const raw = '012345678';
      expect(formatPhoneNumber(raw, 'national')).toBe('012 345 678');
      expect(formatPhoneNumber(raw, 'international')).toBe('+855 12 345 678');
      expect(formatPhoneNumber(raw, 'e164')).toBe('+85512345678');
    });
  });

  describe('Form Helper Phone Normalization', () => {
    it('normalizes pickup and all dropoff recipient phone numbers to E.164', async () => {
      const { normalizeBookingPhones, validateBookingFormData, createDefaultBookingForm } = await import(
        '@/features/booking/services/booking-form-helpers'
      );
      const defaultForm = createDefaultBookingForm();

      // Given local formatted numbers
      defaultForm.pickup.senderPhone = '012 888 999';
      defaultForm.recipient.phoneNumber = '012 998 877';
      defaultForm.dropoffs = [
        {
          id: 'stop-1',
          recipient: { name: 'Sokha', phoneNumber: '012 998 877' },
          dropoff: { address: 'BKK1', coordinates: { lat: 11.5, lng: 104.9 } },
        },
        {
          id: 'stop-2',
          recipient: { name: 'Dara', phoneNumber: '+855 98 112 233' },
          dropoff: { address: 'Toul Kork', coordinates: { lat: 11.56, lng: 104.88 } },
        },
      ];

      const validationErrors = validateBookingFormData(defaultForm);
      expect(Object.keys(validationErrors).length).toBe(0);

      const normalized = normalizeBookingPhones(defaultForm);
      expect(normalized.pickup.senderPhone).toBe('+85512888999');
      expect(normalized.recipient.phoneNumber).toBe('+85512998877');
      expect(normalized.dropoffs?.[0].recipient.phoneNumber).toBe('+85512998877');
      expect(normalized.dropoffs?.[1].recipient.phoneNumber).toBe('+85598112233');
    });

    it('rejects invalid pickup and recipient numbers in booking form validator', async () => {
      const { validateBookingFormData, createDefaultBookingForm } = await import(
        '@/features/booking/services/booking-form-helpers'
      );
      const form = createDefaultBookingForm();
      form.pickup.senderPhone = '123';
      form.dropoffs = [
        {
          id: 'stop-1',
          recipient: { name: 'Sokha', phoneNumber: 'abc123' },
          dropoff: { address: 'BKK1', coordinates: { lat: 11.5, lng: 104.9 } },
        },
      ];

      const errors = validateBookingFormData(form);
      expect(errors['pickup.senderPhone']).toBeDefined();
      expect(errors['dropoffs.0.phoneNumber']).toBeDefined();
    });
  });

  describe('sanitizeCambodiaPhoneInput (Auto-Prepend Leading 0)', () => {
    it('prepends 0 when user omits leading zero', () => {
      expect(sanitizeCambodiaPhoneInput('1')).toBe('01');
      expect(sanitizeCambodiaPhoneInput('12888999')).toBe('012888999');
      expect(sanitizeCambodiaPhoneInput('961234567')).toBe('0961234567');
    });

    it('preserves existing leading zero without duplicating', () => {
      expect(sanitizeCambodiaPhoneInput('0')).toBe('0');
      expect(sanitizeCambodiaPhoneInput('012888999')).toBe('012888999');
      expect(sanitizeCambodiaPhoneInput('+855 012 888 999')).toBe('012888999');
      expect(sanitizeCambodiaPhoneInput('+855 12 888 999')).toBe('012888999');
      expect(sanitizeCambodiaPhoneInput('85512888999')).toBe('012888999');
    });

    it('clears cleanly when input is emptied', () => {
      expect(sanitizeCambodiaPhoneInput('')).toBe('');
      expect(sanitizeCambodiaPhoneInput('   ')).toBe('');
    });
  });
});
