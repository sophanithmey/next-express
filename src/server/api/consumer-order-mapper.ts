import 'server-only';
import {
  BookingOrder,
  CreateBookingPayload,
  DashboardStatistics,
  DropoffStop,
} from '@/features/booking/types/booking-types';
import { PaginatedResponse } from '@/types/api-types';
import { APP_CONFIG } from '@/lib/constants';
import { sanitizeCambodiaPhoneInput } from '@/lib/phone-number';
import { syncCodWithDropoffs } from '@/features/booking/services/booking-form-helpers';

export interface ConsumerOrderFilter {
  field: string;
  values: string[];
  condition: 'IN' | 'EQUALS' | 'LIKE';
}

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

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cop: 'cash_on_delivery',
  cash_on_delivery: 'cash_on_delivery',
  khqr: 'khqr',
  wingpoint: 'wing_point',
  wallet: 'wing_pay',
  card: 'card',
};

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

function normalizeCourierPhone(value?: string | null): string {
  if (!value) return '';
  const digits = sanitizeCambodiaPhoneInput(value);
  return digits || value.trim();
}

function normalizeHttpImages(imageUrl?: string | string[] | null): string[] {
  const list = Array.isArray(imageUrl) ? imageUrl : imageUrl ? [imageUrl] : [];
  return list.filter(
    (src) => typeof src === 'string' && /^https?:\/\//i.test(src.trim()),
  );
}

function normalizeParcelType(category?: string): string {
  const cleaned = category?.trim().toUpperCase().replace(/\s+/g, '-');
  return cleaned || 'GENERAL';
}

export function mapPaymentMethodToCourier(method?: string | null): string | null {
  if (!method) return null;
  const key = method.trim().toLowerCase();
  return PAYMENT_METHOD_MAP[key] || method.trim();
}

export function mapConsumerOrderStatus(raw?: string | null): BookingOrder['status'] {
  if (!raw) return 'pending';
  return ORDER_STATUS_TO_UI[raw.trim().toUpperCase()] || 'pending';
}

export function buildOrderStatusFilter(status?: string): ConsumerOrderFilter[] | undefined {
  if (!status || status === 'all') return undefined;
  const values = UI_STATUS_FILTER_VALUES[status.toLowerCase()];
  if (!values) return undefined;
  return [{ field: 'order_status', values, condition: 'IN' }];
}

