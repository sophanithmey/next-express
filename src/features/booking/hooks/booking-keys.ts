import { BookingOrderFilter } from '../services/booking-order-filter';

export interface BookingListQueryFilter {
  page?: number;
  rpp?: number;
  search?: string;
  status?: string;
  filter?: BookingOrderFilter[];
}

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: BookingListQueryFilter) =>
    [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  drafts: () => [...bookingKeys.all, 'drafts'] as const,
};

export const locationKeys = {
  all: ['locations'] as const,
  list: (locale?: string) => [...locationKeys.all, 'list', locale || 'en'] as const,
};

