import { BookingFormData, DropoffStop, SavedBookingDraft } from '../types/booking-types';

const PENDING_CHECKOUT_DRAFT_KEY = 'express_seller_pending_booking_draft';
const LAST_BOOKED_STOPS_KEY = 'express_seller_last_booked_stops';
const USER_SAVED_DRAFTS_KEY = 'express_seller_user_saved_drafts';

export type { SavedBookingDraft } from '../types/booking-types';

/**
 * Temporary session draft used for in-flight payment review navigation.
 */
export function saveBookingDraft(data: BookingFormData): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_DRAFT_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function loadBookingDraft(): BookingFormData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingFormData;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PENDING_CHECKOUT_DRAFT_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Persistent user drafts for authenticated sellers.
 */
function getAllSavedDrafts(): SavedBookingDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_SAVED_DRAFTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedBookingDraft[];
  } catch {
    return [];
  }
}

function persistAllSavedDrafts(drafts: SavedBookingDraft[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_SAVED_DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // Ignore quota errors
  }
}

export function getUserSavedDrafts(userId?: string): SavedBookingDraft[] {
  const all = getAllSavedDrafts();
  if (!userId) return all;
  return all.filter((d) => !d.userId || d.userId === userId);
}

export function saveUserBookingDraft(
  formData: BookingFormData,
  userId?: string
): SavedBookingDraft {
  const all = getAllSavedDrafts();
  const origin = formData.pickup?.address?.split(',')[0] || 'Pickup Origin';
  const dest = formData.dropoff?.address?.split(',')[0] || 'Destination';
  const orderRef = formData.parcel?.sellerOrderRef;
  const title = orderRef ? `${orderRef}: ${origin} → ${dest}` : `${origin} → ${dest}`;

  const newDraft: SavedBookingDraft = {
    id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    formData,
  };

  const updated = [newDraft, ...all.filter((d) => d.id !== newDraft.id)];
  persistAllSavedDrafts(updated);
  return newDraft;
}

export function deleteUserBookingDraft(draftId: string): void {
  const all = getAllSavedDrafts();
  const updated = all.filter((d) => d.id !== draftId);
  persistAllSavedDrafts(updated);
}

/**
 * Temporarily caches per-stop recipient/COD details for the success receipt
 * so each customer gets an isolated tracking link right after booking checkout.
 */
export function saveLastBookedStops(tracking: string, stops: DropoffStop[]): void {
  if (typeof window === 'undefined' || !tracking || stops.length === 0) return;
  try {
    sessionStorage.setItem(
      LAST_BOOKED_STOPS_KEY,
      JSON.stringify({ tracking, stops })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function loadLastBookedStops(tracking: string): DropoffStop[] | null {
  if (typeof window === 'undefined' || !tracking) return null;
  try {
    const raw = sessionStorage.getItem(LAST_BOOKED_STOPS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tracking?: string; stops?: DropoffStop[] };
    if (parsed.tracking !== tracking || !Array.isArray(parsed.stops)) return null;
    return parsed.stops;
  } catch {
    return null;
  }
}
