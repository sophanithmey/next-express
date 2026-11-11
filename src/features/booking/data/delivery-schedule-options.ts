import { Sunrise, Sun, Moon } from 'lucide-react';

export const DELIVERY_SHIFTS = [
  {
    id: 'morning' as const,
    nameKey: 'morningName',
    shiftKey: 'morningShift',
    rangeKey: 'morningRange',
    anytimeKey: 'anytimeMorning',
    icon: Sunrise,
    slots: [
      { value: '07:00 - 08:00 AM', labelKey: 'slots.s07_08' },
      { value: '08:00 - 09:00 AM', labelKey: 'slots.s08_09' },
      { value: '09:00 - 10:00 AM', labelKey: 'slots.s09_10' },
      { value: '10:00 - 11:00 AM', labelKey: 'slots.s10_11' },
      { value: '11:00 - 12:00 PM', labelKey: 'slots.s11_12' },
    ],
  },
  {
    id: 'afternoon' as const,
    nameKey: 'afternoonName',
    shiftKey: 'afternoonShift',
    rangeKey: 'afternoonRange',
    anytimeKey: 'anytimeAfternoon',
    icon: Sun,
    slots: [
      { value: '12:00 - 01:00 PM', labelKey: 'slots.s12_13' },
      { value: '01:00 - 02:00 PM', labelKey: 'slots.s13_14' },
      { value: '02:00 - 03:00 PM', labelKey: 'slots.s14_15' },
      { value: '03:00 - 04:00 PM', labelKey: 'slots.s15_16' },
      { value: '04:00 - 05:00 PM', labelKey: 'slots.s16_17' },
    ],
  },
  {
    id: 'evening' as const,
    nameKey: 'eveningName',
    shiftKey: 'eveningShift',
    rangeKey: 'eveningRange',
    anytimeKey: 'anytimeEvening',
    icon: Moon,
    slots: [
      { value: '05:00 - 06:00 PM', labelKey: 'slots.s17_18' },
      { value: '06:00 - 07:00 PM', labelKey: 'slots.s18_19' },
      { value: '07:00 - 08:00 PM', labelKey: 'slots.s19_20' },
      { value: '08:00 - 09:00 PM', labelKey: 'slots.s20_21' },
    ],
  },
] as const;

