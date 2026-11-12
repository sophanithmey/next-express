import {
  PickupLocation,
  RecipientRecord,
} from '../types/booking-types';
import {
  PaymentCardItem,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';

export const DEMO_SAVED_LOCATIONS: PickupLocation[] = [
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

const DAY_MS = 86_400_000;

export function createDemoRecipients(nowMs = Date.now()): RecipientRecord[] {
  return [
    {
      id: 'rec-1',
      name: 'Sokha Chan',
      phoneNumber: '012998877',
      lastUsedAt: new Date(nowMs - DAY_MS * 2).toISOString(),
      lastAddress: 'St 2004, Sangkat Kakab, Khan Por Senchey, Phnom Penh',
      lastCoordinates: { lat: 11.545, lng: 104.862 },
    },
    {
      id: 'rec-2',
      name: 'Dara Vong',
      phoneNumber: '098112233',
      lastUsedAt: new Date(nowMs - DAY_MS * 5).toISOString(),
      lastAddress: 'St 63, Sangkat Chaktomuk, Khan Daun Penh, Phnom Penh',
      lastCoordinates: { lat: 11.558, lng: 104.931 },
    },
    {
      id: 'rec-3',
      name: 'Bopha Pich',
      phoneNumber: '077445566',
      lastUsedAt: new Date(nowMs - DAY_MS * 10).toISOString(),
      lastAddress: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
      lastCoordinates: { lat: 11.564, lng: 104.881 },
    },
  ];
}

export const DEMO_PAYMENT_OPTIONS: PaymentOptionItem[] = [
  {
    id: 'khqr',
    providerCode: 'khqr',
    title: 'Wing Bank KHQR',
    subtitle: 'Scan with any Bakong member banking application',
    subtitleImages: [],
    isDefault: true,
    isAvailable: true,
  },
  {
    id: 'wing_point',
    providerCode: 'wing_point',
    title: 'WingPoints',
    subtitle: 'Redeem Wing reward points (4,000 Pts = $1.00 USD)',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
  {
    id: 'wing_pay',
    providerCode: 'wing_pay',
    title: 'WingPay Wallet',
    subtitle: 'Instant settlement from your linked Wing account',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
  {
    id: 'cash_on_delivery',
    providerCode: 'cash_on_delivery',
    title: 'Cash on Pickup',
    subtitle: 'Pay delivery fee directly to the courier when package is picked up',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
  {
    id: 'card',
    providerCode: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, or UnionPay online payment',
    subtitleImages: [],
    isDefault: false,
    isAvailable: true,
  },
];

export const DEMO_PAYMENT_CARDS: PaymentCardItem[] = [
  {
    id: 'PMC-MOCK-0001',
    maskedCard: '4111 •••• •••• 4242',
    isDefault: true,
    cardScheme: 'VISA',
    issuer: 'Wing Bank Visa',
  },
];

