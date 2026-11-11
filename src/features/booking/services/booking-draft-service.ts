import { BookingFormData } from '../types/booking-types';

const PENDING_CHECKOUT_DRAFT_KEY = 'express_seller_pending_booking_draft';
const USER_SAVED_DRAFTS_KEY = 'express_seller_user_saved_drafts';

export interface SavedBookingDraft {
  id: string;
  orderId?: string;
  source?: 'api' | 'local';
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  formData: BookingFormData;
}

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
 * Backend API draft helpers backed by Wing Consumer Courier Orders (`order_status = DRAFT`).
 */
export async function fetchApiSavedDrafts(
  locale = 'EN',
): Promise<SavedBookingDraft[]> {
  const res = await fetch('/api/bookings/drafts', {
    headers: { 'Accept-Language': locale.toUpperCase() },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as {
    items?: SavedBookingDraft[];
  };
  return Array.isArray(data.items) ? data.items : [];
}

export async function saveApiBookingDraft(
  formData: BookingFormData,
  locale = 'EN',
): Promise<SavedBookingDraft> {
  const res = await fetch('/api/bookings/drafts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale.toUpperCase(),
    },
    body: JSON.stringify(formData),
  });
  const data = (await res.json().catch(() => ({}))) as {
    draft?: SavedBookingDraft;
    message?: string;
  };
  if (!res.ok || !data.draft) {
    throw new Error(data.message || 'Failed to save draft');
  }
  return data.draft;
}

export async function deleteApiBookingDraft(
  draftId: string,
  locale = 'EN',
): Promise<void> {
  const res = await fetch(
    `/api/bookings/drafts?id=${encodeURIComponent(draftId)}`,
    {
      method: 'DELETE',
      headers: { 'Accept-Language': locale.toUpperCase() },
    },
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || 'Failed to delete draft');
  }
}
