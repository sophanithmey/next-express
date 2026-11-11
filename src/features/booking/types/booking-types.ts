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
  riderNote?: string;
  imageUrl?: string;
  isDefault?: boolean;
}

export interface RecipientInfo {
  name: string;
  phoneNumber: string;
  alternatePhone?: string;
  notes?: string;
  imageUrl?: string;
}

export interface DropoffLocation {
  addressId?: string;
  address: string;
  landmark?: string;
  coordinates: GeoCoordinates;
}

export interface DropoffStop {
  id: string;
  recipient: RecipientInfo;
  dropoff: DropoffLocation;
  codAmount?: number;
  parcelNote?: string;
  imageUrl?: string;
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

export type DeliverySpeedOption = 'instant' | 'same_day' | 'scheduled';

export type DeliveryShift = 'morning' | 'afternoon' | 'evening';

export interface DeliverySchedule {
  date: string;
  dateLabel: string;
  shift: DeliveryShift;
  timeSlot?: string;
}

export interface BookingFeeQuote {
  baseFee: number;
  distanceKm: number;
  peakHourSurcharge?: number;
  discount?: number;
  totalDeliveryFee: number;
  deliverySpeed?: DeliverySpeedOption;
}

export interface BookingFormData {
  draftOrderId?: string;
  pickup: PickupLocation;
  recipient: RecipientInfo;
  isBookingOnBehalf: boolean;
  senderName?: string;
  senderPhone?: string;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  deliveryOption?: DeliverySpeedOption;
  deliverySchedule?: DeliverySchedule;
  parcel: ParcelInfo;
  cod: CodInfo;
}

export interface CreateBookingPayload {
  draftOrderId?: string;
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  deliveryOption?: DeliverySpeedOption;
  deliverySchedule?: DeliverySchedule;
  recipient: RecipientInfo;
  parcel: ParcelInfo;
  cod: CodInfo;
  idempotencyKey: string;
  feeQuote?: BookingFeeQuote;
  trackingNumber?: string;
  paymentMethod?: string;
  paymentCardId?: string;
  promoCode?: string;
  discountAmount?: number;
  tipAmount?: number;
  finalFee?: number;
  isDraft?: boolean;
}

export interface TimelineEvent {
  status: string;
  title: string;
  timestamp: string;
  description?: string;
  completed: boolean;
  current?: boolean;
}

export interface BookingOrder {
  id: string;
  deliveryId?: string;
  orderNumber?: string;
  trackingNumber: string;
  trackingUrl: string;
  status: 'draft' | 'pending' | 'confirmed' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentCardId?: string;
  paymentDate?: string;
  paymentId?: string;
  paymentRedirectUrl?: string;
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  deliveryOption?: DeliverySpeedOption;
  recipient: RecipientInfo;
  parcel: ParcelInfo;
  cod: CodInfo;
  deliveryFee: number;
  totalSellerCharge: number;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  cancelledAt?: string;
  timeline?: TimelineEvent[];
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

