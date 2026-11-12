import {
  BookingFormData,
  CodInfo,
  DropoffStop,
  PickupLocation,
  BookingOrder,
} from '../types/booking-types';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '../data/mock-booking-data';
import { APP_CONFIG, MAX_DROPOFF_STOPS, MAX_TOTAL_COD_USD } from '@/lib/constants';
import { isValidCambodiaPhoneNumber, normalizePhoneNumber } from '@/lib/phone-number';

export function createEmptyBookingForm(): BookingFormData {
  return {
    pickup: {
      name: '',
      address: '',
      coordinates: { ...APP_CONFIG.defaultCoordinates },
      senderName: '',
      senderPhone: '',
      riderNote: '',
    },
    dropoff: {
      address: '',
      coordinates: { ...APP_CONFIG.defaultCoordinates },
    },
    recipient: {
      name: '',
      phoneNumber: '',
      notes: '',
    },
    dropoffs: [
      {
        id: 'stop-1',
        recipient: {
          name: '',
          phoneNumber: '',
          notes: '',
        },
        dropoff: {
          address: '',
          coordinates: { ...APP_CONFIG.defaultCoordinates },
        },
      },
    ],
    parcel: {
      description: '',
      sellerOrderRef: '',
      quantity: 1,
    },
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryOption: 'instant',
    isBookingOnBehalf: false,
  };
}

export function createDefaultBookingForm(
  initialPickup?: PickupLocation
): BookingFormData {
  return {
    pickup: initialPickup || SAMPLE_PHNOM_PENH_LOCATIONS[0],
    dropoff: {
      address: 'BKK1, Khan Boeng Keng Kang, Phnom Penh',
      coordinates: { lat: 11.5512, lng: 104.9256 },
    },
    recipient: {
      name: 'Sokha Chan',
      phoneNumber: '012 998 877',
      notes: '',
    },
    dropoffs: [
      {
        id: 'stop-1',
        recipient: {
          name: 'Sokha Chan',
          phoneNumber: '012 998 877',
          notes: '',
        },
        dropoff: {
          address: 'BKK1, Khan Boeng Keng Kang, Phnom Penh',
          coordinates: { lat: 11.5512, lng: 104.9256 },
        },
        codAmount: 25,
      },
    ],
    parcel: {
      description: 'Apparel / Retail Parcel',
      sellerOrderRef: 'LIVE-0914',
      quantity: 1,
    },
    cod: {
      isCod: true,
      amount: 25,
    },
    deliveryOption: 'instant',
    isBookingOnBehalf: false,
  };
}

export interface DropoffValidationMessages {
  phoneRequired?: (index: number) => string;
  phoneInvalid?: (index: number) => string;
  addressRequired?: (index: number) => string;
  codTotalExceeded?: (total: number, max: number) => string;
}

/**
 * Computes total rounded USD COD amount across a list of drop-off stops.
 */
export function calculateTotalStopCod(stops?: DropoffStop[]): number {
  if (!stops || stops.length === 0) return 0;
  const total = stops.reduce(
    (sum, stop) => sum + Math.max(0, Number(stop.codAmount) || 0),
    0
  );
  return Math.round(total * 100) / 100;
}

/**
 * Returns true if the stop contains any user-entered recipient, address, instruction, or photo data.
 */
export function isDropoffStopDirty(stop: DropoffStop): boolean {
  return Boolean(
    stop.recipient?.name?.trim() ||
      stop.recipient?.phoneNumber?.trim() ||
      stop.dropoff?.address?.trim() ||
      stop.recipient?.notes?.trim() ||
      (typeof stop.codAmount === 'number' && stop.codAmount > 0) ||
      stop.imageUrl ||
      stop.recipient?.imageUrl
  );
}

/**
 * Returns true if any stop explicitly tracks a per-stop COD amount.
 */
export function hasPerStopCodValues(stops?: DropoffStop[]): boolean {
  return Boolean(stops?.some((s) => typeof s.codAmount === 'number' && s.codAmount > 0));
}

/**
 * Computes order-level CodInfo from per-stop COD amounts when defined, or returns fallbackCod.
 */
