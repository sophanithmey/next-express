import 'server-only';
import { PickupLocation } from '@/features/booking/types/booking-types';

export interface ConsumerAddressDetail {
  house_number?: string;
  street_number?: string;
  province_id?: string;
  district_id?: string;
  commune_id?: string;
  village_id?: string;
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
  image_url?: string | null;
  metadata?: Record<string, unknown> | null;
  address_detail?: ConsumerAddressDetail | null;
  status?: string | null;
}

export type SavedLocationOption = PickupLocation & { tag?: string };

function cleanStr(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Maps Wing Consumer Address items into UI `PickupLocation` options, discarding pinless rows.
 */
export function mapConsumerAddressesToPickupLocations(
  items: ConsumerAddressItem[],
  options?: { fallbackPhone?: string; fallbackSenderName?: string },
): SavedLocationOption[] {
  if (!Array.isArray(items)) return [];

  const results: SavedLocationOption[] = [];
  for (const item of items) {
    if (
      typeof item?.latitude !== 'number' ||
      typeof item?.longitude !== 'number' ||
      !Number.isFinite(item.latitude) ||
      !Number.isFinite(item.longitude)
    ) {
      continue;
    }

    const meta = (item.metadata || {}) as Record<string, unknown>;
    const metaSenderName =
      typeof meta.contact_name === 'string'
        ? cleanStr(meta.contact_name)
        : undefined;

    results.push({
      id: cleanStr(item.id),
      name: cleanStr(item.name) || cleanStr(item.information_address) || 'Saved Location',
      address: cleanStr(item.information_address) || cleanStr(item.name) || '',
      coordinates: { lat: item.latitude, lng: item.longitude },
      riderNote: cleanStr(item.remark),
      senderPhone: cleanStr(item.contact) || cleanStr(options?.fallbackPhone),
      senderName: metaSenderName || cleanStr(options?.fallbackSenderName),
      imageUrl: cleanStr(item.image_url),
      tag: cleanStr(item.type),
    });
  }

  return results;
}