export function buildCourierOrderPayload(
  payload: CreateBookingPayload,
  options?: {
    fallbackPhone?: string;
    fallbackSenderName?: string;
    orderId?: string;
    includePaymentMethod?: boolean;
  },
): Record<string, unknown> {
  const stops: DropoffStop[] =
    payload.dropoffs && payload.dropoffs.length > 0
      ? payload.dropoffs
      : [{ id: 'stop-1', recipient: payload.recipient, dropoff: payload.dropoff }];

  const effectiveCod = payload.dropoffs?.length
    ? syncCodWithDropoffs(payload.dropoffs, payload.cod)
    : payload.cod;

  const subtotal = Math.max(
    0,
    Number(payload.feeQuote?.totalDeliveryFee ?? payload.finalFee ?? 1.75),
  );
  const discountAmount = Math.max(0, Number(payload.discountAmount ?? 0));
  const tipAmount = Math.max(0, Number(payload.tipAmount ?? 0));
  const totalAmount = Math.max(
    0,
    Number(payload.finalFee ?? Math.max(0, subtotal - discountAmount + tipAmount)),
  );
  const totalCollect = effectiveCod.isCod ? Math.max(0, Number(effectiveCod.amount) || 0) : 0;

  return {
    ...(options?.orderId ? { order_id: options.orderId } : {}),
    platform: 'UNIFIED',
    service_type: 'ST_EXPRESS',
    currency: 'USD',
    exchange_rate: 4000,
    subtotal,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    ...(options?.orderId ? { optimized_saving_fee: 0 } : {}),
    region_id: 'PP01',
    remark: payload.parcel.instructions?.trim() || '',
    payment_method:
      options?.includePaymentMethod && !payload.isDraft
        ? mapPaymentMethodToCourier(payload.paymentMethod)
        : null,
    payment_card_id:
      options?.includePaymentMethod && !payload.isDraft && payload.paymentCardId
        ? payload.paymentCardId
        : null,
    device_payment: '',
    is_using_cod: Boolean(effectiveCod.isCod || totalCollect > 0),
    total_delivery_fee: subtotal,
    total_collect_payment: totalCollect,
    use_smart_route: false,
    courier_type: 'instant_delivery',
    sender: {
      sender_name: payload.pickup.senderName?.trim() || options?.fallbackSenderName || '',
      phone_number: normalizeCourierPhone(
        payload.pickup.senderPhone || options?.fallbackPhone,
      ),
      latitude: payload.pickup.coordinates.lat,
      longitude: payload.pickup.coordinates.lng,
      settlement_bank: null,
      settlement_account_name: '',
      settlement_account_number: '',
      pickup_address_id: payload.pickup.id?.startsWith('ADD-') ? payload.pickup.id : '',
      pickup_location_name: payload.pickup.address || payload.pickup.name || '',
      note: payload.pickup.riderNote?.trim() || '',
      images: normalizeHttpImages(payload.pickup.imageUrl),
      metadata: {
        ...(payload.pickup.name ? { location_label: payload.pickup.name } : {}),
        ...(payload.parcel.sellerOrderRef
          ? { seller_order_ref: payload.parcel.sellerOrderRef }
          : {}),
        ...(payload.deliveryOption ? { delivery_option: payload.deliveryOption } : {}),
        ...(payload.promoCode ? { promo_code: payload.promoCode } : {}),
        ...(tipAmount > 0 ? { tip_amount: tipAmount } : {}),
      },
    },
    receivers: stops.map((stop, idx) => {
      const stopCod =
        typeof stop.codAmount === 'number'
          ? Math.max(0, stop.codAmount)
          : idx === 0 && effectiveCod.isCod
          ? totalCollect
          : 0;

      return {
        ...(stop.id?.startsWith('OCR-') ? { id: stop.id } : {}),
        sequence_num: idx + 1,
        pre_optimized_sequence_num: idx + 1,
        receiver_name: stop.recipient.name?.trim() || '',
        phone_number: normalizeCourierPhone(stop.recipient.phoneNumber),
        collect_payment_amount: stopCod,
        dropoff_location_name: stop.dropoff.address,
        dropoff_address_id: stop.dropoff.addressId?.startsWith('ADD-')
          ? stop.dropoff.addressId
          : '',
        latitude: stop.dropoff.coordinates.lat,
        longitude: stop.dropoff.coordinates.lng,
        parcel_type: normalizeParcelType(payload.parcel.itemCategory),
        note: stop.recipient.notes?.trim() || stop.parcelNote?.trim() || '',
        metadata: {
          ...(payload.parcel.description
            ? { description: payload.parcel.description }
            : {}),
        },
        images: normalizeHttpImages(stop.recipient.imageUrl || stop.imageUrl),
      };
    }),
  };
}

