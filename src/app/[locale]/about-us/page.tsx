import React from 'react';
import { LegalPageLayout } from '@/features/legal/components/legal-page-layout';
import { ABOUT_US_DATA } from '@/features/legal/data/about-us-content';
import { buildPageSeoMetadata } from '@/lib/seo';

export function generateMetadata() {
  return buildPageSeoMetadata({
    title: 'About Us | Wingmall & WingExpress',
    description: ABOUT_US_DATA.subtitle,
  });
}

export default function AboutUsPage() {
  return (
    <LegalPageLayout
      currentSlug="about-us"
      breadcrumbTitle="About Us"
      badgeText="About Wingmall & WingExpress"
      pageTitle={ABOUT_US_DATA.title}
      introParagraphs={[ABOUT_US_DATA.subtitle]}
      sections={ABOUT_US_DATA.sections}
      contactInfo={ABOUT_US_DATA.contact}
    />
  );
}

