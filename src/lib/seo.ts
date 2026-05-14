import type { Metadata } from 'next';

export const SITE_URL = 'https://kdppreflight.app';
export const SITE_NAME = 'KDPPreflight';
export const SITE_TWITTER = '@kdppreflight';

export const BASE_KEYWORDS = [
  'KDP cover checker',
  'KDP bleed checker',
  'Amazon KDP cover validator',
  'KDP trim size checker',
  'KDP print preview',
  'KDP paperback checker',
  'KDP margin checker',
  'KDP spine width calculator',
];

export function generatePageMetadata({
  title,
  description,
  path = '',
  keywords = [],
  ogImage,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = `${SITE_URL}${path}`;
  const image = ogImage ?? `${SITE_URL}/android-chrome-512x512.png`;
  const allKeywords = [...BASE_KEYWORDS, ...keywords];

  return {
    title,
    description,
    keywords: allKeywords,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: SITE_TWITTER,
    },
  };
}

export function generateBlogMetadata({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  keywords = [],
  ogImage,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  keywords?: string[];
  ogImage?: string;
}): Metadata {
  const canonical = `${SITE_URL}/blog/${slug}`;
  const image = ogImage ?? `${SITE_URL}/android-chrome-512x512.png`;

  return {
    title,
    description,
    keywords: [...BASE_KEYWORDS, ...keywords],
    alternates: { canonical },
    robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'en_US',
      publishedTime: publishedAt,
      modifiedTime: updatedAt ?? publishedAt,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: SITE_TWITTER,
    },
  };
}
