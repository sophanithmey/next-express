import React from 'react';
import { LegalPageLayout } from '@/features/legal/components/legal-page-layout';
import { TERMS_DATA } from '@/features/legal/data/terms-content';
import { buildPageSeoMetadata } from '@/lib/seo';

export function generateMetadata() {
  return buildPageSeoMetadata({
    title: 'Terms of Use | Wingmall & WingExpress',
    description: TERMS_DATA.importantNotice,
  });
}

export default function TermsOfUsePage() {
  return (
    <LegalPageLayout
      currentSlug="terms-of-use"
      breadcrumbTitle="Terms of use"
      badgeText="Legal Agreement"
      pageTitle={TERMS_DATA.documentTitle}
      lastUpdated={TERMS_DATA.lastUpdated}
      importantNotice={TERMS_DATA.importantNotice}
      sections={TERMS_DATA.sections}
    />
  );
}

