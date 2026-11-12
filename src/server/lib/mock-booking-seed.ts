import 'server-only';
import {
  BookingOrder,
  PickupLocation,
  RecipientRecord,
} from '@/features/booking/types/booking-types';
import { MOCK_BOOKING_DETAILS } from '@/features/booking/data/mock-booking-detail-data';
import {
  createDemoRecipients,
  DEMO_SAVED_LOCATIONS,
} from '@/features/booking/data/demo-seed-data';

export const INITIAL_SAVED_LOCATIONS: PickupLocation[] = DEMO_SAVED_LOCATIONS;

export const INITIAL_RECIPIENTS: RecipientRecord[] = createDemoRecipients();

export const INITIAL_ORDERS: BookingOrder[] =
  Object.values(MOCK_BOOKING_DETAILS);

