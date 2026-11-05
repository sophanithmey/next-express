import 'server-only';
import {
  BookingFeeQuote,
  BookingOrder,
  CreateBookingPayload,
  DashboardStatistics,
  GeoCoordinates,
  PickupLocation,
  RecipientRecord,
} from '@/features/booking/types/booking-types';

export const INITIAL_SAVED_LOCATIONS: PickupLocation[] = [
  {
    id: 'loc-1',
    name: 'Central Warehouse (Main)',
    address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
    coordinates: { lat: 11.5321, lng: 104.9123 },
    senderName: 'Central Boutique Warehouse',
    senderPhone: '012 888 999',
    isDefault: true,
  },
  {
    id: 'loc-2',
    name: 'BKK1 Retail Store',
    address: 'St 310, Sangkat Boeng Keng Kang I, Khan Boeng Keng Kang, Phnom Penh',
    coordinates: { lat: 11.5512, lng: 104.9256 },
    senderName: 'BKK1 Branch',
    senderPhone: '012 777 666',
    isDefault: false,
  },
  {
    id: 'loc-3',
    name: 'Tuol Kouk Hub',
    address: 'St 289, Sangkat Boeung Kak II, Khan Tuol Kouk, Phnom Penh',
    coordinates: { lat: 11.5789, lng: 104.8964 },
    senderName: 'TK Store Hub',
    senderPhone: '012 555 444',
    isDefault: false,
  },
];

export const INITIAL_RECIPIENTS: RecipientRecord[] = [
  {
    id: 'rec-1',
    name: 'Sokha Chan',
    phoneNumber: '012998877',
    lastUsedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastAddress: 'St 2004, Sangkat Kakab, Khan Por Senchey, Phnom Penh',
    lastCoordinates: { lat: 11.545, lng: 104.862 },
  },
  {
    id: 'rec-2',
    name: 'Dara Vong',
    phoneNumber: '098112233',
    lastUsedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastAddress: 'St 63, Sangkat Chaktomuk, Khan Daun Penh, Phnom Penh',
    lastCoordinates: { lat: 11.558, lng: 104.931 },
  },
  {
    id: 'rec-3',
    name: 'Bopha Pich',
    phoneNumber: '077445566',
    lastUsedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastAddress: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
    lastCoordinates: { lat: 11.564, lng: 104.881 },
  },
];

