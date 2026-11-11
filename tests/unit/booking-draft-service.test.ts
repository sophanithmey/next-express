import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveUserBookingDraft,
  getUserSavedDrafts,
  deleteUserBookingDraft,
  saveBookingDraft,
  loadBookingDraft,
  clearBookingDraft,
} from '@/features/booking/services/booking-draft-service';
import { createDefaultBookingForm } from '@/features/booking/services/booking-form-helpers';

describe('Booking Draft Service', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    // Clear in-memory mock storage
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }

    const storageMock = {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        for (const key of Object.keys(mockStorage)) {
          delete mockStorage[key];
        }
      },
      length: 0,
      key: () => null,
    };

    // Polyfill window & web storage in node test environment
    (globalThis as unknown as { window: unknown }).window = globalThis;
    (globalThis as unknown as { localStorage: unknown }).localStorage = storageMock;
    (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = storageMock;
  });

  it('saves and loads temporary checkout draft in sessionStorage', () => {
    const form = createDefaultBookingForm();
    form.pickup.address = 'Central Warehouse, Phnom Penh';
    saveBookingDraft(form);

    const loaded = loadBookingDraft();
    expect(loaded).not.toBeNull();
    expect(loaded?.pickup.address).toBe('Central Warehouse, Phnom Penh');

    clearBookingDraft();
    expect(loadBookingDraft()).toBeNull();
  });

  it('saves and retrieves user persistent drafts in localStorage', () => {
    const form = createDefaultBookingForm();
    form.pickup.address = 'Warehouse A';
    form.dropoff.address = 'Customer B';
    form.parcel.sellerOrderRef = 'LIVE-0914';

    const saved = saveUserBookingDraft(form, 'seller-123');
    expect(saved.id).toContain('draft-');
    expect(saved.title).toContain('LIVE-0914: Warehouse A → Customer B');
    expect(saved.userId).toBe('seller-123');

    const drafts = getUserSavedDrafts('seller-123');
    expect(drafts).toHaveLength(1);
    expect(drafts[0].formData.parcel.sellerOrderRef).toBe('LIVE-0914');

    deleteUserBookingDraft(saved.id);
    expect(getUserSavedDrafts('seller-123')).toHaveLength(0);
  });
});
