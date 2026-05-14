import { blogPosts, blogTools, type BlogCategory, type BlogPost } from './blog-data';

export type { BlogCategory, BlogFAQ, BlogGuideLink, BlogPost, BlogToolLink } from './blog-data';
export { blogPosts, blogTools };

export const blogCategories = [
  'All',
  'KDP Covers',
  'Bleed',
  'Trim Size',
  'Spine',
  'Safe Area',
  'Publishing Errors',
] as const;

export type BlogCategoryFilter = (typeof blogCategories)[number];

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export const topicClusters = [
  {
    title: 'KDP Bleed Guides',
    description: 'Fix missing bleed, trim-edge artwork, and export settings before KDP review.',
    links: [
      { label: 'KDP Bleed Guide', href: '/blog/kdp-bleed-guide' },
      { label: 'KDP Bleed Checker', href: '/kdp-bleed-checker' },
      { label: 'Free Cover Checker', href: '/checker' },
    ],
  },
  {
    title: 'KDP Cover Size Guides',
    description: 'Calculate full-wrap dimensions for front cover, back cover, spine, and bleed.',
    links: [
      { label: 'KDP Cover Size Guide', href: '/blog/kdp-cover-size-guide' },
      { label: 'KDP Trim Size Calculator', href: '/kdp-trim-size-calculator' },
      { label: 'KDP Cover Size Landing Guide', href: '/kdp-cover-size-guide' },
    ],
  },
  {
    title: 'KDP Spine Width Guides',
    description: 'Use final page count and paper type to prevent cover-width rejections.',
    links: [
      { label: 'KDP Spine Width Guide', href: '/blog/kdp-spine-width-guide' },
      { label: 'Spine Width Calculator', href: '/kdp-spine-width-calculator' },
      { label: 'Paperback Setup Guide', href: '/kdp-paperback-guide' },
    ],
  },
  {
    title: 'KDP Safe Area Guides',
    description: 'Keep text, logos, barcode space, and spine content away from trim risk zones.',
    links: [
      { label: 'KDP Safe Area Guide', href: '/blog/kdp-safe-area-guide' },
      { label: 'Safe Area Landing Guide', href: '/kdp-safe-area-guide' },
      { label: 'KDP 3D Preview', href: '/preview' },
    ],
  },
  {
    title: 'KDP Upload Error Fixes',
    description: 'Troubleshoot vague Amazon KDP PDF, cover, bleed, and previewer errors.',
    links: [
      { label: 'KDP Upload Error Fixes', href: '/blog/kdp-upload-error-fixes' },
      { label: 'KDP Cover Validator', href: '/kdp-cover-validator' },
      { label: 'KDP Glossary', href: '/kdp-glossary' },
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

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  const explicit = post.relatedPosts
    .map((slug) => getBlogPost(slug))
    .filter((related): related is BlogPost => Boolean(related));

  if (explicit.length >= 3) return explicit.slice(0, 3);

  const sameCategory = blogPosts.filter(
    (candidate) => candidate.slug !== post.slug && candidate.category === post.category,
  );

  return [...explicit, ...sameCategory].slice(0, 3);
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
