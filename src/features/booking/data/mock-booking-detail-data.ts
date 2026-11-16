import { BookingOrder } from '../types/booking-types';
import { createMockOrderDate, getTodayDateKey } from '../services/booking-date-filter';

/**
 * Realistic Mock/Demo Bookings for WingExpress Prototype
 * Includes various operational and payment statuses across Phnom Penh
 * Dynamically generated relative to baseDate so createdAt is always up-to-date every day.
 */
export function createMockBookingDetails(baseDate: Date = new Date()): Record<string, BookingOrder> {
  return {
  // 1. In Transit Booking (Live dispatch with assigned rider)
  'ord-1001': {
    id: 'ord-1001',
    trackingNumber: 'EXP-88239012',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-88239012',
    status: 'out_for_delivery',
    paymentStatus: 'paid',
    paymentMethod: 'KHQR (Bakong)',
    paymentDate: createMockOrderDate('today', '08:35 AM', baseDate),
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
      riderNote: 'Collect at loading dock gate #2 behind showroom',
    },
    dropoff: {
      address: 'St 2004, Sangkat Kakab, Khan Por Senchey, Phnom Penh',
      landmark: 'Near Northbridge International School gate',
      coordinates: { lat: 11.545, lng: 104.862 },
    },
    recipient: {
      name: 'Sokha Chan',
      phoneNumber: '012 998 877',
      notes: 'Call 5 minutes prior. Leave with house security if unavailable.',
    },
    parcel: {
      description: 'Cosmetics & skincare retail box (3 items)',
      sellerOrderRef: 'LIVE-0914',
      quantity: 1,
      instructions: 'Handle with care — fragile glass containers',
    },
    cod: {
      isCod: true,
      amount: 45.0,
    },
    deliveryFee: 1.95,
    totalSellerCharge: 1.95,
    createdAt: createMockOrderDate('today', '08:30 AM', baseDate),
    updatedAt: createMockOrderDate('today', '09:20 AM', baseDate),
    deliverer: {
      name: 'Chenda K.',
      phone: '015 334 556',
      plateNumber: '1AB-9921',
    },
    timeline: [
      {
        status: 'created',
        title: 'Booking Created',
        timestamp: '08:30 AM',
        description: 'Seller registered express delivery request via web portal',
        completed: true,
      },
      {
        status: 'paid',
        title: 'Payment Confirmed',
        timestamp: '08:35 AM',
        description: 'KHQR payment of $1.95 verified via WingBank',
        completed: true,
      },
      {
        status: 'assigned',
        title: 'Courier Assigned',
        timestamp: '08:45 AM',
        description: 'Courier Chenda K. accepted parcel collection job',
        completed: true,
      },
      {
        status: 'picked_up',
        title: 'Parcel Picked Up',
        timestamp: '09:05 AM',
        description: 'Collected from Central Warehouse loading dock',
        completed: true,
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery (In Transit)',
        timestamp: '09:20 AM',
        description: 'Courier en route to recipient on St 2004',
        completed: true,
        current: true,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        timestamp: 'Est. 10:15 AM',
        description: 'Pending buyer confirmation and COD collection',
        completed: false,
      },
    ],
  },

  // 2. Confirmed Booking (Assigned rider awaiting pickup)
  'ord-1002': {
    id: 'ord-1002',
    trackingNumber: 'EXP-77192034',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-77192034',
    status: 'assigned',
    paymentStatus: 'paid',
    paymentMethod: 'Wing Wallet',
    paymentDate: createMockOrderDate('today', '07:15 AM', baseDate),
    pickup: {
      id: 'loc-2',
      name: 'BKK1 Retail Store',
      address: 'St 310, Sangkat Boeng Keng Kang I, Khan Boeng Keng Kang, Phnom Penh',
      coordinates: { lat: 11.5512, lng: 104.9256 },
      senderName: 'BKK1 Branch Manager',
      senderPhone: '012 777 666',
    },
    dropoff: {
      address: 'St 63, Sangkat Chaktomuk, Khan Daun Penh, Phnom Penh',
      landmark: 'Behind Royal Palace museum park',
      coordinates: { lat: 11.558, lng: 104.931 },
    },
    recipient: {
      name: 'Dara Vong',
      phoneNumber: '098 112 233',
      notes: 'Drop off at reception desk on 2nd floor',
    },
    parcel: {
      description: 'Linen casual shirt & accessories (Size L)',
      sellerOrderRef: 'STORE-8812',
      quantity: 1,
    },
    cod: {
      isCod: true,
      amount: 28.5,
    },
    deliveryFee: 1.6,
    totalSellerCharge: 1.6,
    createdAt: createMockOrderDate('today', '07:10 AM', baseDate),
    updatedAt: createMockOrderDate('today', '07:25 AM', baseDate),
    deliverer: {
      name: 'Rithy S.',
      phone: '016 778 899',
      plateNumber: '1BC-4482',
    },
    timeline: [
      {
        status: 'created',
        title: 'Booking Created',
        timestamp: '07:10 AM',
        description: 'Booking created by seller for BKK1 branch',
        completed: true,
      },
      {
        status: 'paid',
        title: 'Payment Confirmed',
        timestamp: '07:15 AM',
        description: 'Paid via Wing Bank merchant wallet',
        completed: true,
      },
      {
        status: 'assigned',
        title: 'Courier Assigned',
        timestamp: '07:25 AM',
        description: 'Rider Rithy S. is arriving at store in 8 mins',
        completed: true,
        current: true,
      },
      {
        status: 'picked_up',
        title: 'Parcel Picked Up',
        timestamp: 'Pending',
        description: 'Awaiting package handover',
        completed: false,
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        timestamp: 'Pending',
        description: 'Transit to Daun Penh destination',
        completed: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        timestamp: 'Pending',
        description: 'Receipt by buyer',
        completed: false,
      },
    ],
  },

  // 3. Delivered Booking (Completed delivery with collected COD)
  'ord-1003': {
    id: 'ord-1003',
    trackingNumber: 'EXP-66281092',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-66281092',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Cash on Pickup',
    paymentDate: createMockOrderDate('yesterday', '02:40 PM', baseDate),
    pickup: {
      id: 'loc-1',
      name: 'Tuol Kouk Store Hub',
      address: 'St 289, Sangkat Boeung Kak II, Khan Tuol Kouk, Phnom Penh',
      coordinates: { lat: 11.5789, lng: 104.8964 },
      senderName: 'TK Hub Dispatch',
      senderPhone: '012 555 444',
    },
    dropoff: {
      address: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
      landmark: 'Next to Attwood Business Center',
      coordinates: { lat: 11.564, lng: 104.881 },
    },
    recipient: {
      name: 'Bopha Pich',
      phoneNumber: '077 445 566',
    },
    parcel: {
      description: 'Handmade leather tote bag with gift wrap',
      sellerOrderRef: 'TIKTOK-0994',
      quantity: 1,
    },
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryFee: 2.3,
    totalSellerCharge: 2.3,
    createdAt: createMockOrderDate(-1, '01:15 PM'),
    updatedAt: createMockOrderDate(-1, '03:20 PM'),
    deliverer: {
      name: 'Vannak M.',
      phone: '097 555 112',
      plateNumber: '1X-1192',
    },
    timeline: [
      {
        status: 'created',
        title: 'Booking Created',
        timestamp: '01:15 PM',
        description: 'Order registered from TikTok Shop sync',
        completed: true,
      },
      {
        status: 'paid',
        title: 'Cash Payment Recorded',
        timestamp: '01:30 PM',
        description: 'Settled on pickup with courier',
        completed: true,
      },
      {
        status: 'assigned',
        title: 'Courier Assigned',
        timestamp: '01:40 PM',
        description: 'Vannak M. assigned for Sen Sok zone',
        completed: true,
      },
      {
        status: 'picked_up',
        title: 'Parcel Picked Up',
        timestamp: '02:10 PM',
        description: 'Package scanned and verified',
        completed: true,
      },
      {
        status: 'out_for_delivery',
        title: 'In Transit',
        timestamp: '02:35 PM',
        description: 'Dispatched along Russian Blvd',
        completed: true,
      },
      {
        status: 'delivered',
        title: 'Delivered Successfully',
        timestamp: '03:20 PM',
        description: 'Handed directly to recipient Bopha Pich. Signature captured.',
        completed: true,
        current: true,
      },
    ],
  },

  // 4. Pending Payment Booking (Allows "Continue Payment" and "Cancel Booking")
  'ord-1004': {
    id: 'ord-1004',
    trackingNumber: 'EXP-55392018',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-55392018',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'KHQR (Unpaid)',
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
    },
    dropoff: {
      address: 'National Road 1, Sangkat Chbar Ampov I, Khan Chbar Ampov, Phnom Penh',
      coordinates: { lat: 11.531, lng: 104.945 },
    },
    recipient: {
      name: 'Veasna Sam',
      phoneNumber: '085 332 211',
      notes: 'Ring doorbell at front black gate',
    },
    parcel: {
      description: 'Wireless earbuds Pro (sealed retail packaging)',
      sellerOrderRef: 'ONLINE-5541',
      quantity: 1,
    },
    cod: {
      isCod: true,
      amount: 65.0,
    },
    deliveryFee: 1.75,
    totalSellerCharge: 1.75,
    createdAt: createMockOrderDate('today', '09:10 AM', baseDate),
    updatedAt: createMockOrderDate('today', '09:10 AM', baseDate),
    timeline: [
      {
        status: 'created',
        title: 'Booking Draft Created',
        timestamp: '09:10 AM',
        description: 'Awaiting seller checkout authorization and payment confirmation',
        completed: true,
        current: true,
      },
      {
        status: 'paid',
        title: 'Payment Confirmation',
        timestamp: 'Pending',
        description: 'Delivery payment not yet finalized',
        completed: false,
      },
      {
        status: 'assigned',
        title: 'Courier Dispatch',
        timestamp: 'Pending',
        description: 'Courier dispatch initiates upon payment authorization',
        completed: false,
      },
    ],
  },

  // 5. Cancelled Booking (Simulated cancellation with reason & refund)
  'ord-1005': {
    id: 'ord-1005',
    trackingNumber: 'EXP-44109823',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-44109823',
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'KHQR (Refunded)',
    paymentDate: createMockOrderDate('last_month', '10:15 AM', baseDate),
    cancellationReason: 'Cancelled by seller — Customer requested order modification',
    cancelledAt: createMockOrderDate('last_month', '10:45 AM', baseDate),
    pickup: {
      id: 'loc-2',
      name: 'BKK1 Retail Store',
      address: 'St 310, Sangkat Boeng Keng Kang I, Khan Boeng Keng Kang, Phnom Penh',
      coordinates: { lat: 11.5512, lng: 104.9256 },
      senderName: 'BKK1 Branch',
      senderPhone: '012 777 666',
    },
    dropoff: {
      address: 'St 598, Sangkat Phnom Penh Thmei, Khan Sen Sok, Phnom Penh',
      coordinates: { lat: 11.581, lng: 104.879 },
    },
    recipient: {
      name: 'Vicheka Long',
      phoneNumber: '016 554 433',
    },
    parcel: {
      description: 'Ceramic coffee drip set & filters',
      sellerOrderRef: 'CANCEL-9901',
      quantity: 1,
    },
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryFee: 1.85,
    totalSellerCharge: 1.85,
    createdAt: createMockOrderDate('last_month', '10:12 AM', baseDate),
    updatedAt: createMockOrderDate('last_month', '10:45 AM', baseDate),
    timeline: [
      {
        status: 'created',
        title: 'Booking Created',
        timestamp: '10:12 AM',
        description: 'Booking initiated by seller',
        completed: true,
      },
      {
        status: 'paid',
        title: 'Payment Confirmed',
        timestamp: '10:15 AM',
        description: 'Payment of $1.85 processed',
        completed: true,
      },
      {
        status: 'cancelled',
        title: 'Booking Cancelled',
        timestamp: '10:45 AM',
        description: 'Cancelled before courier collection. Full refund issued to seller account.',
        completed: true,
        current: true,
      },
    ],
  },

  // 6. Pending Order A (Searching for driver)
  'ord-1006': {
    id: 'ord-1006',
    trackingNumber: 'EXP-91024511',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-91024511',
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'KHQR (Bakong)',
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
    },
    dropoff: {
      address: 'St 310, Sangkat BKK3, Khan Boeung Keng Kang, Phnom Penh',
      coordinates: { lat: 11.542, lng: 104.921 },
    },
    recipient: {
      name: 'Kosal Heng',
      phoneNumber: '011 234 567',
    },
    parcel: {
      description: 'Korean skincare gift box',
      sellerOrderRef: 'LIVE-1082',
      quantity: 1,
    },
    deliveryOption: 'instant',
    cod: {
      isCod: true,
      amount: 32.5,
    },
    deliveryFee: 1.75,
    totalSellerCharge: 1.75,
    createdAt: createMockOrderDate('today', '09:40 AM', baseDate),
    updatedAt: createMockOrderDate('today', '09:40 AM', baseDate),
  },

  // 7. Pending Order B (Searching for driver)
  'ord-1007': {
    id: 'ord-1007',
    trackingNumber: 'EXP-91024512',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-91024512',
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'Wing Wallet',
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
    },
    dropoff: {
      address: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
      coordinates: { lat: 11.561, lng: 104.881 },
    },
    recipient: {
      name: 'Chanthou Seng',
      phoneNumber: '015 678 901',
    },
    parcel: {
      description: 'Women fashion handbag & wallet',
      sellerOrderRef: 'LIVE-1085',
      quantity: 2,
    },
    deliveryOption: 'instant',
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryFee: 2.1,
    totalSellerCharge: 2.1,
    createdAt: createMockOrderDate('yesterday', '10:05 AM', baseDate),
    updatedAt: createMockOrderDate('yesterday', '10:05 AM', baseDate),
  },

  // 8. Pending Order C (Scheduled pickup)
  'ord-1008': {
    id: 'ord-1008',
    trackingNumber: 'EXP-91024513',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-91024513',
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'KHQR (Bakong)',
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
    },
    dropoff: {
      address: 'St 598, Sangkat Phnom Penh Thmei, Khan Sen Sok, Phnom Penh',
      coordinates: { lat: 11.579, lng: 104.892 },
    },
    recipient: {
      name: 'Sopheak Men',
      phoneNumber: '089 345 678',
    },
    parcel: {
      description: 'Baby apparel & cotton wear',
      sellerOrderRef: 'LIVE-1090',
      quantity: 3,
    },
    deliveryOption: 'scheduled',
    cod: {
      isCod: true,
      amount: 55.0,
    },
    deliveryFee: 1.25,
    totalSellerCharge: 1.25,
    createdAt: createMockOrderDate('this_month', '10:15 AM', baseDate),
    updatedAt: createMockOrderDate('this_month', '10:15 AM', baseDate),
  },

  // 9. Accepted Order A (Driver assigned & heading to pickup)
  'ord-1009': {
    id: 'ord-1009',
    trackingNumber: 'EXP-82194014',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-82194014',
    status: 'assigned',
    paymentStatus: 'paid',
    paymentMethod: 'KHQR (Bakong)',
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
    },
    dropoff: {
      address: 'St 214, Sangkat Boeung Prolit, Khan 7 Makara, Phnom Penh',
      coordinates: { lat: 11.556, lng: 104.918 },
    },
    recipient: {
      name: 'Dany Kim',
      phoneNumber: '098 765 432',
    },
    deliverer: {
      name: 'Rithy Seng',
      phone: '097 555 1234',
    },
    parcel: {
      description: 'Smartwatch & accessories',
      sellerOrderRef: 'LIVE-1070',
      quantity: 1,
    },
    deliveryOption: 'instant',
    cod: {
      isCod: true,
      amount: 78.0,
    },
    deliveryFee: 1.75,
    totalSellerCharge: 1.75,
    createdAt: createMockOrderDate('today', '09:15 AM', baseDate),
    updatedAt: createMockOrderDate('today', '09:25 AM', baseDate),
  },

  // 10. Accepted Order B (Driver heading to pickup)
  'ord-1010': {
    id: 'ord-1010',
    trackingNumber: 'EXP-82194015',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-82194015',
    status: 'assigned',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Visa)',
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
    },
    dropoff: {
      address: 'St 371 (Solar), Sangkat Chak Angre Leu, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.521, lng: 104.929 },
    },
    recipient: {
      name: 'Piseth Ouk',
      phoneNumber: '070 889 900',
    },
    deliverer: {
      name: 'Vannak Moeun',
      phone: '088 666 4321',
    },
    parcel: {
      description: 'Sneakers sports shoes (size 42)',
      sellerOrderRef: 'LIVE-1075',
      quantity: 1,
    },
    deliveryOption: 'instant',
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryFee: 1.95,
    totalSellerCharge: 1.95,
    createdAt: createMockOrderDate('yesterday', '09:25 AM', baseDate),
    updatedAt: createMockOrderDate('yesterday', '09:35 AM', baseDate),
  },

  // 11. Accepted Order C (Driver assigned)
  'ord-1011': {
    id: 'ord-1011',
    trackingNumber: 'EXP-82194016',
    trackingUrl: 'https://tracking.express.wingbank.com/EXP-82194016',
    status: 'assigned',
    paymentStatus: 'paid',
    paymentMethod: 'Wing Wallet',
    pickup: {
      id: 'loc-1',
      name: 'Central Warehouse (Main)',
      address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
      senderName: 'Central Boutique Warehouse',
      senderPhone: '012 888 999',
    },
    dropoff: {
      address: 'St 63, Sangkat Tonle Bassac, Khan Chamkarmon, Phnom Penh',
      coordinates: { lat: 11.549, lng: 104.931 },
    },
    recipient: {
      name: 'Theary Soun',
      phoneNumber: '016 443 322',
    },
    deliverer: {
      name: 'Chan Tith',
      phone: '012 334 455',
    },
    parcel: {
      description: 'Natural dried fruits & honey jar',
      sellerOrderRef: 'LIVE-1078',
      quantity: 2,
    },
    deliveryOption: 'scheduled',
    cod: {
      isCod: true,
      amount: 24.0,
    },
    deliveryFee: 1.25,
    totalSellerCharge: 1.25,
    createdAt: createMockOrderDate('last_month', '09:30 AM', baseDate),
    updatedAt: createMockOrderDate('last_month', '09:40 AM', baseDate),
  },
};
}