export function syncCodWithDropoffs(
  dropoffs: DropoffStop[],
  fallbackCod: CodInfo
): CodInfo {
  const hasAnyExplicitCod = dropoffs.some((s) => typeof s.codAmount === 'number');
  if (!hasAnyExplicitCod) return fallbackCod;

  const total = dropoffs.reduce(
    (sum, stop) => sum + Math.max(0, Number(stop.codAmount) || 0),
    0
  );
  const rounded = Math.round(total * 100) / 100;
  return {
    isCod: rounded > 0,
    amount: rounded,
  };
}

/**
 * Carries existing order-level COD amount onto Stop 1 when expanding from single-stop to multi-drop.
 */
export function seedPerStopCodOnExpand(
  stops: DropoffStop[],
  currentCod: CodInfo
): DropoffStop[] {
  if (stops.length === 0 || !currentCod.isCod || currentCod.amount <= 0) {
    return stops;
  }
  const hasStopCod = stops.some((s) => typeof s.codAmount === 'number');
  if (hasStopCod) return stops;

  return stops.map((stop, idx) =>
    idx === 0 ? { ...stop, codAmount: currentCod.amount } : stop
  );
}

/**
 * Normalizes Wing Bank account numbers by stripping spaces and hyphens.
 */
export function normalizeWingAccountNumber(value?: string | null): string {
  return (value || '').replace(/[\s-]+/g, '').trim();
}

/**
 * Validates that a Wing Bank account number contains 5 to 20 digits.
 */
export function isValidWingAccountNumber(value?: string | null): boolean {
  const digits = normalizeWingAccountNumber(value);
  return /^\d{5,20}$/.test(digits);
}

/**
 * Validates required recipient phone number and drop-off address (>= 3 chars) across all stops.
 */
export function validateDropoffStops(
  stops: DropoffStop[],
  messages?: DropoffValidationMessages
): Record<string, string> {
  const errors: Record<string, string> = {};

  stops.forEach((stop, idx) => {
    const phone = stop.recipient.phoneNumber?.trim() || '';
    const address = stop.dropoff.address?.trim() || '';

    if (!phone) {
      errors[`dropoffs.${idx}.phoneNumber`] =
        messages?.phoneRequired?.(idx) ||
        `Phone number for Destination ${idx + 1} is required.`;
    } else if (!isValidCambodiaPhoneNumber(phone)) {
      errors[`dropoffs.${idx}.phoneNumber`] =
        messages?.phoneInvalid?.(idx) ||
        `Valid Cambodian phone for Destination ${idx + 1} is required (e.g. 012 345 678).`;
    }

    if (address.length < 3) {
      errors[`dropoffs.${idx}.address`] =
        messages?.addressRequired?.(idx) ||
        `Drop-off address for Destination ${idx + 1} is required (min 3 characters).`;
    }

    if (typeof stop.codAmount === 'number' && stop.codAmount < 0) {
      errors[`dropoffs.${idx}.codAmount`] = 'COD amount cannot be negative.';
    }
  });

  const totalCod = calculateTotalStopCod(stops);
  if (totalCod > MAX_TOTAL_COD_USD) {
    const codMessage =
      messages?.codTotalExceeded?.(totalCod, MAX_TOTAL_COD_USD) ||
      `Total COD across all drop-off points ($${totalCod.toFixed(2)}) cannot exceed $${MAX_TOTAL_COD_USD} USD.`;
    errors['cod.amount'] = codMessage;
    stops.forEach((stop, idx) => {
      if ((stop.codAmount ?? 0) > 0 && !errors[`dropoffs.${idx}.codAmount`]) {
        errors[`dropoffs.${idx}.codAmount`] = codMessage;
      }
    });
  }

  return errors;
}

