export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface PickupLocation {
  id?: string;
  name: string;
  address: string;
  coordinates: GeoCoordinates;
  senderName?: string;
  senderPhone?: string;
  isDefault?: boolean;
}

export interface RecipientInfo {
  name: string;
  phoneNumber: string;
  alternatePhone?: string;
  notes?: string;
}

export interface DropoffLocation {
  address: string;
  landmark?: string;
  coordinates: GeoCoordinates;
}

export interface ParcelInfo {
  description?: string;
  sellerOrderRef?: string;
  quantity?: number;
  instructions?: string;
  itemCategory?: string;
}

export interface CodInfo {
  isCod: boolean;
  amount: number;
}

export interface BookingFeeQuote {
  baseFee: number;
  distanceKm: number;
  peakHourSurcharge?: number;
  discount?: number;
  totalDeliveryFee: number;
}

export interface BookingFormData {
  pickup: PickupLocation;
  recipient: RecipientInfo;
  isBookingOnBehalf: boolean;
  senderName?: string;
  senderPhone?: string;
  dropoff: DropoffLocation;
  parcel: ParcelInfo;
  cod: CodInfo;
}

export interface CreateBookingPayload {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  recipient: RecipientInfo;
  parcel: ParcelInfo;
  cod: CodInfo;
  idempotencyKey: string;
  feeQuote?: BookingFeeQuote;
}

export interface BookingOrder {
  id: string;
  trackingNumber: string;
  trackingUrl: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  recipient: RecipientInfo;
  parcel: ParcelInfo;
  cod: CodInfo;
  deliveryFee: number;
  totalSellerCharge: number;
  createdAt: string;
  updatedAt: string;
  deliverer?: {
    name: string;
    phone: string;
    plateNumber?: string;
  };
}

export interface RecipientRecord {
  id: string;
  name: string;
  phoneNumber: string;
  lastUsedAt: string;
  lastAddress?: string;
  lastCoordinates?: GeoCoordinates;
}

export interface DashboardStatistics {
  todayBookings: number;
  pendingPickup: number;
  inTransit: number;
  delivered: number;
  codCollection: number;
}
