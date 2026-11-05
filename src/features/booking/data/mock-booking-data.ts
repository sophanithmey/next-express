import { PickupLocation, RecipientRecord, BookingFeeQuote, GeoCoordinates } from '../types/booking-types';

export const SAMPLE_PHNOM_PENH_LOCATIONS: (PickupLocation & { tag: string })[] = [
  {
    id: 'loc-1',
    name: 'Central Warehouse (Main)',
    address: 'St 271, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
    coordinates: { lat: 11.5321, lng: 104.9123 },
    senderName: 'Central Boutique Warehouse',
    senderPhone: '012 888 999',
    tag: 'Primary Hub (Demo)',
    isDefault: true,
  },
  {
    id: 'loc-2',
    name: 'BKK1 Retail Branch',
    address: 'St 310, Sangkat Boeng Keng Kang I, Khan Boeng Keng Kang, Phnom Penh',
    coordinates: { lat: 11.5512, lng: 104.9256 },
    senderName: 'BKK1 Branch Manager',
    senderPhone: '012 777 666',
    tag: 'City Center (Demo)',
  },
  {
    id: 'loc-3',
    name: 'Tuol Kouk Depot',
    address: 'St 289, Sangkat Boeung Kak II, Khan Tuol Kouk, Phnom Penh',
    coordinates: { lat: 11.5789, lng: 104.8964 },
    senderName: 'TK Store Hub',
    senderPhone: '012 555 444',
    tag: 'North Hub (Demo)',
  },
  {
    id: 'loc-4',
    name: 'Sen Sok Express Station',
    address: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
    coordinates: { lat: 11.564, lng: 104.881 },
    senderName: 'Sen Sok Logistics',
    senderPhone: '012 333 222',
    tag: 'Airport Zone (Demo)',
  },
];

export const SAMPLE_RECIPIENTS: RecipientRecord[] = [
  {
    id: 'rec-1',
    name: 'Sokha Chan',
    phoneNumber: '012 998 877',
    lastUsedAt: new Date().toISOString(),
    lastAddress: 'St 2004, Sangkat Kakab, Khan Por Senchey, Phnom Penh',
    lastCoordinates: { lat: 11.545, lng: 104.862 },
  },
  {
    id: 'rec-2',
    name: 'Dara Vong',
    phoneNumber: '098 112 233',
    lastUsedAt: new Date().toISOString(),
    lastAddress: 'St 63, Sangkat Chaktomuk, Khan Daun Penh, Phnom Penh',
    lastCoordinates: { lat: 11.558, lng: 104.931 },
  },
  {
    id: 'rec-3',
    name: 'Bopha Pich',
    phoneNumber: '077 445 566',
    lastUsedAt: new Date().toISOString(),
    lastAddress: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
    lastCoordinates: { lat: 11.564, lng: 104.881 },
  },
];

export function calculateMockFee(
  pickupCoords?: GeoCoordinates,
  dropoffCoords?: GeoCoordinates,
  additionalStopsCount: number = 0
): BookingFeeQuote {
  if (!pickupCoords || !dropoffCoords) {
    const extra = Math.max(0, additionalStopsCount) * 0.75;
    return { baseFee: 1.25, distanceKm: 3.5, totalDeliveryFee: Math.round((1.75 + extra) * 100) / 100 };
  }
  // Rough distance calculation in km
  const dx = (pickupCoords.lng - dropoffCoords.lng) * 111.32 * Math.cos((pickupCoords.lat * Math.PI) / 180);
  const dy = (pickupCoords.lat - dropoffCoords.lat) * 110.574;
  const distanceKm = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10);
  const baseFee = 1.25;
  const distanceCharge = Math.max(0, distanceKm - 2) * 0.25;
  const additionalStopCharge = Math.max(0, additionalStopsCount) * 0.75;
  const total = Math.round((baseFee + distanceCharge + additionalStopCharge) * 100) / 100;
  return { baseFee, distanceKm, totalDeliveryFee: total };
}

export function generateMockReference(): string {
  return `REF-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function generateMockTracking(): string {
  return `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;
}

