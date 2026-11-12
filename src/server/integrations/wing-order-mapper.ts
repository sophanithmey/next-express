import 'server-only';
import {
  BookingOrder,
  CreateBookingPayload,
  DashboardStatistics,
  DropoffStop,
} from '@/features/booking/types/booking-types';
import { PaginatedResponse } from '@/types/api-types';
import { APP_CONFIG } from '@/lib/constants';
import {
  buildOrderStatusFilter,
  mapConsumerOrderStatus,
} from '@/features/booking/services/booking-order-filter';
import { ConsumerOrderFilter, ConsumerOrderRecord } from './wing-order-types';
import {
  buildCourierOrderPayload,
  mapPaymentMethodToCourier,
} from './wing-order-payload';

export type { ConsumerOrderFilter, ConsumerOrderRecord };
export {
  buildCourierOrderPayload,
  buildOrderStatusFilter,
  mapConsumerOrderStatus,
  mapPaymentMethodToCourier,
};

function mapPaymentStatus(raw: ConsumerOrderRecord): BookingOrder['paymentStatus'] {
  const statusRaw = (
    raw.payment?.payment_status ||
    raw.payment?.status ||
    ''
  ).toUpperCase();
  if (statusRaw === 'PAID' || statusRaw === 'SUCCESS' || statusRaw === 'COMPLETED') {
    return 'paid';
  }
  if (statusRaw === 'FAILED') return 'failed';
  if (statusRaw === 'REFUNDED') return 'refunded';
  return 'pending';
}

export function mapCourierOrderToBookingOrder(
  raw: ConsumerOrderRecord,
  fallback?: CreateBookingPayload,
): BookingOrder {
  const id =
    raw.order_id?.trim() || fallback?.draftOrderId || `ord-${Date.now()}`;
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
    paymentStatus: mapPaymentStatus(raw),
    paymentMethod:
      raw.payment?.payment_method ||
      raw.payment_method ||
      fallback?.paymentMethod ||
      undefined,
    paymentCardId: raw.payment_card_id || fallback?.paymentCardId || undefined,
    paymentDate:
      raw.payment?.updated_date || raw.payment?.created_date || undefined,
    paymentId: raw.payment?.payment_id || undefined,
    pickup: sender
      ? {
          id: sender.pickup_address_id || undefined,
          name:
            (typeof senderMeta.location_label === 'string' &&
              senderMeta.location_label) ||
            sender.pickup_location_name?.split(',')[0] ||
            'Pickup Location',
          address: sender.pickup_location_name || fallback?.pickup.address || '',
          coordinates: {
            lat:
              Number(sender.latitude) ||
              fallback?.pickup.coordinates.lat ||
              APP_CONFIG.defaultCoordinates.lat,
            lng:
              Number(sender.longitude) ||
              fallback?.pickup.coordinates.lng ||
              APP_CONFIG.defaultCoordinates.lng,
          },
          senderName: sender.sender_name || undefined,
          senderPhone: sender.phone_number || undefined,
          riderNote: sender.note || undefined,
          imageUrl: sender.images?.[0],
          settlementBank: sender.settlement_bank || undefined,
          settlementAccountName: sender.settlement_account_name || undefined,
          settlementAccountNumber: sender.settlement_account_number || undefined,
        }
      : fallback?.pickup || {
          name: 'Pickup Location',
          address: '',
          coordinates: APP_CONFIG.defaultCoordinates,
        },
    dropoff: firstStop?.dropoff ||
      fallback?.dropoff || {
        address: '',
        coordinates: APP_CONFIG.defaultCoordinates,
      },
    dropoffs,
    deliveryOption:
      (typeof senderMeta.delivery_option === 'string'
        ? (senderMeta.delivery_option as BookingOrder['deliveryOption'])
        : undefined) || fallback?.deliveryOption,
    recipient:
      firstStop?.recipient ||
      fallback?.recipient || { name: '', phoneNumber: '' },
    parcel: {
      sellerOrderRef:
        (typeof senderMeta.seller_order_ref === 'string' &&
          senderMeta.seller_order_ref) ||
        raw.order_number ||
        fallback?.parcel.sellerOrderRef,
      description:
        (typeof receiverMeta.description === 'string' &&
          receiverMeta.description) ||
        fallback?.parcel.description,
      instructions: raw.remark || fallback?.parcel.instructions,
      itemCategory:
        rawReceivers[0]?.parcel_type || fallback?.parcel.itemCategory,
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
    Number(
      envelope.pages ?? envelope.total_pages ?? Math.ceil(total / requestedLimit),
    ) || 1,
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
    if (order.createdAt.slice(0, 10) === today && order.status !== 'draft') {
      todayBookings += 1;
    }
    if (order.status === 'pending' || order.status === 'confirmed') pendingPickup += 1;
    if (order.status === 'assigned' || order.status === 'out_for_delivery') {
      inTransit += 1;
    }
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

