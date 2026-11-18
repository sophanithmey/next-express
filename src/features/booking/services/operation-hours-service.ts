import {
  DeliverySchedule,
  DeliveryShift,
  DeliverySpeedOption,
} from '../types/booking-types';
import { DELIVERY_SHIFTS } from '../data/delivery-schedule-options';

/** Operation hours: 6:00 AM – 9:30 PM */
export const OPERATION_OPEN_MINUTES = 6 * 60; // 06:00
export const OPERATION_CLOSE_MINUTES = 21 * 60 + 30; // 21:30

/** Schedule delivery blocks same-day booking 2 hours before close (7:30 PM) */
export const SCHEDULE_CUTOFF_BEFORE_CLOSE_MINUTES = 2 * 60;
export const SCHEDULE_TODAY_CUTOFF_MINUTES =
  OPERATION_CLOSE_MINUTES - SCHEDULE_CUTOFF_BEFORE_CLOSE_MINUTES; // 19:30 (7:30 PM)

/** Schedule delivery allows booking up to 2 days in advance (Today, Tomorrow, In 2 Days) */
export const SCHEDULE_MAX_ADVANCE_DAYS = 2;

export type ScheduleDayId = 'today' | 'tomorrow' | 'day_after_tomorrow';

export const SCHEDULE_DAY_OPTIONS: ReadonlyArray<{
  id: ScheduleDayId;
  offsetDays: number;
}> = [
  { id: 'today', offsetDays: 0 },
  { id: 'tomorrow', offsetDays: 1 },
  { id: 'day_after_tomorrow', offsetDays: 2 },
];

export function normalizeScheduleDayId(date?: string): ScheduleDayId {
  if (date === 'today') return 'today';
  if (date === 'day_after_tomorrow') return 'day_after_tomorrow';
  return 'tomorrow';
}

export function getMinutesSinceMidnight(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Instant delivery can be booked from 6:00 AM to 9:30 PM (inclusive).
 */
export function isInstantDeliveryAvailable(now: Date = new Date()): boolean {
  const minutes = getMinutesSinceMidnight(now);
  return minutes >= OPERATION_OPEN_MINUTES && minutes <= OPERATION_CLOSE_MINUTES;
}

/**
 * Same-day ("Today") scheduled booking is blocked starting 2 hours before
 * operation close (at/after 7:30 PM).
 */
export function isScheduleTodayAvailable(now: Date = new Date()): boolean {
  const minutes = getMinutesSinceMidnight(now);
  return minutes < SCHEDULE_TODAY_CUTOFF_MINUTES;
}

/**
 * Checks whether a specific day (Today, Tomorrow, In 2 Days) can be scheduled.
 */
export function isScheduleDayAvailable(
  day: ScheduleDayId,
  now: Date = new Date(),
): boolean {
  if (day === 'today') return isScheduleTodayAvailable(now);
  return true;
}

/**
 * Checks whether a shift is still selectable for the chosen day.
 * On Today, past shifts (or all shifts after the 7:30 PM cutoff) are blocked.
 */
export function isShiftAvailableForDay(
  shiftId: DeliveryShift,
  day: ScheduleDayId,
  now: Date = new Date(),
): boolean {
  if (day !== 'today') return true;
  if (!isScheduleTodayAvailable(now)) return false;

  const shift = DELIVERY_SHIFTS.find((s) => s.id === shiftId);
  if (!shift) return false;
  return getMinutesSinceMidnight(now) < shift.endMinutes;
}

/**
 * Checks whether a 1-hour time slot is selectable for the chosen day.
 * On Today, slots whose start time has already passed (or after 7:30 PM cutoff) are blocked.
 */
export function isTimeSlotAvailableForDay(
  shiftId: DeliveryShift,
  slotValue: string,
  day: ScheduleDayId,
  now: Date = new Date(),
): boolean {
  if (day !== 'today') return true;
  if (!isScheduleTodayAvailable(now)) return false;

  const shift = DELIVERY_SHIFTS.find((s) => s.id === shiftId);
  const slot = shift?.slots.find((s) => s.value === slotValue);
  if (!slot) return false;

  return getMinutesSinceMidnight(now) < slot.startMinutes;
}

/**
 * Returns the earliest selectable schedule day for the current time.
 */
export function getDefaultScheduleDay(now: Date = new Date()): ScheduleDayId {
  return isScheduleTodayAvailable(now) ? 'today' : 'tomorrow';
}

/**
 * Returns the first available shift for the given day and current time.
 */
export function getDefaultAvailableShift(
  day: ScheduleDayId,
  now: Date = new Date(),
): DeliveryShift {
  const firstAvailable = DELIVERY_SHIFTS.find((shift) =>
    isShiftAvailableForDay(shift.id, day, now),
  );
  return firstAvailable ? firstAvailable.id : 'morning';
}

/**
 * Validates that the selected delivery option & schedule respect operating hours:
 * - Instant: 6:00 AM – 9:30 PM
 * - Schedule Today: blocked 2 hours before close (from 7:30 PM onward)
 * - Schedule advance window: up to 2 days in advance
 */
export function validateDeliveryAvailability(
  deliveryOption: DeliverySpeedOption = 'instant',
  schedule?: DeliverySchedule,
  now: Date = new Date(),
): string | null {
  if (deliveryOption === 'instant') {
    if (!isInstantDeliveryAvailable(now)) {
      return 'Instant delivery is only available between 6:00 AM and 9:30 PM. Please select Schedule delivery.';
    }
    return null;
  }

  const day = normalizeScheduleDayId(schedule?.date);
  if (day === 'today' && !isScheduleTodayAvailable(now)) {
    return 'Same-day scheduled booking closes at 7:30 PM (2 hours before 9:30 PM close). Please select Tomorrow or In 2 Days.';
  }

  if (
    day === 'today' &&
    schedule?.shift &&
    !isShiftAvailableForDay(schedule.shift, day, now)
  ) {
    return 'The selected shift for today has already passed. Please choose an upcoming shift or another day.';
  }

  if (
    day === 'today' &&
    schedule?.shift &&
    schedule.timeSlot &&
    !isTimeSlotAvailableForDay(schedule.shift, schedule.timeSlot, day, now)
  ) {
    return 'The selected time slot for today has already passed. Please choose an upcoming time slot.';
  }

  return null;
}
