import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const coreRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/checker`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/setup`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/preview`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const trustRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/kdp-glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const seoLandingRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/kdp-bleed-checker`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/kdp-trim-size-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/kdp-spine-width-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/kdp-cover-validator`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/kdp-paperback-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/kdp-safe-area-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/kdp-cover-size-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    ...blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.78 : 0.7,
    })),
  ];

  return [...coreRoutes, ...trustRoutes, ...seoLandingRoutes, ...blogRoutes];
}
