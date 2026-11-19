import { describe, it, expect } from 'vitest';
import enMessages from '@/../messages/en.json';
import kmMessages from '@/../messages/km.json';

describe('Seller Authentication Flow Explainer Content & Translations', () => {
  const en = enMessages.Home.instantAccess;
  const km = kmMessages.Home.instantAccess;

  it('contains matching keys in both English and Khmer translation bundles', () => {
    const enKeys = Object.keys(en).sort();
    const kmKeys = Object.keys(km).sort();
    expect(enKeys).toEqual(kmKeys);
  });

  it('defines the correct hero header and value proposition copy', () => {
    expect(en.badge).toBe('Frictionless 2-Click Access');
    expect(en.title).toBe('Book First, Verify in Seconds');
    expect(en.subtitle).toContain('No upfront sign-up required');
  });

  it('defines the 2-step timeline process for returning sellers (Card A)', () => {
    expect(en.existingBadge).toBe('Returning Seller');
    expect(en.existingTitle).toBe('Welcome Back');
    expect(en.existingStep1).toBe('Phone Number');
    expect(en.existingStep2).toBe('4-Digit PIN');
    expect(en.existingPerk).toContain('Instant access to saved drafts');
  });

  it('defines the 3-step timeline process for new sellers (Card B)', () => {
    expect(en.newBadge).toBe('New Seller');
    expect(en.newTitle).toBe('Getting Started');
    expect(en.newStep1).toBe('Phone Number');
    expect(en.newStep2).toBe('SMS Verification');
    expect(en.newStep3).toBe('Create Your PIN');
    expect(en.newPerk).toContain('No passwords to remember');
  });

  it('defines the Booking-First Highlight Banner explaining friction-free booking', () => {
    expect(en.bannerTitle).toBe('Start Booking Without Logging In');
    expect(en.bannerDesc).toContain('Authentication is only required when you\'re ready to confirm your booking');
  });
});
