export const APP_CONFIG = {
  appName: 'WingExpress',
  currency: 'USD',
  currencySymbol: '$',
  supportPhone: '078 311 311',
  supportPhoneRaw: '078311311',
  defaultCoordinates: {
    lat: 11.5564,
    lng: 104.9282,
  },
  supportTelegram: 'https://t.me/WingMall',
  appDownloadUrl: 'https://wingmall.onelink.me/qlVW/wmmc1',
  socialLinks: {
    facebook: 'https://www.facebook.com/WingmallKH?mibextid=LQQJ4d',
    telegram: 'https://t.me/WingMall',
    instagram: 'https://instagram.com/wingmallkh?igshid=OGQ5ZDc2ODk2ZA==',
    tiktok: 'https://www.tiktok.com/@wingmallkh?_t=8hwqE2M4SbY&_r=1',
    youtube: 'https://youtube.com/@wingmallkh?si=o-U4q85n38y-IlfG',
  },
};

export const SUPPORT_PHONE = '078 311 311';
export const SUPPORT_PHONE_RAW = '078311311';
export const APP_DOWNLOAD_URL = 'https://wingmall.onelink.me/qlVW/wmmc1';
export const SOCIAL_LINKS = APP_CONFIG.socialLinks;

export const SESSION_COOKIE_NAME = 'express_seller_session';
export const MAX_DROPOFF_STOPS = 5;
export const MAX_TOTAL_COD_USD = 60;

export const UNIFIED_API_PATHS = {
  IDENTITY: '/identity/v1',
  USER: '/user/v1',
  ADDRESS: '/address/v1',
  ORDER: '/order/v1',
  PAYMENT: '/payment/v1',
} as const;

export const BOOKING_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Pickup',
  confirmed: 'Confirmed',
  assigned: 'Driver Assigned',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  draft: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  pending: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  confirmed: {
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    border: 'border-brand-200',
  },
  assigned: {
    bg: 'bg-secondary-50',
    text: 'text-secondary-700',
    border: 'border-secondary-200',
  },
  out_for_delivery: {
    bg: 'bg-brand-lime-50',
    text: 'text-brand-lime-800',
    border: 'border-brand-lime-200',
  },
  delivered: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-200',
  },
  cancelled: {
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    border: 'border-danger-200',
  },
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Payment Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
  refunded: 'Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: 'bg-warning-50',
    text: 'text-warning-800',
    border: 'border-warning-200',
  },
  paid: {
    bg: 'bg-success-50',
    text: 'text-success-800',
    border: 'border-success-200',
  },
  failed: {
    bg: 'bg-danger-50',
    text: 'text-danger-800',
    border: 'border-danger-200',
  },
  refunded: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
};
