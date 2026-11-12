import type { Metadata } from 'next';

export const DEFAULT_SEO_TITLE = 'WingExpress — High-Speed Delivery Platform';
export const DEFAULT_SEO_DESCRIPTION =
  'Fast, modern delivery booking and management for online merchants and sellers';

export const DEFAULT_SEO_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'WingExpress — Book & Manage Multi-Drop Deliveries in Seconds',
} as const;

export function resolveMetadataBase(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

  try {
    return new URL(raw);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export function buildPageSeoMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'WingExpress',
      images: [DEFAULT_SEO_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_SEO_IMAGE.url],
    },
  };
}

