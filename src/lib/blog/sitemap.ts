import { SITE_URL } from '@/lib/seo';
import { blogCategories } from '@/lib/blog-categories';
import { blogPosts } from './content';
import { getBlogPageCount } from './pagination';

export type BlogSitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
};

export function getBlogSitemapEntries(now = new Date().toISOString()): BlogSitemapEntry[] {
  const blogTotalPages = getBlogPageCount(blogPosts.length);

  const blogListingPages: BlogSitemapEntry[] = [
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    ...Array.from({ length: Math.max(0, blogTotalPages - 1) }, (_, i): BlogSitemapEntry => ({
      url: `${SITE_URL}/blog/page/${i + 2}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
  ];

  // Only include categories that have published posts — empty categories are noindexed
  const categoryPages: BlogSitemapEntry[] = blogCategories.flatMap((category) => {
    const posts = blogPosts.filter((p) => p.category === category.slug);
    if (!posts.length) return [];
    const totalPages = getBlogPageCount(posts.length);
    return [
      {
        url: `${SITE_URL}/blog/category/${category.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.66,
      },
      ...Array.from({ length: Math.max(0, totalPages - 1) }, (_, i): BlogSitemapEntry => ({
        url: `${SITE_URL}/blog/category/${category.slug}/page/${i + 2}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.55,
      })),
    ];
  });

  const articlePages: BlogSitemapEntry[] = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: 'monthly',
    priority: post.featured ? 0.78 : 0.7,
  }));

  return [...blogListingPages, ...categoryPages, ...articlePages];
}
