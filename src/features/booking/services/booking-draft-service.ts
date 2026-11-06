import { BookingFormData } from '../types/booking-types';

const DRAFT_STORAGE_KEY = 'express_seller_pending_booking_draft';

export function saveBookingDraft(data: BookingFormData): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function loadBookingDraft(): BookingFormData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingFormData;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