export function mapCourierOrderToBookingOrder(
  raw: ConsumerOrderRecord,
  fallback?: CreateBookingPayload,
): BookingOrder {
  const id = raw.order_id?.trim() || fallback?.draftOrderId || `ord-${Date.now()}`;
  const trackingNumber =
    raw.tracking_number?.trim() ||
    raw.order_number?.trim() ||
    fallback?.trackingNumber ||
    id;

  const sender = raw.sender || undefined;
  const senderMeta = (sender?.metadata || {}) as Record<string, unknown>;
  const rawReceivers = Array.isArray(raw.receivers)
    ? [...raw.receivers].sort(
        (a, b) => Number(a.sequence_num ?? 0) - Number(b.sequence_num ?? 0),
      )
    : [];

  const dropoffs: DropoffStop[] =
    rawReceivers.length > 0
      ? rawReceivers.map((r, idx) => ({
          id: r.id || `stop-${idx + 1}`,
          recipient: {
            name: r.receiver_name || '',
            phoneNumber: r.phone_number || '',
            notes: r.note || '',
            imageUrl: r.images?.[0],
          },
          dropoff: {
            addressId: r.dropoff_address_id || undefined,
            address: r.dropoff_location_name || '',
            coordinates: {
              lat: Number(r.latitude) || APP_CONFIG.defaultCoordinates.lat,
              lng: Number(r.longitude) || APP_CONFIG.defaultCoordinates.lng,
            },
          },
          codAmount:
            typeof r.collect_payment_amount === 'number'
              ? r.collect_payment_amount
              : undefined,
          imageUrl: r.images?.[0],
        }))
      : fallback?.dropoffs || [
          {
            id: 'stop-1',
            recipient: fallback?.recipient || { name: '', phoneNumber: '' },
            dropoff: fallback?.dropoff || {
              address: '',
              coordinates: APP_CONFIG.defaultCoordinates,
            },
          },
        ];

  const firstStop = dropoffs[0];
  const sumCod = dropoffs.reduce((s, d) => s + (Number(d.codAmount) || 0), 0);
  const totalCollect = Number(raw.total_collect_payment ?? sumCod) || 0;
  const deliveryFee =
    Number(
      raw.total_delivery_fee ??
        raw.total_amount ??
        raw.subtotal ??
        fallback?.feeQuote?.totalDeliveryFee ??
        0,
    ) || 0;

  const paymentStatusRaw = (raw.payment?.payment_status || raw.payment?.status || '').toUpperCase();
  const paymentStatus: BookingOrder['paymentStatus'] =
    paymentStatusRaw === 'PAID' || paymentStatusRaw === 'SUCCESS' || paymentStatusRaw === 'COMPLETED'
      ? 'paid'
      : paymentStatusRaw === 'FAILED'
      ? 'failed'
      : paymentStatusRaw === 'REFUNDED'
      ? 'refunded'
      : 'pending';

  const nowIso = new Date().toISOString();
  const receiverMeta = (rawReceivers[0]?.metadata || {}) as Record<string, unknown>;

  return {
    id,
    deliveryId: raw.delivery_id || undefined,
    orderNumber: raw.order_number || undefined,
    trackingNumber,
    trackingUrl: `/track/${encodeURIComponent(trackingNumber)}`,
    status: raw.order_status
      ? mapConsumerOrderStatus(raw.order_status)
      : fallback?.isDraft
      ? 'draft'
      : 'pending',
    paymentStatus,
    paymentMethod:
      raw.payment?.payment_method ||
      raw.payment_method ||
      fallback?.paymentMethod ||
      undefined,
    paymentCardId: raw.payment_card_id || fallback?.paymentCardId || undefined,
    paymentDate: raw.payment?.updated_date || raw.payment?.created_date || undefined,
    paymentId: raw.payment?.payment_id || undefined,
    pickup: sender
      ? {
          id: sender.pickup_address_id || undefined,
          name:
            (typeof senderMeta.location_label === 'string' && senderMeta.location_label) ||
            sender.pickup_location_name?.split(',')[0] ||
            'Pickup Location',
          address: sender.pickup_location_name || fallback?.pickup.address || '',
          coordinates: {
            lat: Number(sender.latitude) || fallback?.pickup.coordinates.lat || APP_CONFIG.defaultCoordinates.lat,
            lng: Number(sender.longitude) || fallback?.pickup.coordinates.lng || APP_CONFIG.defaultCoordinates.lng,
          },
          senderName: sender.sender_name || undefined,
          senderPhone: sender.phone_number || undefined,
          riderNote: sender.note || undefined,
          imageUrl: sender.images?.[0],
        }
      : fallback?.pickup || {
          name: 'Pickup Location',
          address: '',
          coordinates: APP_CONFIG.defaultCoordinates,
        },
    dropoff: firstStop?.dropoff || fallback?.dropoff || {
      address: '',
      coordinates: APP_CONFIG.defaultCoordinates,
    },
    dropoffs,
    deliveryOption:
      (typeof senderMeta.delivery_option === 'string'
        ? (senderMeta.delivery_option as BookingOrder['deliveryOption'])
        : undefined) || fallback?.deliveryOption,
    recipient: firstStop?.recipient || fallback?.recipient || { name: '', phoneNumber: '' },
    parcel: {
      sellerOrderRef:
        (typeof senderMeta.seller_order_ref === 'string' && senderMeta.seller_order_ref) ||
        raw.order_number ||
        fallback?.parcel.sellerOrderRef,
      description:
        (typeof receiverMeta.description === 'string' && receiverMeta.description) ||
        fallback?.parcel.description,
      instructions: raw.remark || fallback?.parcel.instructions,
      itemCategory: rawReceivers[0]?.parcel_type || fallback?.parcel.itemCategory,
    },
    cod: {
      isCod: Boolean(raw.is_using_cod || totalCollect > 0),
      amount: totalCollect,
    },
    deliveryFee,
    totalSellerCharge: Number(raw.total_amount ?? deliveryFee) || deliveryFee,
    createdAt: raw.created_date || raw.placed_date || nowIso,
    updatedAt: raw.updated_date || raw.created_date || nowIso,
    cancellationReason: raw.cancelled_reason || undefined,
    cancelledAt: raw.cancelled_date || undefined,
  };
}

