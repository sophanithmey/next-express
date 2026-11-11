import 'server-only';
import { PickupLocation } from '@/features/booking/types/booking-types';

export interface ConsumerAddressDetail {
  address_id?: string | null;
  house_number?: string | null;
  street_number?: string | null;
  province_id?: string | null;
  district_id?: string | null;
  commune_id?: string | null;
  village_id?: string | null;
}

export interface ConsumerAddressItem {
  id?: string | null;
  reference_id?: string | null;
  name?: string | null;
  type?: string | null;
  contact?: string | null;
  information_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  remark?: string | null;
  metadata?: Record<string, unknown> | null;
  address_detail?: ConsumerAddressDetail | null;
  status?: string | null;
  distance?: number | null;
  updated_date?: string | null;
}

export interface SavedLocationOption extends PickupLocation {
  tag?: string;
}

function readMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  keys: string[],
): string | undefined {
  if (!metadata) return undefined;
  for (const key of keys) {
    const val = metadata[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }
  return undefined;
}

function resolveAddressText(item: ConsumerAddressItem): string {
  const info = item.information_address?.trim();
  if (info) return info;

  const detail = item.address_detail;
  if (!detail) return '';
  return [detail.house_number, detail.street_number]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(', ')
    .trim();
}

/**
 * Maps Consumer Address Service records (`GET /consumer/addresses/sort` or `POST /consumer/addresses`)
 * into normalized `PickupLocation` options for the booking UI.
 */
export function mapConsumerAddressesToPickupLocations(
  items: ConsumerAddressItem[],
  defaults?: { fallbackPhone?: string; fallbackSenderName?: string },
): SavedLocationOption[] {
  const mapped: SavedLocationOption[] = [];

  for (const item of items) {
    if (item.status && item.status.toUpperCase() !== 'ACTIVE') continue;

    const address = resolveAddressText(item);
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const images = item.metadata?.images;
    const firstImage =
      Array.isArray(images) && typeof images[0] === 'string' && images[0].trim()
        ? images[0].trim()
        : undefined;

    const senderPhone =
      item.contact?.trim() ||
      readMetadataString(item.metadata, [
        'phone',
        'phone_number',
        'contact_phone',
        'sender_phone',
      ]) ||
      defaults?.fallbackPhone;
    const senderName =
      readMetadataString(item.metadata, [
        'contact_name',
        'sender_name',
        'recipient_name',
      ]) || defaults?.fallbackSenderName;

    mapped.push({
      id:
        item.id?.trim() ||
        item.address_detail?.address_id?.trim() ||
        `addr-${mapped.length + 1}`,
      name:
        item.name?.trim() || address.split(',')[0]?.trim() || 'Saved Address',
      address,
      coordinates: { lat, lng },
      riderNote: item.remark?.trim() || undefined,
      senderPhone,
      senderName,
      imageUrl: firstImage,
      tag: item.type?.trim() || undefined,
    });
  }

  return mapped;
}

