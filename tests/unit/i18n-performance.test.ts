import { describe, it, expect } from 'vitest';
import { routing } from '@/i18n/routing';

describe('i18n Performance & Routing Optimization', () => {
  it('has localeDetection disabled to eliminate 307 negotiation redirects', () => {
    expect(routing.localeDetection).toBe(false);
  });

  it('preserves as-needed locale prefix for clean default URLs', () => {
    expect(routing.localePrefix).toBe('as-needed');
  });

  it('supports English and Khmer with English as default', () => {
    expect(routing.locales).toEqual(['en', 'km']);
    expect(routing.defaultLocale).toBe('en');
  });
});
