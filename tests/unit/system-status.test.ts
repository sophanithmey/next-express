import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getMaintenanceConfig,
  isMaintenanceActive,
  hasAdminBypass,
  isExcludedFromMaintenance,
} from '@/server/lib/maintenance';
import { formatEstimatedTime } from '@/components/system-status/format-estimated-time';

describe('System Maintenance Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.MAINTENANCE_MODE;
    delete process.env.MAINTENANCE_UNTIL;
    delete process.env.MAINTENANCE_MESSAGE;
    delete process.env.MAINTENANCE_BYPASS_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isMaintenanceActive', () => {
    it('is inactive by default when env is unset', () => {
      expect(isMaintenanceActive()).toBe(false);
    });

    it('activates when MAINTENANCE_MODE is "true" or "1"', () => {
      process.env.MAINTENANCE_MODE = 'true';
      expect(isMaintenanceActive()).toBe(true);

      process.env.MAINTENANCE_MODE = '1';
      expect(isMaintenanceActive()).toBe(true);
    });

    it('remains inactive when MAINTENANCE_MODE is "false" or random string', () => {
      process.env.MAINTENANCE_MODE = 'false';
      expect(isMaintenanceActive()).toBe(false);

      process.env.MAINTENANCE_MODE = 'no';
      expect(isMaintenanceActive()).toBe(false);
    });

    it('automatically deactivates if MAINTENANCE_UNTIL is in the past', () => {
      process.env.MAINTENANCE_MODE = 'true';
      const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
      process.env.MAINTENANCE_UNTIL = pastDate;

      expect(isMaintenanceActive()).toBe(false);
    });

    it('stays active if MAINTENANCE_UNTIL is in the future', () => {
      process.env.MAINTENANCE_MODE = 'true';
      const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      process.env.MAINTENANCE_UNTIL = futureDate;

      expect(isMaintenanceActive()).toBe(true);
      expect(getMaintenanceConfig().estimatedUntil).toBe(futureDate);
    });
  });

  describe('hasAdminBypass', () => {
    it('grants bypass when cookie matches secret', () => {
      process.env.MAINTENANCE_BYPASS_SECRET = 'super_secret_token';
      expect(hasAdminBypass('super_secret_token', null)).toBe(true);
      expect(hasAdminBypass('wrong_token', null)).toBe(false);
    });

    it('grants bypass when header matches secret', () => {
      process.env.MAINTENANCE_BYPASS_SECRET = 'super_secret_token';
      expect(hasAdminBypass(null, 'super_secret_token')).toBe(true);
      expect(hasAdminBypass(null, 'wrong_token')).toBe(false);
    });
  });

  describe('isExcludedFromMaintenance', () => {
    it('excludes maintenance route to prevent redirect loops', () => {
      expect(isExcludedFromMaintenance('/maintenance')).toBe(true);
      expect(isExcludedFromMaintenance('/km/maintenance')).toBe(true);
    });

    it('excludes framework and static assets', () => {
      expect(isExcludedFromMaintenance('/_next/static/chunk.js')).toBe(true);
      expect(isExcludedFromMaintenance('/images/logo.png')).toBe(true);
      expect(isExcludedFromMaintenance('/favicon.ico')).toBe(true);
      expect(isExcludedFromMaintenance('/robots.txt')).toBe(true);
    });

    it('excludes health check and session validation endpoints', () => {
      expect(isExcludedFromMaintenance('/api/health')).toBe(true);
      expect(isExcludedFromMaintenance('/api/auth/session')).toBe(true);
    });

    it('does NOT exclude normal user pages', () => {
      expect(isExcludedFromMaintenance('/')).toBe(false);
      expect(isExcludedFromMaintenance('/km')).toBe(false);
      expect(isExcludedFromMaintenance('/booking')).toBe(false);
      expect(isExcludedFromMaintenance('/booking/review')).toBe(false);
      expect(isExcludedFromMaintenance('/bookings')).toBe(false);
    });
  });

  describe('formatEstimatedTime', () => {
    it('formats a date to "dd MMM yyyy HH:mm" in English', () => {
      // 2026-11-20 14:30 local time
      const date = new Date(2026, 10, 20, 14, 30);
      expect(formatEstimatedTime(date.toISOString(), 'en')).toBe('20 Nov 2026 14:30');
    });

    it('formats a date to "dd MMM yyyy HH:mm" in Khmer', () => {
      const date = new Date(2026, 10, 20, 14, 30);
      expect(formatEstimatedTime(date.toISOString(), 'km')).toBe('20 វិច្ឆិកា 2026 14:30');
    });

    it('gracefully returns human strings as-is', () => {
      expect(formatEstimatedTime('Tonight at 10:00 PM', 'en')).toBe('Tonight at 10:00 PM');
    });

    it('returns empty string when input is undefined or empty', () => {
      expect(formatEstimatedTime(undefined)).toBe('');
      expect(formatEstimatedTime('')).toBe('');
    });
  });
});
