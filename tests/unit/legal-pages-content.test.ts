import { describe, it, expect } from 'vitest';
import { ABOUT_US_DATA } from '@/features/legal/data/about-us-content';
import { TERMS_DATA } from '@/features/legal/data/terms-content';
import { PRIVACY_DATA } from '@/features/legal/data/privacy-content';

describe('Legal & Company Pages Content (Cloned from shop.wingmall.com)', () => {
  describe('About Us Content', () => {
    it('contains valid title, introduction, and core sections', () => {
      expect(ABOUT_US_DATA.title).toBe('About Wingmall');
      expect(ABOUT_US_DATA.subtitle).toContain('online shopping');
      expect(ABOUT_US_DATA.sections.length).toBeGreaterThanOrEqual(4);

      const sectionTitles = ABOUT_US_DATA.sections.map((s) => s.title);
      expect(sectionTitles).toContain('What We Offer');
      expect(sectionTitles).toContain('Fast, Reliable Delivery');
      expect(sectionTitles).toContain('A Rewarding Shopping Experience');
      expect(sectionTitles).toContain('Our Commitment');
    });

    it('contains verified contact info for Wingmall headquarters', () => {
      expect(ABOUT_US_DATA.contact.phoneRaw).toBe('+85578311311');
      expect(ABOUT_US_DATA.contact.phone).toBe('(+855) 78 311 311');
      expect(ABOUT_US_DATA.contact.address).toContain('Preah Monivong Blvd');
      expect(ABOUT_US_DATA.contact.mapsUrl).toContain('maps.app.goo.gl');
    });
  });

  describe('Terms of Use Content', () => {
    it('contains complete 9-section structure and legal disclaimers', () => {
      expect(TERMS_DATA.documentTitle).toBe('WINGMALL WEBSITE — TERMS OF USE');
      expect(TERMS_DATA.sections.length).toBe(9);
      expect(TERMS_DATA.importantNotice).toContain('IMPORTANT THAT YOU READ CAREFULLY');

      const sectionNumbers = TERMS_DATA.sections.map((s) => s.number);
      expect(sectionNumbers).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']);
    });
  });

  describe('Privacy Policy Content', () => {
    it('contains full 8-section privacy framework and contact details', () => {
      expect(PRIVACY_DATA.documentTitle).toBe('WINGMALL PRIVACY POLICY');
      expect(PRIVACY_DATA.sections.length).toBe(8);
      expect(PRIVACY_DATA.introduction.length).toBeGreaterThan(0);

      const sectionTitles = PRIVACY_DATA.sections.map((s) => s.title);
      expect(sectionTitles).toContain('What Information Do We Collect?');
      expect(sectionTitles).toContain('How We Use Your Information');
      expect(sectionTitles).toContain('How We Share Your Information');
    });
  });
});
