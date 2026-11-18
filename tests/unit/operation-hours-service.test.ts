import { describe, it, expect } from 'vitest';
import {
  OPERATION_OPEN_MINUTES,
  OPERATION_CLOSE_MINUTES,
  SCHEDULE_TODAY_CUTOFF_MINUTES,
  SCHEDULE_MAX_ADVANCE_DAYS,
  SCHEDULE_DAY_OPTIONS,
  isInstantDeliveryAvailable,
  isScheduleTodayAvailable,
  isScheduleDayAvailable,
  isShiftAvailableForDay,
  isTimeSlotAvailableForDay,
  getDefaultScheduleDay,
  getDefaultAvailableShift,
  validateDeliveryAvailability,
} from '@/features/booking/services/operation-hours-service';

function makeLocalTime(hours: number, minutes: number): Date {
  return new Date(2026, 10, 18, hours, minutes, 0, 0);
}

describe('Operation Hours & Scheduling Rules', () => {
  it('defines operation hours 6:00 AM – 9:30 PM, 2-hour schedule cutoff at 7:30 PM, and 2 days advance', () => {
    expect(OPERATION_OPEN_MINUTES).toBe(360);
    expect(OPERATION_CLOSE_MINUTES).toBe(1290);
    expect(SCHEDULE_TODAY_CUTOFF_MINUTES).toBe(1170);
    expect(SCHEDULE_MAX_ADVANCE_DAYS).toBe(2);
    expect(SCHEDULE_DAY_OPTIONS.map((d) => d.offsetDays)).toEqual([0, 1, 2]);
  });

  it('allows Instant delivery strictly between 6:00 AM and 9:30 PM inclusive', () => {
    expect(isInstantDeliveryAvailable(makeLocalTime(5, 59))).toBe(false);
    expect(isInstantDeliveryAvailable(makeLocalTime(6, 0))).toBe(true);
    expect(isInstantDeliveryAvailable(makeLocalTime(14, 30))).toBe(true);
    expect(isInstantDeliveryAvailable(makeLocalTime(21, 30))).toBe(true);
    expect(isInstantDeliveryAvailable(makeLocalTime(21, 31))).toBe(false);
    expect(isInstantDeliveryAvailable(makeLocalTime(23, 0))).toBe(false);
  });

  it('blocks same-day Schedule booking 2 hours before close (from 7:30 PM onward)', () => {
    expect(isScheduleTodayAvailable(makeLocalTime(19, 29))).toBe(true);
    expect(isScheduleTodayAvailable(makeLocalTime(19, 30))).toBe(false);
    expect(isScheduleTodayAvailable(makeLocalTime(20, 45))).toBe(false);

    expect(getDefaultScheduleDay(makeLocalTime(19, 29))).toBe('today');
    expect(getDefaultScheduleDay(makeLocalTime(19, 30))).toBe('tomorrow');
  });

  it('keeps Tomorrow (+1 day) and In 2 Days (+2 days) available even after 7:30 PM and after close', () => {
    const lateNight = makeLocalTime(22, 15);
    expect(isScheduleDayAvailable('today', lateNight)).toBe(false);
    expect(isScheduleDayAvailable('tomorrow', lateNight)).toBe(true);
    expect(isScheduleDayAvailable('day_after_tomorrow', lateNight)).toBe(true);
  });

  it('blocks elapsed shifts and slots on Today while keeping all future-day shifts open', () => {
    const midAfternoon = makeLocalTime(14, 15);
    expect(isShiftAvailableForDay('morning', 'today', midAfternoon)).toBe(false);
    expect(isShiftAvailableForDay('afternoon', 'today', midAfternoon)).toBe(true);
    expect(isShiftAvailableForDay('evening', 'today', midAfternoon)).toBe(true);
    expect(getDefaultAvailableShift('today', midAfternoon)).toBe('afternoon');

    expect(
      isTimeSlotAvailableForDay('afternoon', '02:00 - 03:00 PM', 'today', midAfternoon),
    ).toBe(false);
    expect(
      isTimeSlotAvailableForDay('afternoon', '03:00 - 04:00 PM', 'today', midAfternoon),
    ).toBe(true);

    // All shifts & slots remain open for Tomorrow and In 2 Days
    expect(isShiftAvailableForDay('morning', 'day_after_tomorrow', midAfternoon)).toBe(true);
    expect(
      isTimeSlotAvailableForDay('morning', '07:00 - 08:00 AM', 'day_after_tomorrow', midAfternoon),
    ).toBe(true);
  });

  it('validates delivery availability and rejects out-of-hours Instant or post-cutoff Today bookings', () => {
    expect(
      validateDeliveryAvailability('instant', undefined, makeLocalTime(21, 31)),
    ).toContain('6:00 AM and 9:30 PM');
    expect(
      validateDeliveryAvailability('instant', undefined, makeLocalTime(10, 0)),
    ).toBeNull();

    expect(
      validateDeliveryAvailability(
        'same_day',
        { date: 'today', dateLabel: 'Today', shift: 'evening' },
        makeLocalTime(19, 30),
      ),
    ).toContain('7:30 PM');

    expect(
      validateDeliveryAvailability(
        'scheduled',
        { date: 'day_after_tomorrow', dateLabel: 'In 2 Days', shift: 'morning' },
        makeLocalTime(22, 0),
      ),
    ).toBeNull();
  });
});
