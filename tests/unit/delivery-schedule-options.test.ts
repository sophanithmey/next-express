import { describe, it, expect } from 'vitest';
import {
  DELIVERY_SHIFTS,
  findDeliverySlotLabelKey,
} from '@/features/booking/data/delivery-schedule-options';

describe('delivery-schedule-options', () => {
  it('defines morning, afternoon, and evening shifts with 1-hour slots', () => {
    expect(DELIVERY_SHIFTS).toHaveLength(3);
    expect(DELIVERY_SHIFTS.map((s) => s.id)).toEqual(['morning', 'afternoon', 'evening']);
  });

  it('resolves valid 1-hour slot label keys and returns null for unknown or empty slots', () => {
    expect(findDeliverySlotLabelKey('morning', '07:00 - 08:00 AM')).toBe('slots.s07_08');
    expect(findDeliverySlotLabelKey('afternoon', '12:00 - 01:00 PM')).toBe('slots.s12_13');
    expect(findDeliverySlotLabelKey('evening', '08:00 - 09:00 PM')).toBe('slots.s20_21');
    expect(findDeliverySlotLabelKey('evening', '07:00 - 08:00 AM')).toBeNull();
    expect(findDeliverySlotLabelKey('morning', '')).toBeNull();
  });
});
