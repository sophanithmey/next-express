import {
  parsePhoneNumberFromString,
  PhoneNumber,
  CountryCode,
} from 'libphonenumber-js/max';

export const DEFAULT_COUNTRY: CountryCode = 'KH';
export const DEFAULT_CALLING_CODE = '+855';

// Strict regex ensuring input only contains phone-number related characters
// Prevents extracting phone numbers embedded in arbitrary text
const STRICT_PHONE_CHARACTERS_REGEX = /^[+]?[\d\s().-]+$/;

/**
 * Parses a phone number string strictly for Cambodia (KH) by default.
 * Handles local numbers (012345678, 012 345 678), international (+85512345678),
 * and national numbers entered without a leading zero (12345678).
 */
export function parsePhoneNumber(
  value: string | undefined | null,
  defaultCountry: CountryCode = DEFAULT_COUNTRY
): PhoneNumber | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || !STRICT_PHONE_CHARACTERS_REGEX.test(trimmed)) {
    return null;
  }

  // 1. Direct parse with default country
  let parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (parsed && parsed.isValid() && parsed.country === defaultCountry) {
    return parsed;
  }

  // 2. If the user omitted the leading '0' when typing (e.g. '12 345 678' or '12345678')
  if (!trimmed.startsWith('+') && !trimmed.startsWith('0')) {
    const withLeadingZero = `0${trimmed}`;
    const parsedWithZero = parsePhoneNumberFromString(
      withLeadingZero,
      defaultCountry
    );
    if (
      parsedWithZero &&
      parsedWithZero.isValid() &&
      parsedWithZero.country === defaultCountry
    ) {
      return parsedWithZero;
    }
  }

  return null;
}

/**
 * Checks if the given value is a valid Cambodian phone number according to libphonenumber metadata.
 */
export function isValidCambodiaPhoneNumber(
  value: string | undefined | null
): boolean {
  const parsed = parsePhoneNumber(value, DEFAULT_COUNTRY);
  return Boolean(parsed && parsed.isValid() && parsed.country === DEFAULT_COUNTRY);
}

export interface PhoneNumberValidationResult {
  isValid: boolean;
  error?: string;
  phoneNumber?: PhoneNumber;
}

/**
 * Validates a Cambodian phone number and provides clear error feedback.
 */
export function validatePhoneNumber(
  value: string | undefined | null,
  options?: { isRequired?: boolean }
): PhoneNumberValidationResult {
  const isRequired = options?.isRequired ?? true;

  if (!value || !value.trim()) {
    if (isRequired) {
      return {
        isValid: false,
        error: 'Phone number is required',
      };
    }
    return { isValid: true };
  }

  const trimmed = value.trim();
  if (!STRICT_PHONE_CHARACTERS_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits, spaces, and hyphens',
    };
  }

  const parsed = parsePhoneNumber(trimmed, DEFAULT_COUNTRY);
  if (!parsed || !parsed.isValid() || parsed.country !== DEFAULT_COUNTRY) {
    return {
      isValid: false,
      error: 'Please enter a valid Cambodian phone number (e.g. 012 345 678)',
    };
  }

  return {
    isValid: true,
    phoneNumber: parsed,
  };
}

/**
 * Normalizes a phone number to standard E.164 format (+85512345678).
 * If the number is invalid, returns the trimmed raw input or fallback.
 */
export function normalizePhoneNumber(
  value: string | undefined | null
): string {
  if (!value) return '';
  const parsed = parsePhoneNumber(value, DEFAULT_COUNTRY);
  if (parsed && parsed.isValid() && parsed.country === DEFAULT_COUNTRY) {
    return parsed.format('E.164');
  }
  return value.trim();
}

/**
 * Formats a phone number for user-friendly display.
 * Default is 'national' (e.g. '012 345 678').
 * Supports 'international' (e.g. '+855 12 345 678') and 'e164' (e.g. '+85512345678').
 */
export function formatPhoneNumber(
  value: string | undefined | null,
  formatStyle: 'national' | 'international' | 'e164' = 'national',
  options?: Parameters<PhoneNumber['formatInternational']>[0]
): string {
  if (!value) return '';
  const parsed = parsePhoneNumber(value, DEFAULT_COUNTRY);
  if (!parsed || !parsed.isValid()) {
    return value;
  }

  if (formatStyle === 'international') {
    return parsed.formatInternational(options);
  }
  if (formatStyle === 'e164') {
    return parsed.format('E.164');
  }
  return parsed.formatNational();
}

/**
 * Normalizes raw typed or pasted Cambodian phone input to local digits with a leading '0'
 * (e.g. '12888999' -> '012888999', '+855 12 888 999' -> '012888999').
 */
export function sanitizeCambodiaPhoneInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (
    trimmed.startsWith('+855') ||
    (digits.startsWith('855') && digits.length >= 11)
  ) {
    digits = digits.slice(3);
  }

  if (!digits) return '';

  if (!digits.startsWith('0')) {
    digits = `0${digits}`;
  }

  return digits.slice(0, 10);
}

/**
 * Formats a Cambodian phone number for Unified Identity login username
 * using E.164 format with '+' (e.g. '069 686 234' -> '+85569686234').
 */
export function toUnifiedUsernamePhone(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return '';

  const normalized = normalizePhoneNumber(value);
  if (normalized.startsWith('+')) {
    return normalized;
  }

  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('855')) return `+${digits}`;
  if (digits.startsWith('0')) return `+855${digits.slice(1)}`;
  return `+855${digits}`;
}
