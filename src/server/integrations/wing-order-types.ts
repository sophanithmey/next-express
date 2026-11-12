import 'server-only';
import { BookingOrderFilter } from '@/features/booking/services/booking-order-filter';

export type ConsumerOrderFilter = BookingOrderFilter;

export interface ConsumerOrderSenderPayload {
  sender_name: string;
  phone_number: string;
  latitude: number;
  longitude: number;
  settlement_bank: string | null;
  settlement_account_name: string;
  settlement_account_number: string;
  pickup_address_id: string;
  pickup_location_name: string;
  note: string;
  images: string[];
  metadata: Record<string, unknown>;
}

export interface ConsumerOrderReceiverPayload {
  id?: string;
  sequence_num: number;
  pre_optimized_sequence_num: number;
  receiver_name: string;
  phone_number: string;
  collect_payment_amount: number;
  delivery_fee?: number;
  distance_meter?: number;
  dropoff_location_name: string;
  dropoff_address_id: string;
  latitude: number;
  longitude: number;
  parcel_type: string;
  note: string;
  metadata: Record<string, unknown>;
  images: string[];
}

export interface ConsumerOrderRecord {
  order_id?: string | null;
  delivery_id?: string | null;
  tracking_number?: string | null;
  order_number?: string | null;
  order_status?: string | null;
  subtotal?: number | null;
  discount_amount?: number | null;
  total_amount?: number | null;
  paid_amount?: number | null;
  remark?: string | null;
  courier_type?: string | null;
  is_using_cod?: boolean | null;
  total_delivery_fee?: number | null;
  total_collect_payment?: number | null;
  payment_method?: string | null;
  payment_card_id?: string | null;
  payment?: {
    payment_id?: string | null;
    payment_method?: string | null;
    payment_status?: string | null;
    status?: string | null;
    created_date?: string | null;
    updated_date?: string | null;
  } | null;
  sender?: Partial<ConsumerOrderSenderPayload> | null;
  receivers?: Partial<ConsumerOrderReceiverPayload>[] | null;
  cancelled_reason?: string | null;
  cancelled_date?: string | null;
  placed_date?: string | null;
  created_date?: string | null;
  updated_date?: string | null;
  metadata?: Record<string, unknown> | null;
}

