import { describe, expect, it } from 'vitest';
import {
  PHNOM_PENH_BOUNDARY,
  PHNOM_PENH_BOUNDS,
  DEFAULT_PHNOM_PENH_COORDINATES,
  isInsidePhnomPenh,
  clampToPhnomPenh,
} from '@/features/booking/services/phnom-penh-region';

describe('phnom-penh-region service', () => {
  describe('Boundary Definition', () => {
    it('defines a valid polygon with at least 10 vertices', () => {
      expect(PHNOM_PENH_BOUNDARY.length).toBeGreaterThanOrEqual(10);
      PHNOM_PENH_BOUNDARY.forEach((pt) => {
        expect(pt.lat).toBeGreaterThan(PHNOM_PENH_BOUNDS.south);
        expect(pt.lat).toBeLessThan(PHNOM_PENH_BOUNDS.north);
        expect(pt.lng).toBeGreaterThan(PHNOM_PENH_BOUNDS.west);
        expect(pt.lng).toBeLessThan(PHNOM_PENH_BOUNDS.east);
      });
    });
  });

  describe('isInsidePhnomPenh', () => {
    it('accepts central Phnom Penh landmark coordinates', () => {
      // Wat Phnom / Daun Penh
      expect(isInsidePhnomPenh({ lat: 11.576, lng: 104.923 })).toBe(true);
      // BKK1
      expect(isInsidePhnomPenh({ lat: 11.5512, lng: 104.9256 })).toBe(true);
      // Tuol Kouk Avenue
      expect(isInsidePhnomPenh({ lat: 11.5835, lng: 104.899 })).toBe(true);
      // Russian Market (Toul Tompoung)
      expect(isInsidePhnomPenh({ lat: 11.5406, lng: 104.9149 })).toBe(true);
      // AEON Mall Sen Sok
      expect(isInsidePhnomPenh({ lat: 11.5977, lng: 104.8828 })).toBe(true);
      // Street 2004 / Por Senchey
      expect(isInsidePhnomPenh({ lat: 11.545, lng: 104.862 })).toBe(true);
      // Peng Huoth Star Platinum / Chbar Ampov
      expect(isInsidePhnomPenh({ lat: 11.528, lng: 104.965 })).toBe(true);
      // Phnom Penh SEZ / Kamboul
      expect(isInsidePhnomPenh({ lat: 11.525, lng: 104.765 })).toBe(true);
      // Prek Pnov
      expect(isInsidePhnomPenh({ lat: 11.655, lng: 104.872 })).toBe(true);
      // Default coordinates
      expect(isInsidePhnomPenh(DEFAULT_PHNOM_PENH_COORDINATES)).toBe(true);
    });

    it('rejects coordinates outside Phnom Penh (other provinces and foreign cities)', () => {
      // Siem Reap (Angkor Wat)
      expect(isInsidePhnomPenh({ lat: 13.36, lng: 103.86 })).toBe(false);
      // Sihanoukville (Otres Beach)
      expect(isInsidePhnomPenh({ lat: 10.62, lng: 103.52 })).toBe(false);
      // Battambang
      expect(isInsidePhnomPenh({ lat: 13.09, lng: 103.20 })).toBe(false);
      // Kampong Cham
      expect(isInsidePhnomPenh({ lat: 11.99, lng: 105.46 })).toBe(false);
      // Kampot
      expect(isInsidePhnomPenh({ lat: 10.61, lng: 104.18 })).toBe(false);
      // Bangkok, Thailand
      expect(isInsidePhnomPenh({ lat: 13.75, lng: 100.50 })).toBe(false);
      // Ho Chi Minh City, Vietnam
      expect(isInsidePhnomPenh({ lat: 10.82, lng: 106.63 })).toBe(false);
      // Far north Oudong (Kandal)
      expect(isInsidePhnomPenh({ lat: 11.82, lng: 104.75 })).toBe(false);
    });

    it('rejects null, undefined, and non-finite coordinates', () => {
      expect(isInsidePhnomPenh(null)).toBe(false);
      expect(isInsidePhnomPenh(undefined)).toBe(false);
      expect(isInsidePhnomPenh({ lat: NaN, lng: 104.92 })).toBe(false);
      expect(isInsidePhnomPenh({ lat: 11.55, lng: Infinity })).toBe(false);
    });
  });

  describe('clampToPhnomPenh', () => {
    it('returns original coordinates if already inside Phnom Penh', () => {
      const bkk1 = { lat: 11.5512, lng: 104.9256 };
      expect(clampToPhnomPenh(bkk1)).toEqual(bkk1);
    });

    it('returns default Phnom Penh coordinates if outside', () => {
      const siemReap = { lat: 13.36, lng: 103.86 };
      expect(clampToPhnomPenh(siemReap)).toEqual(DEFAULT_PHNOM_PENH_COORDINATES);
    });
  });
});
