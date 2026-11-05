import { GeoCoordinates, PickupLocation } from '../types/booking-types';

export interface PhnomPenhZone {
  id: string;
  name: string;
  district: string;
  address: string;
  coordinates: GeoCoordinates;
  tag: string;
  category: 'commercial' | 'mall' | 'market' | 'hub' | 'residential';
}

export const PHNOM_PENH_ZONES: PhnomPenhZone[] = [
  // Commercial Hubs & CBD
  {
    id: 'zone-bkk1',
    name: 'Boeung Keng Kang 1 (BKK1)',
    district: 'Khan Boeng Keng Kang',
    address: 'St 310 / St 51, Sangkat Boeng Keng Kang I, Khan Boeng Keng Kang, Phnom Penh',
    coordinates: { lat: 11.5512, lng: 104.9256 },
    tag: 'CBD / Prime',
    category: 'commercial',
  },
  {
    id: 'zone-tk-avenue',
    name: 'TK Avenue / Toul Kouk',
    district: 'Khan Tuol Kouk',
    address: 'St 289, Sangkat Boeung Kak II, Khan Tuol Kouk, Phnom Penh',
    coordinates: { lat: 11.5835, lng: 104.899 },
    tag: 'North Commercial',
    category: 'commercial',
  },
  {
    id: 'zone-riverside',
    name: 'Riverside / Sisowath Quay',
    district: 'Khan Daun Penh',
    address: 'Preah Sisowath Quay, Sangkat Chey Chumneah, Khan Daun Penh, Phnom Penh',
    coordinates: { lat: 11.5695, lng: 104.932 },
    tag: 'Riverfront & Tourism',
    category: 'commercial',
  },
  {
    id: 'zone-olympia',
    name: 'Olympia City / Bak Touk',
    district: 'Khan 7 Makara',
    address: 'Monireth Blvd, Sangkat Veal Vong, Khan 7 Makara, Phnom Penh',
    coordinates: { lat: 11.562, lng: 104.912 },
    tag: 'City Central',
    category: 'commercial',
  },
  {
    id: 'zone-vattanac',
    name: 'Vattanac Capital / Central Station',
    district: 'Khan Daun Penh',
    address: 'Preah Monivong Blvd, Sangkat Srah Chak, Khan Daun Penh, Phnom Penh',
    coordinates: { lat: 11.5728, lng: 104.9192 },
    tag: 'Financial District',
    category: 'commercial',
  },

  // Malls & Retail Hubs
  {
    id: 'zone-aeon-sen-sok',
    name: 'AEON Mall 2 (Sen Sok)',
    district: 'Khan Sen Sok',
    address: 'St 1003, Sangkat Phnom Penh Thmey, Khan Sen Sok, Phnom Penh',
    coordinates: { lat: 11.5977, lng: 104.8828 },
    tag: 'Mega Mall',
    category: 'mall',
  },
  {
    id: 'zone-aeon-1',
    name: 'AEON Mall 1 (Tonle Bassac)',
    district: 'Khan Chamkarmon',
    address: 'Samdach Sothearos Blvd, Sangkat Tonle Bassac, Khan Chamkarmon, Phnom Penh',
    coordinates: { lat: 11.5485, lng: 104.9365 },
    tag: 'Downtown Mall',
    category: 'mall',
  },
  {
    id: 'zone-aeon-3',
    name: 'AEON Mall 3 (Meanchey)',
    district: 'Khan Mean Chey',
    address: 'Hun Sen Blvd, Sangkat Chak Angre Kraom, Khan Mean Chey, Phnom Penh',
    coordinates: { lat: 11.498, lng: 104.931 },
    tag: 'South Mall',
    category: 'mall',
  },

  // Traditional Markets & Trading
  {
    id: 'zone-russian-market',
    name: 'Russian Market (Phsar Toul Tom Poung)',
    district: 'Khan Chamkarmon',
    address: 'St 163 / St 440, Sangkat Toul Tom Poung I, Khan Chamkarmon, Phnom Penh',
    coordinates: { lat: 11.5406, lng: 104.9149 },
    tag: 'Retail & Fashion',
    category: 'market',
  },
  {
    id: 'zone-central-market',
    name: 'Central Market (Phsar Thmey)',
    district: 'Khan Daun Penh',
    address: 'St 128, Sangkat Phsar Thmey I, Khan Daun Penh, Phnom Penh',
    coordinates: { lat: 11.5696, lng: 104.9213 },
    tag: 'Wholesale & Retail',
    category: 'market',
  },
  {
    id: 'zone-orussey',
    name: 'Orussey Market',
    district: 'Khan 7 Makara',
    address: 'St 182, Sangkat Orussey I, Khan 7 Makara, Phnom Penh',
    coordinates: { lat: 11.5645, lng: 104.9175 },
    tag: 'Merchant Hub',
    category: 'market',
  },

  // Logistics & Warehousing Hubs
  {
    id: 'zone-st271',
    name: 'St 271 / Mean Chey Depot',
    district: 'Khan Mean Chey',
    address: 'St 271, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
    coordinates: { lat: 11.5321, lng: 104.9123 },
    tag: 'Express Warehouse Hub',
    category: 'hub',
  },
  {
    id: 'zone-teuk-thla',
    name: 'Teuk Thla / Russian Blvd Station',
    district: 'Khan Sen Sok',
    address: 'Russian Blvd, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh',
    coordinates: { lat: 11.564, lng: 104.881 },
    tag: 'Logistics Station',
    category: 'hub',
  },
  {
    id: 'zone-airport',
    name: 'Phnom Penh Int Airport / St 2004',
    district: 'Khan Por Senchey',
    address: 'St 2004, Sangkat Kakab I, Khan Por Senchey, Phnom Penh',
    coordinates: { lat: 11.5466, lng: 104.8441 },
    tag: 'Airport Gateway',
    category: 'hub',
  },

  // Residential & New Towns (Borey)
  {
    id: 'zone-peng-huoth',
    name: 'Grand Star Platinum (Peng Huoth 1)',
    district: 'Khan Chbar Ampov',
    address: 'National Road 1, Sangkat Nirouth, Khan Chbar Ampov, Phnom Penh',
    coordinates: { lat: 11.528, lng: 104.965 },
    tag: 'Borey Community',
    category: 'residential',
  },
  {
    id: 'zone-chroy-changvar',
    name: 'Chroy Changvar / OCIC City',
    district: 'Khan Chroy Changvar',
    address: 'National Road 6A, Sangkat Chroy Changvar, Khan Chroy Changvar, Phnom Penh',
    coordinates: { lat: 11.585, lng: 104.935 },
    tag: 'Waterfront City',
    category: 'residential',
  },
];

export function toPickupLocation(zone: PhnomPenhZone): PickupLocation {
  return {
    id: zone.id,
    name: zone.name,
    address: zone.address,
    coordinates: zone.coordinates,
  };
}

export function searchPhnomPenhZones(query: string): PhnomPenhZone[] {
  const q = query.trim().toLowerCase();
  if (!q) return PHNOM_PENH_ZONES;

  return PHNOM_PENH_ZONES.filter((z) => {
    return (
      z.name.toLowerCase().includes(q) ||
      z.district.toLowerCase().includes(q) ||
      z.address.toLowerCase().includes(q) ||
      z.tag.toLowerCase().includes(q)
    );
  });
}
