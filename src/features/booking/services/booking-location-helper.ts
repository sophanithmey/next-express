import {
  DropoffLocation,
  DropoffStop,
  PickupLocation,
} from '@/features/booking/types/booking-types';

/**
 * Merges a confirmed location selection into the current pickup state
 * while preserving existing seller contact, bank, and rider note fields.
 */
export function applyConfirmedPickupLocation(
  currentPickup: PickupLocation,
  selected: PickupLocation,
): PickupLocation {
  return {
    ...currentPickup,
    id: selected.id ?? currentPickup.id,
    placeId: selected.placeId ?? currentPickup.placeId,
    name: selected.name,
    address: selected.address,
    coordinates: {
      lat: Number(selected.coordinates.lat),
      lng: Number(selected.coordinates.lng),
    },
    riderNote: selected.riderNote ?? currentPickup.riderNote,
    imageUrl: selected.imageUrl ?? currentPickup.imageUrl,
    senderName: selected.senderName || currentPickup.senderName,
    senderPhone: selected.senderPhone || currentPickup.senderPhone,
  };
}

/**
 * Applies a confirmed location strictly to the targeted drop-off stop index,
 * preserving recipient data and leaving all other stops untouched.
 */
export function applyConfirmedDropoffLocation(params: {
  dropoffs?: DropoffStop[];
  fallbackDropoff: DropoffLocation;
  activeStopIndex: number;
  selected: PickupLocation;
}): {
  nextDropoffs?: DropoffStop[];
  primaryDropoffToSync?: DropoffLocation;
} {
  const { dropoffs, fallbackDropoff, activeStopIndex, selected } = params;
  const currentTarget =
    dropoffs?.[activeStopIndex]?.dropoff ?? fallbackDropoff;

  const nextDropoff: DropoffLocation = {
    ...currentTarget,
    address: selected.address,
    coordinates: {
      lat: Number(selected.coordinates.lat),
      lng: Number(selected.coordinates.lng),
    },
    placeId: selected.placeId,
  };

  if (dropoffs && dropoffs.length > 0) {
    const nextDropoffs = dropoffs.map((stop, idx) =>
      idx === activeStopIndex ? { ...stop, dropoff: nextDropoff } : stop,
    );
    return {
      nextDropoffs,
      primaryDropoffToSync: activeStopIndex === 0 ? nextDropoff : undefined,
    };
  }

  return {
    primaryDropoffToSync: nextDropoff,
  };
}

