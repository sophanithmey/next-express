import { z } from 'zod';
import { BookingOrder } from '../types/booking-types';

export type BookingOrderFilterCondition = 'IN' | 'NOT_IN' | 'EQUALS' | 'NOT_EQUALS' | 'LIKE';

export interface BookingOrderFilter {
  field: string;
  values: string[];
  condition: BookingOrderFilterCondition;
}

const ORDER_STATUS_TO_UI: Record<string, BookingOrder['status']> = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CREATED: 'pending',
  PLACED: 'pending',
  WAITING_PAYMENT: 'pending',
  CONFIRMED: 'confirmed',
  ACCEPTED: 'confirmed',
  ASSIGNED: 'assigned',
  DRIVER_ASSIGNED: 'assigned',
  PICKED_UP: 'assigned',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  IN_TRANSIT: 'out_for_delivery',
  DELIVERING: 'out_for_delivery',
  DELIVERED: 'delivered',
  COMPLETED: 'delivered',
  CANCELLED: 'cancelled',
  CANCELED: 'cancelled',
  REJECTED: 'cancelled',
};

const UI_STATUS_FILTER_VALUES: Record<string, string[]> = {
  draft: ['DRAFT'],
  pending: ['PENDING'],
  confirmed: ['CONFIRMED'],
  assigned: ['ASSIGNED'],
  out_for_delivery: ['OUT_FOR_DELIVERY'],
  delivered: ['DELIVERED'],
  cancelled: ['CANCELLED'],
};

const FILTER_CONDITION_SCHEMA = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
  z.enum(['IN', 'NOT_IN', 'EQUALS', 'NOT_EQUALS', 'LIKE'])
);

const bookingFilterItemSchema = z.object({
  field: z.string().trim().min(1, 'Filter field is required'),
  values: z
    .array(
      z
        .union([z.string(), z.number(), z.boolean()])
        .transform((val) => String(val).trim())
        .refine((val) => val.length > 0, 'Filter value cannot be empty')
    )
    .min(1, 'Filter values must contain at least one item'),
  condition: FILTER_CONDITION_SCHEMA.default('IN'),
});

const bookingFilterArraySchema = z.array(bookingFilterItemSchema);

/**
 * Maps an upstream Wing order_status string into the UI booking status enum.
 */
export function mapConsumerOrderStatus(raw?: string | null): BookingOrder['status'] {
  if (!raw) return 'pending';
  return ORDER_STATUS_TO_UI[raw.trim().toUpperCase()] || 'pending';
}

/**
 * Converts a UI status token (or comma-separated Wing statuses) into Wing courier order filter entries.
 */
export function buildOrderStatusFilter(status?: string): BookingOrderFilter[] | undefined {
  const trimmed = status?.trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') return undefined;

  const collected: string[] = [];
  for (const part of trimmed.split(',')) {
    const token = part.trim();
    if (!token || token.toLowerCase() === 'all') continue;

    const mapped = UI_STATUS_FILTER_VALUES[token.toLowerCase()];
    if (mapped) {
      collected.push(...mapped);
      continue;
    }

    if (/^[A-Za-z0-9_]+$/.test(token)) {
      collected.push(token.toUpperCase());
    }
  }

  const values = Array.from(new Set(collected));
  if (values.length === 0) return undefined;
  return [{ field: 'order_status', values, condition: 'IN' }];
}

/**
 * Safely parses and validates a serialized `filter` query param matching
 * `[{"field":"order_status","values":["DRAFT"],"condition":"IN"}]`.
 */
export function parseBookingOrderFilterParam(raw: string | null | undefined): {
  filters?: BookingOrderFilter[];
  error?: string;
} {
  const trimmed = raw?.trim();
  if (!trimmed) return { filters: undefined };

  let decoded: unknown;
  try {
    decoded = JSON.parse(trimmed);
  } catch {
    return { error: 'Invalid filter query parameter: expected JSON array' };
  }

  const parsed = bookingFilterArraySchema.safeParse(decoded);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || 'Invalid filter query parameter structure',
    };
  }

  if (parsed.data.length === 0) {
    return { filters: undefined };
  }

  return { filters: parsed.data };
}

/**
 * Combines explicit `filter` array clauses with an optional `status` shorthand
 * without duplicating `order_status` constraints.
 */
export function mergeOrderFilters(
  explicitFilters?: BookingOrderFilter[],
  status?: string
): BookingOrderFilter[] | undefined {
  const statusFilters = buildOrderStatusFilter(status);
  if (!explicitFilters || explicitFilters.length === 0) {
    return statusFilters;
  }

  if (!statusFilters) {
    return explicitFilters;
  }

  const hasOrderStatusRule = explicitFilters.some(
    (entry) => entry.field.trim().toLowerCase() === 'order_status'
  );
  return hasOrderStatusRule ? explicitFilters : [...explicitFilters, ...statusFilters];
}

/**
 * Extracts normalized UI booking statuses from `order_status` filter rules for in-memory/mock filtering.
 */
export function extractUiStatusesFromFilters(
  filters?: BookingOrderFilter[]
): BookingOrder['status'][] | undefined {
  if (!filters || filters.length === 0) return undefined;

  const statuses: BookingOrder['status'][] = [];
  for (const entry of filters) {
    if (entry.field.trim().toLowerCase() !== 'order_status') continue;
    if (entry.condition !== 'IN' && entry.condition !== 'EQUALS') continue;
    for (const value of entry.values) {
      statuses.push(mapConsumerOrderStatus(value));
    }
  }

  if (statuses.length === 0) return undefined;
  return Array.from(new Set(statuses));
}

