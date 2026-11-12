import 'server-only';
import {
  BookingFeeQuote,
  BookingOrder,
  CreateBookingPayload,
  DashboardStatistics,
  DeliverySpeedOption,
  GeoCoordinates,
  PickupLocation,
  RecipientRecord,
} from '@/features/booking/types/booking-types';
import {
  calculateBookingFeeQuote,
  calculateHaversineDistanceKm,
} from '@/features/booking/services/pricing-service';
import {
  INITIAL_ORDERS,
  INITIAL_RECIPIENTS,
  INITIAL_SAVED_LOCATIONS,
} from './mock-booking-seed';

export { INITIAL_SAVED_LOCATIONS, INITIAL_RECIPIENTS, INITIAL_ORDERS };

export function calculateHaversineDistance(
  c1: GeoCoordinates,
  c2: GeoCoordinates,
): number {
  return calculateHaversineDistanceKm(c1, c2);
}

class InMemoryStore {
  private locations: PickupLocation[] = [...INITIAL_SAVED_LOCATIONS];
  private recipients: RecipientRecord[] = [...INITIAL_RECIPIENTS];
  private orders: BookingOrder[] = [...INITIAL_ORDERS];

  getLocations(): PickupLocation[] {
    return this.locations;
  }

  addLocation(loc: PickupLocation): PickupLocation {
    const newLocation: PickupLocation = {
      ...loc,
      id: loc.id || `loc-${Date.now()}`,
    };
    if (newLocation.isDefault) {
      this.locations = this.locations.map((l) => ({ ...l, isDefault: false }));
    }
    this.locations = [newLocation, ...this.locations];
    return newLocation;
  }

  getRecipients(searchQuery?: string): RecipientRecord[] {
    if (!searchQuery?.trim()) return this.recipients;
    const q = searchQuery.toLowerCase().replace(/[^\d\w]/g, '');
    return this.recipients.filter(
      (r) =>
        r.phoneNumber.replace(/[^\d]/g, '').includes(q) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  calculateFee(
    pickup: GeoCoordinates,
    dropoff: GeoCoordinates,
    options?: {
      additionalStopsCount?: number;
      deliveryOption?: DeliverySpeedOption;
    },
  ): BookingFeeQuote {
    if (
      options?.deliveryOption ||
      typeof options?.additionalStopsCount === 'number'
    ) {
      return calculateBookingFeeQuote({
        pickupCoords: pickup,
        dropoffCoords: dropoff,
        additionalStopsCount: options.additionalStopsCount ?? 0,
        deliverySpeed: options.deliveryOption ?? 'instant',
      });
    }

    const distanceKm = calculateHaversineDistance(pickup, dropoff);
    const baseFee = 1.25;
    const ratePerKm = 0.35;
    const distanceCharge = Math.max(0, distanceKm - 2) * ratePerKm;
    const totalDeliveryFee = Math.round((baseFee + distanceCharge) * 100) / 100;
    return { baseFee, distanceKm, totalDeliveryFee };
  }

  createBooking(payload: CreateBookingPayload): BookingOrder {
    const trackingNumber =
      payload.trackingNumber ||
      `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const additionalStopsCount = Math.max(0, (payload.dropoffs?.length || 1) - 1);
    const feeQuote =
      payload.feeQuote ||
      this.calculateFee(
        payload.pickup.coordinates,
        payload.dropoff.coordinates,
        {
          additionalStopsCount,
          deliveryOption: payload.deliveryOption || 'instant',
        },
      );

    const newOrder: BookingOrder = {
      id: `ord-${Date.now()}`,
      trackingNumber,
      trackingUrl: `https://tracking.express.wingbank.com/${trackingNumber}`,
      status: payload.isDraft ? 'draft' : 'pending',
      paymentMethod: payload.paymentMethod,
      paymentStatus:
        payload.paymentMethod && payload.paymentMethod !== 'cop'
          ? 'paid'
          : 'pending',
      pickup: payload.pickup,
      dropoff: payload.dropoff,
      dropoffs: payload.dropoffs,
      deliveryOption: payload.deliveryOption,
      recipient: payload.recipient,
      parcel: payload.parcel,
      cod: payload.cod,
      deliveryFee: feeQuote.totalDeliveryFee,
      totalSellerCharge: feeQuote.totalDeliveryFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];
    const cleanTargetPhone = payload.recipient.phoneNumber.replace(/[^\d]/g, '');
    const filteredRecipients = this.recipients.filter(
      (r) => r.phoneNumber.replace(/[^\d]/g, '') !== cleanTargetPhone,
    );
    this.recipients = [
      {
        id: `rec-${Date.now()}`,
        name: payload.recipient.name,
        phoneNumber: payload.recipient.phoneNumber,
        lastUsedAt: new Date().toISOString(),
        lastAddress: payload.dropoff.address,
        lastCoordinates: payload.dropoff.coordinates,
      },
      ...filteredRecipients,
    ].slice(0, 50);

    return newOrder;
  }

  getOrders(params?: {
    search?: string;
    status?: string;
    statuses?: string[];
    page?: number;
    limit?: number;
  }) {
    let filtered = [...this.orders];

    if (params?.statuses && params.statuses.length > 0) {
      const allowed = new Set(params.statuses);
      filtered = filtered.filter((o) => allowed.has(o.status));
    } else if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.trackingNumber.toLowerCase().includes(q) ||
          o.recipient.name.toLowerCase().includes(q) ||
          o.recipient.phoneNumber.includes(q) ||
          (o.parcel.sellerOrderRef &&
            o.parcel.sellerOrderRef.toLowerCase().includes(q)),
      );
    }

    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const items = filtered.slice((page - 1) * limit, page * limit);
    return { items, total, totalPages, page, limit };
  }

  getOrderById(id: string): BookingOrder | null {
    return (
      this.orders.find(
        (o) =>
          o.id === id || o.trackingNumber.toLowerCase() === id.toLowerCase(),
      ) || null
    );
  }

  cancelOrder(id: string, reason?: string): BookingOrder | null {
    const order = this.getOrderById(id);
    if (!order) return null;
    if (order.status === 'out_for_delivery' || order.status === 'delivered') {
      return null;
    }
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by seller';
    order.cancelledAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    return order;
  }

  getStatistics(): DashboardStatistics {
    const today = new Date().toISOString().slice(0, 10);
    let todayBookings = 0;
    let pendingPickup = 0;
    let inTransit = 0;
    let delivered = 0;
    let codCollection = 0;

    for (const order of this.orders) {
      if (order.createdAt.slice(0, 10) === today) todayBookings += 1;
      if (order.status === 'pending') pendingPickup += 1;
      if (order.status === 'assigned' || order.status === 'out_for_delivery')
        inTransit += 1;
      if (order.status === 'delivered') delivered += 1;
      if (order.cod.isCod && order.status !== 'cancelled') {
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
}

const globalForStore = globalThis as unknown as {
  inMemoryStore?: InMemoryStore;
};
export const inMemoryStore =
  globalForStore.inMemoryStore || new InMemoryStore();
if (process.env.NODE_ENV !== 'production') {
  globalForStore.inMemoryStore = inMemoryStore;
}

