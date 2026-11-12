import 'server-only';
import {
  CreateBookingPayload,
  DropoffStop,
} from '@/features/booking/types/booking-types';
import { sanitizeCambodiaPhoneInput } from '@/lib/phone-number';
import {
  normalizeWingAccountNumber,
  syncCodWithDropoffs,
} from '@/features/booking/services/booking-form-helpers';

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cop: 'cash_on_delivery',
  cash_on_delivery: 'cash_on_delivery',
  khqr: 'khqr',
  wingpoint: 'wing_point',
  wallet: 'wing_pay',
  card: 'card',
};

function normalizeCourierPhone(value?: string | null): string {
  if (!value) return '';
  const digits = sanitizeCambodiaPhoneInput(value);
  return digits || value.trim();
}

function normalizeHttpImages(imageUrl?: string | string[] | null): string[] {
  const list = Array.isArray(imageUrl)
    ? imageUrl
    : imageUrl
      ? [imageUrl]
      : [];
  return list.filter(
    (src) => typeof src === 'string' && /^https?:\/\//i.test(src.trim()),
  );
}

function normalizeParcelType(category?: string): string {
  const cleaned = category?.trim().toUpperCase().replace(/\s+/g, '-');
  return cleaned || 'GENERAL';
}

export function mapPaymentMethodToCourier(method?: string | null): string | null {
  if (!method) return null;
  const key = method.trim().toLowerCase();
  return PAYMENT_METHOD_MAP[key] || method.trim();
}

export function buildCourierOrderPayload(
  payload: CreateBookingPayload,
  options?: {
    fallbackPhone?: string;
    fallbackSenderName?: string;
    orderId?: string;
    includePaymentMethod?: boolean;
  },
): Record<string, unknown> {
  const stops: DropoffStop[] =
    payload.dropoffs && payload.dropoffs.length > 0
      ? payload.dropoffs
      : [{ id: 'stop-1', recipient: payload.recipient, dropoff: payload.dropoff }];

  const effectiveCod = payload.dropoffs?.length
    ? syncCodWithDropoffs(payload.dropoffs, payload.cod)
    : payload.cod;

  const subtotal = Math.max(
    0,
    Number(payload.feeQuote?.totalDeliveryFee ?? payload.finalFee ?? 1.75),
  );
  const discountAmount = Math.max(0, Number(payload.discountAmount ?? 0));
  const tipAmount = Math.max(0, Number(payload.tipAmount ?? 0));
  const totalAmount = Math.max(
    0,
    Number(
      payload.finalFee ?? Math.max(0, subtotal - discountAmount + tipAmount),
    ),
  );
  const totalCollect = effectiveCod.isCod
    ? Math.max(0, Number(effectiveCod.amount) || 0)
    : 0;
  const settlementAccountName =
    payload.pickup.settlementAccountName?.trim() || '';
  const settlementAccountNumber = normalizeWingAccountNumber(
    payload.pickup.settlementAccountNumber,
  );
  const hasSettlementBank = Boolean(
    settlementAccountName || settlementAccountNumber,
  );

  return {
    ...(options?.orderId ? { order_id: options.orderId } : {}),
    platform: 'UNIFIED',
    service_type: 'ST_EXPRESS',
    currency: 'USD',
    exchange_rate: 4000,
    subtotal,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    ...(options?.orderId ? { optimized_saving_fee: 0 } : {}),
    region_id: 'PP01',
    remark: payload.parcel.instructions?.trim() || '',
    payment_method:
      options?.includePaymentMethod && !payload.isDraft
        ? mapPaymentMethodToCourier(payload.paymentMethod)
        : null,
    payment_card_id:
      options?.includePaymentMethod && !payload.isDraft && payload.paymentCardId
        ? payload.paymentCardId
        : null,
    device_payment: '',
    is_using_cod: Boolean(effectiveCod.isCod || totalCollect > 0),
    total_delivery_fee: subtotal,
    total_collect_payment: totalCollect,
    use_smart_route: false,
    courier_type: 'instant_delivery',
    sender: {
      sender_name:
        payload.pickup.senderName?.trim() || options?.fallbackSenderName || '',
      phone_number: normalizeCourierPhone(
        payload.pickup.senderPhone || options?.fallbackPhone,
      ),
      latitude: payload.pickup.coordinates.lat,
      longitude: payload.pickup.coordinates.lng,
      settlement_bank: hasSettlementBank
        ? payload.pickup.settlementBank?.trim() || 'WING'
        : null,
      settlement_account_name: settlementAccountName,
      settlement_account_number: settlementAccountNumber,
      pickup_address_id: payload.pickup.id?.startsWith('ADD-')
        ? payload.pickup.id
        : '',
      pickup_location_name: payload.pickup.address || payload.pickup.name || '',
      note: payload.pickup.riderNote?.trim() || '',
      images: normalizeHttpImages(payload.pickup.imageUrl),
      metadata: {
        ...(payload.pickup.name ? { location_label: payload.pickup.name } : {}),
        ...(payload.parcel.sellerOrderRef
          ? { seller_order_ref: payload.parcel.sellerOrderRef }
          : {}),
        ...(payload.deliveryOption
          ? { delivery_option: payload.deliveryOption }
          : {}),
        ...(payload.promoCode ? { promo_code: payload.promoCode } : {}),
        ...(tipAmount > 0 ? { tip_amount: tipAmount } : {}),
      },
    },
    receivers: stops.map((stop, idx) => {
      const stopCod =
        typeof stop.codAmount === 'number'
          ? Math.max(0, stop.codAmount)
          : idx === 0 && effectiveCod.isCod
            ? totalCollect
            : 0;

      return {
        ...(stop.id?.startsWith('OCR-') ? { id: stop.id } : {}),
        sequence_num: idx + 1,
        pre_optimized_sequence_num: idx + 1,
        receiver_name: stop.recipient.name?.trim() || '',
        phone_number: normalizeCourierPhone(stop.recipient.phoneNumber),
        collect_payment_amount: stopCod,
        dropoff_location_name: stop.dropoff.address,
        dropoff_address_id: stop.dropoff.addressId?.startsWith('ADD-')
          ? stop.dropoff.addressId
          : '',
        latitude: stop.dropoff.coordinates.lat,
        longitude: stop.dropoff.coordinates.lng,
        parcel_type: normalizeParcelType(payload.parcel.itemCategory),
        note: stop.recipient.notes?.trim() || stop.parcelNote?.trim() || '',
        metadata: {
          ...(payload.parcel.description
            ? { description: payload.parcel.description }
            : {}),
        },
        images: normalizeHttpImages(stop.recipient.imageUrl || stop.imageUrl),
      };
    }),
  };
}

