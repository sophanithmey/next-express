import { PaginatedResponse } from '@/types/api-types';
import {
  DEMO_STORAGE_KEYS,
  readStoredDemoArray,
  removeStoredDemoKey,
  writeStoredDemoArray,
} from '@/lib/local-demo-storage';
import { MOCK_BOOKING_DETAILS } from '../data/mock-booking-detail-data';
import {
  BookingFeeQuote,
  BookingFormData,
  BookingOrder,
  DeliverySpeedOption,
  GeoCoordinates,
} from '../types/booking-types';
import { clearBookingDraft } from './booking-draft-service';
import { BookingOrderFilter, extractUiStatusesFromFilters } from './booking-order-filter';
import { calculateBookingFeeQuote } from './pricing-service';

export interface LocalDemoListParams {
  page?: number;
  rpp?: number;
  search?: string;
  status?: string;
  filter?: BookingOrderFilter[];
}

export interface LocalDemoCreatePayload {
  draftOrderId?: BookingFormData['draftOrderId'];
  pickup: BookingFormData['pickup'];
  dropoff: BookingFormData['dropoff'];
  dropoffs?: BookingFormData['dropoffs'];
  deliveryOption?: BookingFormData['deliveryOption'];
  recipient: BookingFormData['recipient'];
  parcel: BookingFormData['parcel'];
  cod: BookingFormData['cod'];
  paymentMethod?: string;
  paymentCardId?: string;
  finalFee?: number;
  isDraft?: boolean;
  trackingNumber?: string;
}

function stripLargeImages(orders: BookingOrder[]): BookingOrder[] {
  return orders.map((order) => ({
    ...order,
    pickup: { ...order.pickup, imageUrl: undefined },
    recipient: { ...order.recipient, imageUrl: undefined },
    dropoffs: order.dropoffs?.map((stop) => ({
      ...stop,
      imageUrl: undefined,
      recipient: { ...stop.recipient, imageUrl: undefined },
    })),
  }));
}

function getAllOrders(): BookingOrder[] {
  return readStoredDemoArray<BookingOrder>(DEMO_STORAGE_KEYS.orders, () =>
    Object.values(MOCK_BOOKING_DETAILS),
  );
}

function matchesSearch(order: BookingOrder, query: string): boolean {
  const q = query.toLowerCase();
  return (
    order.trackingNumber.toLowerCase().includes(q) ||
    order.id.toLowerCase().includes(q) ||
    order.recipient.name.toLowerCase().includes(q) ||
    order.recipient.phoneNumber.toLowerCase().includes(q) ||
    order.dropoff.address.toLowerCase().includes(q) ||
    Boolean(order.parcel.sellerOrderRef?.toLowerCase().includes(q)) ||
    Boolean(
      order.dropoffs?.some(
        (stop) =>
          stop.dropoff.address.toLowerCase().includes(q) ||
          stop.recipient.phoneNumber.toLowerCase().includes(q) ||
          stop.recipient.name.toLowerCase().includes(q),
      ),
    )
  );
}

