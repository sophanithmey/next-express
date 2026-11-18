import { Sunrise, Sun, Moon } from 'lucide-react';
import { DeliveryShift } from '../types/booking-types';

/** Look up the translation labelKey for a 1-hour shift slot value. */
export function findDeliverySlotLabelKey(
  shiftId: DeliveryShift,
  slotValue?: string
): string | null {
  if (!slotValue) return null;
  const shift = DELIVERY_SHIFTS.find((s) => s.id === shiftId);
  const matched = shift?.slots.find((slot) => slot.value === slotValue);
  return matched?.labelKey ?? null;
}

export const DELIVERY_SHIFTS = [
  {
    id: 'morning' as const,
    nameKey: 'morningName',
    shiftKey: 'morningShift',
    rangeKey: 'morningRange',
    anytimeKey: 'anytimeMorning',
    startMinutes: 7 * 60,
    endMinutes: 12 * 60,
    icon: Sunrise,
    slots: [
      { value: '07:00 - 08:00 AM', labelKey: 'slots.s07_08', startMinutes: 7 * 60, endMinutes: 8 * 60 },
      { value: '08:00 - 09:00 AM', labelKey: 'slots.s08_09', startMinutes: 8 * 60, endMinutes: 9 * 60 },
      { value: '09:00 - 10:00 AM', labelKey: 'slots.s09_10', startMinutes: 9 * 60, endMinutes: 10 * 60 },
      { value: '10:00 - 11:00 AM', labelKey: 'slots.s10_11', startMinutes: 10 * 60, endMinutes: 11 * 60 },
      { value: '11:00 - 12:00 PM', labelKey: 'slots.s11_12', startMinutes: 11 * 60, endMinutes: 12 * 60 },
    ],
  },
  {
    id: 'afternoon' as const,
    nameKey: 'afternoonName',
    shiftKey: 'afternoonShift',
    rangeKey: 'afternoonRange',
    anytimeKey: 'anytimeAfternoon',
    startMinutes: 12 * 60,
    endMinutes: 17 * 60,
    icon: Sun,
    slots: [
      { value: '12:00 - 01:00 PM', labelKey: 'slots.s12_13', startMinutes: 12 * 60, endMinutes: 13 * 60 },
      { value: '01:00 - 02:00 PM', labelKey: 'slots.s13_14', startMinutes: 13 * 60, endMinutes: 14 * 60 },
      { value: '02:00 - 03:00 PM', labelKey: 'slots.s14_15', startMinutes: 14 * 60, endMinutes: 15 * 60 },
      { value: '03:00 - 04:00 PM', labelKey: 'slots.s15_16', startMinutes: 15 * 60, endMinutes: 16 * 60 },
      { value: '04:00 - 05:00 PM', labelKey: 'slots.s16_17', startMinutes: 16 * 60, endMinutes: 17 * 60 },
    ],
  },
  {
    id: 'evening' as const,
    nameKey: 'eveningName',
    shiftKey: 'eveningShift',
    rangeKey: 'eveningRange',
    anytimeKey: 'anytimeEvening',
    startMinutes: 17 * 60,
    endMinutes: 21 * 60,
    icon: Moon,
    slots: [
      { value: '05:00 - 06:00 PM', labelKey: 'slots.s17_18', startMinutes: 17 * 60, endMinutes: 18 * 60 },
      { value: '06:00 - 07:00 PM', labelKey: 'slots.s18_19', startMinutes: 18 * 60, endMinutes: 19 * 60 },
      { value: '07:00 - 08:00 PM', labelKey: 'slots.s19_20', startMinutes: 19 * 60, endMinutes: 20 * 60 },
      { value: '08:00 - 09:00 PM', labelKey: 'slots.s20_21', startMinutes: 20 * 60, endMinutes: 21 * 60 },
    ],
  },
] as const;
