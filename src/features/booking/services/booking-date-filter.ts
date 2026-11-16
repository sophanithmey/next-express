export type BookingDatePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_month'
  | 'last_month';
export type MockDateTarget =
  | 'today'
  | 'yesterday'
  | 'this_month'
  | 'last_month'
  | number;

export interface DatePresetOption {
  id: BookingDatePreset;
  labelKey: string;
}

export const DATE_PRESET_OPTIONS: DatePresetOption[] = [
  { id: 'today', labelKey: 'dateFilterToday' },
  { id: 'yesterday', labelKey: 'dateFilterYesterday' },
  { id: 'this_month', labelKey: 'dateFilterThisMonth' },
  { id: 'last_month', labelKey: 'dateFilterLastMonth' },
  { id: 'all', labelKey: 'dateFilterAll' },
];

/**
 * Returns a standardized date key (YYYY-MM-DD) for grouping and daily cache invalidation.
 */
export function getTodayDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses raw dates including ISO strings and human strings like "Nov 6, 2026 • 08:30 AM".
 */
export function parseOrderDate(raw: string): Date | null {
  if (!raw) return null;
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;
  const cleaned = raw.replace('•', '').trim();
  const parsedCleaned = new Date(cleaned);
  if (!Number.isNaN(parsedCleaned.getTime())) return parsedCleaned;
  return null;
}

/**
 * Checks whether an order timestamp falls within a selected calendar date preset.
 */
export function isOrderInDatePreset(
  rawDate: string,
  preset: BookingDatePreset,
  referenceDate: Date = new Date(),
): boolean {
  if (!preset || preset === 'all') return true;
  const d = parseOrderDate(rawDate);
  if (!d) return false;

  const now = referenceDate;
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  if (preset === 'today') {
    return d >= todayStart && d <= todayEnd;
  }

  if (preset === 'yesterday') {
    const yStart = new Date(todayStart);
    yStart.setDate(yStart.getDate() - 1);
    const yEnd = new Date(todayEnd);
    yEnd.setDate(yEnd.getDate() - 1);
    return d >= yStart && d <= yEnd;
  }

  if (preset === 'this_month') {
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const mEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return d >= mStart && d <= mEnd;
  }

  if (preset === 'last_month') {
    const lmStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );
    const lmEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    return d >= lmStart && d <= lmEnd;
  }

  return true;
}

/**
 * Helper to generate relative mock order dates based on presets or offset days.
 */
export function createMockOrderDate(
  target: MockDateTarget,
  timeStr: string,
  baseDate: Date = new Date(),
): string {
  const d = new Date(baseDate);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  if (target === 'today' || target === 0) {
    // Current day
  } else if (target === 'yesterday' || target === -1) {
    d.setDate(d.getDate() - 1);
  } else if (target === 'this_month') {
    const day = d.getDate();
    d.setDate(day > 3 ? day - 3 : 1);
  } else if (target === 'last_month') {
    const targetYear =
      d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear();
    const targetMonth = d.getMonth() === 0 ? 11 : d.getMonth() - 1;
    const safeDate = new Date(targetYear, targetMonth, 15);
    return `${months[safeDate.getMonth()]} ${safeDate.getDate()}, ${safeDate.getFullYear()} • ${timeStr}`;
  } else if (typeof target === 'number') {
    d.setDate(d.getDate() + target);
  }

  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} • ${timeStr}`;
}