let cachedDateKey = '';
let cachedMockDetails: Record<string, BookingOrder> | null = null;

function getDailyCachedMockDetails(): Record<string, BookingOrder> {
  const currentKey = getTodayDateKey();
  if (!cachedMockDetails || cachedDateKey !== currentKey) {
    cachedDateKey = currentKey;
    cachedMockDetails = createMockBookingDetails(new Date());
  }
  return cachedMockDetails;
}

/**
 * Proxy that always serves fresh, up-to-date mock details for the current day.
 */
export const MOCK_BOOKING_DETAILS: Record<string, BookingOrder> = new Proxy(
  {},
  {
    get(_target, prop: string | symbol) {
      const details = getDailyCachedMockDetails();
      return Reflect.get(details, prop);
    },
    ownKeys() {
      const details = getDailyCachedMockDetails();
      return Reflect.ownKeys(details);
    },
    getOwnPropertyDescriptor(_target, prop) {
      const details = getDailyCachedMockDetails();
      return Reflect.getOwnPropertyDescriptor(details, prop);
    },
    has(_target, prop) {
      const details = getDailyCachedMockDetails();
      return Reflect.has(details, prop);
    },
  },
);

/**
 * Synchronizes orders by rolling forward mock demo records to current date
 * while preserving any user-created orders.
 */
export function syncOrdersToCurrentDate(
  orders: BookingOrder[],
  baseDate: Date = new Date(),
): BookingOrder[] {
  const latestMockDetails = createMockBookingDetails(baseDate);
  const updated = orders.map((order) => {
    const mock = latestMockDetails[order.id];
    if (mock) {
      return {
        ...order,
        createdAt: mock.createdAt,
        updatedAt: mock.updatedAt,
        paymentDate: mock.paymentDate ?? order.paymentDate,
        cancelledAt: mock.cancelledAt ?? order.cancelledAt,
      };
    }
    return order;
  });

  const existingIds = new Set(updated.map((o) => o.id));
  const missingDefaults = Object.values(latestMockDetails).filter((o) => !existingIds.has(o.id));
  return [...updated, ...missingDefaults];
}

export function getMockBookingById(id: string): BookingOrder | null {
  const details = getDailyCachedMockDetails();
  return details[id] || null;
}