export const localDemoBookingStore = {
  listOrders(params: LocalDemoListParams = {}): PaginatedResponse<BookingOrder> {
    let filtered = getAllOrders();
    const filterStatuses = extractUiStatusesFromFilters(params.filter);

    if (filterStatuses && filterStatuses.length > 0) {
      const allowed = new Set(filterStatuses);
      filtered = filtered.filter((o) => allowed.has(o.status));
    } else if (params.status && params.status !== 'all') {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      filtered = filtered.filter((o) => matchesSearch(o, q));
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.rpp || 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const items = filtered.slice((page - 1) * limit, page * limit);
    return { items, pagination: { page, limit, total, totalPages } };
  },

  getOrderById(idOrTracking: string): BookingOrder | null {
    const target = idOrTracking.trim().toLowerCase();
    if (!target) return null;
    return (
      getAllOrders().find(
        (o) =>
          o.id.toLowerCase() === target ||
          o.trackingNumber.toLowerCase() === target,
      ) || null
    );
  },

  createOrder(payload: LocalDemoCreatePayload): BookingOrder {
    const now = new Date().toISOString();
    const additionalStopsCount = Math.max(0, (payload.dropoffs?.length || 1) - 1);
    const calculated = calculateBookingFeeQuote({
      pickupCoords: payload.pickup.coordinates,
      dropoffCoords: payload.dropoff.coordinates,
      additionalStopsCount,
      deliverySpeed: payload.deliveryOption || 'instant',
    });
    const fee =
      typeof payload.finalFee === 'number' && payload.finalFee >= 0
        ? payload.finalFee
        : calculated.totalDeliveryFee;
    const trackingNumber =
      payload.trackingNumber || `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const isPaid =
      !payload.isDraft &&
      Boolean(
        payload.paymentMethod &&
          payload.paymentMethod !== 'cop' &&
          payload.paymentMethod !== 'cash_on_delivery',
      );

    const newOrder: BookingOrder = {
      id: `ord-${Date.now()}`,
      trackingNumber,
      trackingUrl: `https://tracking.express.wingbank.com/${trackingNumber}`,
      status: payload.isDraft ? 'draft' : 'pending',
      paymentMethod: payload.paymentMethod,
      paymentCardId: payload.paymentCardId,
      paymentId: !payload.isDraft ? `PAY-DEMO-${Date.now()}` : undefined,
      paymentStatus: isPaid ? 'paid' : 'pending',
      paymentDate: isPaid ? now : undefined,
      pickup: payload.pickup,
      dropoff: payload.dropoff,
      dropoffs: payload.dropoffs,
      deliveryOption: payload.deliveryOption,
      recipient: payload.recipient,
      parcel: payload.parcel,
      cod: payload.cod,
      deliveryFee: fee,
      totalSellerCharge: fee,
      createdAt: now,
      updatedAt: now,
    };

    const existing = getAllOrders().filter((o) => o.id !== payload.draftOrderId);
    writeStoredDemoArray(DEMO_STORAGE_KEYS.orders, [newOrder, ...existing], stripLargeImages);
    return newOrder;
  },

  cancelOrder(bookingId: string, reason?: string): BookingOrder | null {
    const orders = getAllOrders();
    const targetKey = bookingId.trim().toLowerCase();
    const index = orders.findIndex(
      (o) => o.id.toLowerCase() === targetKey || o.trackingNumber.toLowerCase() === targetKey,
    );
    if (index === -1) return null;

    const current = orders[index];
    if (current.status === 'out_for_delivery' || current.status === 'delivered') {
      throw new Error('Cannot cancel an order that is already out for delivery or delivered.');
    }

    const updated: BookingOrder = {
      ...current,
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by seller',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: current.paymentStatus === 'paid' ? 'refunded' : current.paymentStatus,
    };

    const nextOrders = [...orders];
    nextOrders[index] = updated;
    writeStoredDemoArray(DEMO_STORAGE_KEYS.orders, nextOrders, stripLargeImages);
    return updated;
  },

  deleteOrder(bookingId: string): void {
    const targetKey = bookingId.trim().toLowerCase();
    writeStoredDemoArray(
      DEMO_STORAGE_KEYS.orders,
      getAllOrders().filter(
        (o) => o.id.toLowerCase() !== targetKey && o.trackingNumber.toLowerCase() !== targetKey,
      ),
      stripLargeImages,
    );
  },

  calculateFee(payload: {
    pickup: GeoCoordinates;
    dropoff: GeoCoordinates;
    additionalStopsCount?: number;
    deliveryOption?: DeliverySpeedOption;
  }): BookingFeeQuote {
    return calculateBookingFeeQuote({
      pickupCoords: payload.pickup,
      dropoffCoords: payload.dropoff,
      additionalStopsCount: payload.additionalStopsCount ?? 0,
      deliverySpeed: payload.deliveryOption ?? 'instant',
    });
  },

  resetAllDemoData(): void {
    clearBookingDraft();
    removeStoredDemoKey(DEMO_STORAGE_KEYS.orders);
    removeStoredDemoKey(DEMO_STORAGE_KEYS.locations);
    removeStoredDemoKey(DEMO_STORAGE_KEYS.cards);
    removeStoredDemoKey(DEMO_STORAGE_KEYS.userDrafts);
  },
};
