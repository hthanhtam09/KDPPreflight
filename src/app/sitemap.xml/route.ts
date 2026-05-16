import { blogCategories, blogPosts } from '@/lib/blog';
import { glossaryTerms } from '@/lib/glossary-data';
import { SITE_URL } from '@/lib/seo';
import { toolPages } from '@/lib/tool-pages';

type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
};

export const dynamic = 'force-static';

export function GET() {
  const now = new Date().toISOString();

  const entries: SitemapEntry[] = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/checker`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/setup`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/preview`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.82 },
    ...toolPages.map((tool): SitemapEntry => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: tool.slug === 'kdp-cover-checker' ? 0.88 : 0.84,
    })),
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    ...blogCategories.map((category): SitemapEntry => ({
      url: `${SITE_URL}/blog/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.66,
    })),
    ...blogPosts.map((post): SitemapEntry => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: 'monthly',
      priority: post.featured ? 0.78 : 0.7,
    })),
    { url: `${SITE_URL}/glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    ...glossaryTerms.map((term): SitemapEntry => ({
      url: `${SITE_URL}/glossary/${term.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.62,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(2)}</priority>
  </url>`,
    )
    .join('\n')}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