export function validateBookingFormData(
  formData: BookingFormData
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!formData.pickup.address?.trim()) {
    errors['pickup.address'] = 'Pickup address is required.';
  }

  if (!formData.pickup.senderPhone?.trim()) {
    errors['pickup.senderPhone'] = 'Pickup contact phone number is required.';
  } else if (!isValidCambodiaPhoneNumber(formData.pickup.senderPhone)) {
    errors['pickup.senderPhone'] = 'Please enter a valid Cambodian phone number (e.g. 012 888 999).';
  }

  if (formData.dropoffs && formData.dropoffs.length > 0) {
    if (formData.dropoffs.length > MAX_DROPOFF_STOPS) {
      errors.dropoffs = `Maximum ${MAX_DROPOFF_STOPS} drop-off points allowed per booking.`;
    }
    Object.assign(errors, validateDropoffStops(formData.dropoffs));
  } else {
    if (!formData.dropoff.address?.trim()) {
      errors['dropoff.address'] = 'Drop-off address is required.';
    }
    if (!formData.recipient.phoneNumber?.trim()) {
      errors['recipient.phoneNumber'] = 'Recipient phone number is required.';
    } else if (!isValidCambodiaPhoneNumber(formData.recipient.phoneNumber)) {
      errors['recipient.phoneNumber'] = 'Valid Cambodian phone number is required (e.g. 012 345 678).';
    }
  }

  const effectiveCod = formData.dropoffs?.length
    ? syncCodWithDropoffs(formData.dropoffs, formData.cod)
    : formData.cod;

  if (effectiveCod.isCod && (!effectiveCod.amount || effectiveCod.amount <= 0)) {
    errors['cod.amount'] = 'Please enter a COD amount greater than 0.';
  } else if (effectiveCod.amount > MAX_TOTAL_COD_USD && !errors['cod.amount']) {
    errors['cod.amount'] =
      `Total COD across all drop-off points ($${effectiveCod.amount.toFixed(2)}) cannot exceed $${MAX_TOTAL_COD_USD} USD.`;
  }

  const isCodActive = Boolean(effectiveCod.isCod && effectiveCod.amount > 0);
  const accountName = formData.pickup.settlementAccountName?.trim() || '';
  const accountNumberRaw = formData.pickup.settlementAccountNumber?.trim() || '';

  if (isCodActive) {
    if (accountName.length < 2) {
      errors['pickup.settlementAccountName'] =
        'Wing Bank account name is required when COD is enabled.';
    }
    if (!accountNumberRaw || !isValidWingAccountNumber(accountNumberRaw)) {
      errors['pickup.settlementAccountNumber'] =
        'Please enter a valid Wing Bank account number for COD.';
    }
  } else if (accountNumberRaw && !isValidWingAccountNumber(accountNumberRaw)) {
    errors['pickup.settlementAccountNumber'] =
      'Please enter a valid Wing Bank account number (digits only).';
  }

  return errors;
}

export function createPrefillFromOrder(order: BookingOrder): BookingFormData {
  const baseStops: DropoffStop[] = order.dropoffs || [
    {
      id: 'stop-1',
      dropoff: order.dropoff,
      recipient: order.recipient,
    },
  ];
  const cod = order.cod || { isCod: false, amount: 0 };
  const dropoffs = seedPerStopCodOnExpand(baseStops, cod);

  return {
    draftOrderId: order.status === 'draft' ? order.id : undefined,
    pickup: order.pickup,
    dropoff: order.dropoff,
    recipient: order.recipient,
    dropoffs,
    parcel: {
      sellerOrderRef:
        order.status === 'draft'
          ? order.parcel.sellerOrderRef || ''
          : `${order.parcel.sellerOrderRef || 'REORDER'}-NEW`,
      description: order.parcel.description || '',
      quantity: order.parcel.quantity || 1,
      instructions: order.parcel.instructions,
      itemCategory: order.parcel.itemCategory,
    },
    cod: syncCodWithDropoffs(dropoffs, cod),
    deliveryOption: order.deliveryOption || 'instant',
    isBookingOnBehalf: false,
  };
}

export function normalizeBookingPhones(formData: BookingFormData): BookingFormData {
  return {
    ...formData,
    pickup: {
      ...formData.pickup,
      senderPhone: formData.pickup.senderPhone
        ? normalizePhoneNumber(formData.pickup.senderPhone)
        : formData.pickup.senderPhone,
    },
    recipient: {
      ...formData.recipient,
      phoneNumber: normalizePhoneNumber(formData.recipient.phoneNumber),
    },
    dropoffs: formData.dropoffs?.map((stop) => ({
      ...stop,
      recipient: {
        ...stop.recipient,
        phoneNumber: normalizePhoneNumber(stop.recipient.phoneNumber),
      },
    })),
  };
}