export function mapCourierOrderListResponse(
  rawBody: unknown,
  requestedPage: number,
  requestedLimit: number,
): PaginatedResponse<BookingOrder> {
  if (Array.isArray(rawBody)) {
    const items = (rawBody as ConsumerOrderRecord[]).map((item) =>
      mapCourierOrderToBookingOrder(item),
    );
    return {
      items,
      pagination: {
        page: requestedPage,
        limit: requestedLimit,
        total: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / requestedLimit)),
      },
    };
  }

  const envelope = (rawBody && typeof rawBody === 'object' ? rawBody : {}) as Record<
    string,
    unknown
  >;
  const listCandidate =
    ['data', 'items', 'orders', 'content', 'list', 'rows', 'results']
      .map((key) => envelope[key])
      .find(Array.isArray) || Object.values(envelope).find(Array.isArray);

  const items = Array.isArray(listCandidate)
    ? (listCandidate as ConsumerOrderRecord[]).map((item) =>
        mapCourierOrderToBookingOrder(item),
      )
    : [];

  const total = Number(envelope.records ?? envelope.total ?? items.length) || 0;
  const page = Number(envelope.page ?? requestedPage) || 1;
  const totalPages = Math.max(
    1,
    Number(envelope.pages ?? envelope.total_pages ?? Math.ceil(total / requestedLimit)) || 1,
  );

  return {
    items,
    pagination: { page, limit: requestedLimit, total, totalPages },
  };
}

export function computeDashboardStatistics(
  orders: BookingOrder[],
): DashboardStatistics {
  const today = new Date().toISOString().slice(0, 10);
  let todayBookings = 0;
  let pendingPickup = 0;
  let inTransit = 0;
  let delivered = 0;
  let codCollection = 0;

  for (const order of orders) {
    if (order.createdAt.slice(0, 10) === today && order.status !== 'draft') todayBookings += 1;
    if (order.status === 'pending' || order.status === 'confirmed') pendingPickup += 1;
    if (order.status === 'assigned' || order.status === 'out_for_delivery') inTransit += 1;
    if (order.status === 'delivered') delivered += 1;
    if (order.cod.isCod && order.status !== 'cancelled' && order.status !== 'draft') {
      codCollection += order.cod.amount;
    }
  }

  return {
    todayBookings,
    pendingPickup,
    inTransit,
    delivered,
    codCollection: Math.round(codCollection * 100) / 100,
  };
}
