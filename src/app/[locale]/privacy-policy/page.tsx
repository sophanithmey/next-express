import React from 'react';
import { LegalPageLayout } from '@/features/legal/components/legal-page-layout';
import { PRIVACY_DATA } from '@/features/legal/data/privacy-content';
import { buildPageSeoMetadata } from '@/lib/seo';

export function generateMetadata() {
  return buildPageSeoMetadata({
    title: 'Privacy Policy | Wingmall & WingExpress',
    description: PRIVACY_DATA.importantNotice,
  });
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      currentSlug="privacy-policy"
      breadcrumbTitle="Privacy Policy"
      badgeText="Data Privacy & Protection"
      pageTitle={PRIVACY_DATA.documentTitle}
      lastUpdated={PRIVACY_DATA.lastUpdated}
      importantNotice={PRIVACY_DATA.importantNotice}
      introParagraphs={PRIVACY_DATA.introduction}
      sections={PRIVACY_DATA.sections}
    />
  );
}