export const INITIAL_ORDERS: BookingOrder[] = [
  {
    id: 'ord-1001',
    trackingNumber: 'EXP-88239012',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-88239012',
    status: 'out_for_delivery',
    pickup: INITIAL_SAVED_LOCATIONS[0],
    dropoff: {
      address: 'St 2004, Sangkat Kakab, Khan Por Senchey, Phnom Penh',
      landmark: 'Near Northbridge International School',
      coordinates: { lat: 11.545, lng: 104.862 },
    },
    recipient: {
      name: 'Sokha Chan',
      phoneNumber: '012998877',
      notes: 'Call before delivery',
    },
    parcel: {
      description: 'Cosmetics & skincare set (3 items)',
      sellerOrderRef: 'FB-LIVE-2041',
      quantity: 1,
    },
    cod: {
      isCod: true,
      amount: 45.0,
    },
    deliveryFee: 1.95,
    totalSellerCharge: 1.95,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    deliverer: {
      name: 'Chenda K.',
      phone: '015 334 556',
      plateNumber: '1AB-9921',
    },
  },
  {
    id: 'ord-1002',
    trackingNumber: 'EXP-77192034',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-77192034',
    status: 'assigned',
    pickup: INITIAL_SAVED_LOCATIONS[0],
    dropoff: {
      address: 'St 63, Sangkat Chaktomuk, Khan Daun Penh, Phnom Penh',
      landmark: 'Behind Royal Palace',
      coordinates: { lat: 11.558, lng: 104.931 },
    },
    recipient: {
      name: 'Dara Vong',
      phoneNumber: '098112233',
    },
    parcel: {
      description: 'Linen casual shirt (Size L)',
      sellerOrderRef: 'STORE-8812',
      quantity: 1,
    },
    cod: {
      isCod: true,
      amount: 28.5,
    },
    deliveryFee: 1.6,
    totalSellerCharge: 1.6,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    deliverer: {
      name: 'Rithy S.',
      phone: '016 778 899',
    },
  },
  {
    id: 'ord-1003',
    trackingNumber: 'EXP-66281092',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-66281092',
    status: 'delivered',
    pickup: INITIAL_SAVED_LOCATIONS[1],
    dropoff: {
      address: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
      landmark: 'Next to Attwood Center',
      coordinates: { lat: 11.564, lng: 104.881 },
    },
    recipient: {
      name: 'Bopha Pich',
      phoneNumber: '077445566',
    },
    parcel: {
      description: 'Handmade leather tote bag',
      sellerOrderRef: 'TIKTOK-0994',
      quantity: 1,
    },
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryFee: 2.3,
    totalSellerCharge: 2.3,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1 + 7200000).toISOString(),
  },
  {
    id: 'ord-1004',
    trackingNumber: 'EXP-55392018',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-55392018',
    status: 'pending',
    pickup: INITIAL_SAVED_LOCATIONS[0],
    dropoff: {
      address: 'National Road 1, Sangkat Chbar Ampov I, Phnom Penh',
      coordinates: { lat: 11.531, lng: 104.945 },
    },
    recipient: {
      name: 'Veasna Sam',
      phoneNumber: '085332211',
    },
    parcel: {
      description: 'Wireless earbuds Pro',
      sellerOrderRef: 'ONLINE-5541',
      quantity: 1,
    },
    cod: {
      isCod: true,
      amount: 65.0,
    },
    deliveryFee: 1.75,
    totalSellerCharge: 1.75,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Helper: Haversine distance in km
export function calculateHaversineDistance(c1: GeoCoordinates, c2: GeoCoordinates): number {
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.5, Math.round(R * c * 10) / 10);
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
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  calculateFee(pickup: GeoCoordinates, dropoff: GeoCoordinates): BookingFeeQuote {
    const distanceKm = calculateHaversineDistance(pickup, dropoff);
    const baseFee = 1.25;
    const ratePerKm = 0.35;
    const distanceCharge = Math.max(0, distanceKm - 2) * ratePerKm;
    const totalDeliveryFee = Math.round((baseFee + distanceCharge) * 100) / 100;
    return { baseFee, distanceKm, totalDeliveryFee };
  }

  createBooking(payload: CreateBookingPayload): BookingOrder {
    const trackingNumber = `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const feeQuote =
      payload.feeQuote ||
      this.calculateFee(payload.pickup.coordinates, payload.dropoff.coordinates);

    const newOrder: BookingOrder = {
      id: `ord-${Date.now()}`,
      trackingNumber,
      trackingUrl: `https://tracking.express.wingbank.com/${trackingNumber}`,
      status: 'pending',
      pickup: payload.pickup,
      dropoff: payload.dropoff,
      recipient: payload.recipient,
      parcel: payload.parcel,
      cod: payload.cod,
      deliveryFee: feeQuote.totalDeliveryFee,
      totalSellerCharge: feeQuote.totalDeliveryFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];

    // Update recipient history
    const filteredRecipients = this.recipients.filter(
      (r) => r.phoneNumber.replace(/[^\d]/g, '') !== payload.recipient.phoneNumber.replace(/[^\d]/g, '')
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
    page?: number;
    limit?: number;
  }): { items: BookingOrder[]; total: number; totalPages: number; page: number; limit: number } {
    let filtered = [...this.orders];

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.trackingNumber.toLowerCase().includes(q) ||
          o.recipient.name.toLowerCase().includes(q) ||
          o.recipient.phoneNumber.includes(q) ||
          (o.parcel.sellerOrderRef && o.parcel.sellerOrderRef.toLowerCase().includes(q))
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
        (o) => o.id === id || o.trackingNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  getStatistics(): DashboardStatistics {
    const today = new Date().toISOString().slice(0, 10);
    let todayBookings = 0;
    let pendingPickup = 0;
    let inTransit = 0;
    let delivered = 0;
    let codCollection = 0;

    for (const order of this.orders) {
      if (order.createdAt.slice(0, 10) === today) {
        todayBookings += 1;
      }
      if (order.status === 'pending') pendingPickup += 1;
      if (order.status === 'assigned' || order.status === 'out_for_delivery') inTransit += 1;
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

// Global singleton to persist state in memory across development requests
const globalForStore = globalThis as unknown as { inMemoryStore?: InMemoryStore };
export const inMemoryStore = globalForStore.inMemoryStore || new InMemoryStore();
if (process.env.NODE_ENV !== 'production') {
  globalForStore.inMemoryStore = inMemoryStore;
}

