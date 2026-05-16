import { blogPosts, blogTools, type BlogFAQ, type BlogGuideLink, type BlogPost, type BlogToolLink } from './blog-data';
import {
  blogCategories,
  blogCategoryFilters,
  getBlogCategory,
  type BlogCategory,
  type BlogCategoryFilter,
  type BlogCategorySlug,
} from './blog-categories';

export type { BlogCategory, BlogCategoryFilter, BlogCategorySlug, BlogFAQ, BlogGuideLink, BlogPost, BlogToolLink };
export { blogCategories, blogCategoryFilters, blogPosts, blogTools, getBlogCategory };

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export const topicClusters = [
  {
    title: 'Cover rejection fixes',
    description: 'Diagnose rejected KDP covers, printable area warnings, barcode conflicts, and wrong PDF dimensions.',
    category: 'cover-rejections' as BlogCategorySlug,
    links: [
      { label: 'Why Amazon rejected your cover', href: '/blog/why-amazon-rejected-your-kdp-cover' },
      { label: 'Printable area error fix', href: '/blog/fix-elements-outside-printable-area-kdp' },
      { label: 'Free cover checker', href: '/tools/kdp-cover-checker' },
    ],
  },
  {
    title: 'Bleed and edge artwork',
    description: 'Learn the 0.125 inch bleed rule and fix backgrounds that do not extend past trim.',
    category: 'bleed-issues' as BlogCategorySlug,
    links: [
      { label: 'KDP bleed explained', href: '/blog/kdp-bleed-explained' },
      { label: 'Fix bleed issues', href: '/blog/fix-kdp-bleed-issues' },
      { label: 'KDP bleed checker', href: '/tools/kdp-bleed-checker' },
    ],
  },
  {
    title: 'Spine width and alignment',
    description: 'Calculate paperback spine width and prevent shifted or unsafe spine text.',
    category: 'spine-width' as BlogCategorySlug,
    links: [
      { label: 'Calculate spine width', href: '/blog/calculate-kdp-spine-width' },
      { label: 'Fix spine text alignment', href: '/blog/kdp-spine-text-misaligned' },
      { label: 'Spine calculator', href: '/tools/kdp-spine-width-calculator' },
    ],
  },
  {
    title: 'Design tool exports',
    description: 'Export print-ready KDP cover PDFs from Canva or Photoshop without cropping bleed.',
    category: 'canva-photoshop' as BlogCategorySlug,
    links: [
      { label: 'Canva KDP export', href: '/blog/export-kdp-cover-from-canva' },
      { label: 'Photoshop KDP setup', href: '/blog/setup-kdp-cover-photoshop' },
      { label: 'PDF export settings', href: '/blog/best-pdf-export-settings-kdp' },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}

export function getFeaturedPost(): BlogPost {
  return blogPosts.find((post) => post.featured) ?? blogPosts[0];
}

export function getPostsByCategory(category: BlogCategorySlug): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const explicit = post.relatedPosts
    .map((slug) => getBlogPost(slug))
    .filter((related): related is BlogPost => Boolean(related));

  const sameCategory = blogPosts.filter(
    (candidate) => candidate.slug !== post.slug && candidate.category === post.category && !explicit.includes(candidate),
  );

  const otherUseful = blogPosts.filter(
    (candidate) => candidate.slug !== post.slug && candidate.category !== post.category && !explicit.includes(candidate),
  );

  return [...explicit, ...sameCategory, ...otherUseful].slice(0, limit);
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getTableOfContents(markdown: string): TocItem[] {
  const headingPattern = /^(##|###)\s+(.+)$/gm;
  const items: TocItem[] = [];
  const usedIds = new Map<string, number>();
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(markdown)) !== null) {
    const title = match[2].replace(/\*\*/g, '').trim();
    const baseId = slugifyHeading(title);
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);

    items.push({
      id: count ? `${baseId}-${count + 1}` : baseId,
      title,
      level: match[1] === '##' ? 2 : 3,
    });
  }

  return items;
}
