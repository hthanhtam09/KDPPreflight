import fs from 'node:fs';
import path from 'node:path';
import { blogCategories } from '@/lib/blog-categories';
import { glossaryTerms } from '@/lib/glossary-data';
import { toolPages } from '@/lib/tool-pages';
import type { BlogPost, BlogPostSource } from '@/types/blog';
import { blogTools } from './blog-tools';

const categorySlugs = new Set(blogCategories.map((category) => category.slug));
const toolHrefs = new Set(toolPages.map((tool) => `/tools/${tool.slug}`));
const glossaryHrefs = new Set(glossaryTerms.map((term) => `/glossary/${term.slug}`));
const staticInternalRoutes = new Set([
  '/',
  '/about',
  '/blog',
  '/checker',
  '/faq',
  '/glossary',
  '/preview',
  '/setup',
  '/tools',
  '/tools/kdp-cover-checker',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireString(source: Record<string, unknown>, key: string, filePath: string): string {
  const value = source[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Blog content validation failed in ${filePath}: missing required string "${key}"`);
  }
  return value;
}

function requireStringArray(source: Record<string, unknown>, key: string, filePath: string): string[] {
  const value = source[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`Blog content validation failed in ${filePath}: "${key}" must be a string array`);
  }
  return value;
}

export function validateBlogSource(raw: unknown, expectedSlug: string, filePath: string): BlogPostSource {
  if (!isRecord(raw)) throw new Error(`Blog content validation failed in ${filePath}: content must be an object`);

  const title = requireString(raw, 'title', filePath);
  const slug = typeof raw.slug === 'string' && raw.slug.trim() ? raw.slug : expectedSlug;
  const category = requireString(raw, 'category', filePath);

  if (slug !== expectedSlug) {
    throw new Error(`Blog content validation failed in ${filePath}: slug "${slug}" must match filename "${expectedSlug}"`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Blog content validation failed in ${filePath}: invalid slug "${slug}"`);
  }

  if (!categorySlugs.has(category as never)) {
    throw new Error(`Blog content validation failed in ${filePath}: invalid category "${category}"`);
  }

  const source = raw as BlogPostSource;
  const faqs = source.faqs ?? [];
  if (!Array.isArray(faqs) || faqs.some((faq) => !faq.question?.trim() || !faq.answer?.trim())) {
    throw new Error(`Blog content validation failed in ${filePath}: faqs must include question and answer strings`);
  }

  const relatedToolKeys = source.relatedToolKeys ?? [];
  for (const key of relatedToolKeys) {
    if (!(key in blogTools)) {
      throw new Error(`Blog content validation failed in ${filePath}: unknown relatedToolKey "${key}"`);
    }
  }

  return {
    ...source,
    title,
    slug,
    category: category as BlogPostSource['category'],
    description: requireString(raw, 'description', filePath),
    excerpt: requireString(raw, 'excerpt', filePath),
    tags: requireStringArray(raw, 'tags', filePath),
    keywords: requireStringArray(raw, 'keywords', filePath),
    publishedAt: requireString(raw, 'publishedAt', filePath),
    updatedAt: requireString(raw, 'updatedAt', filePath),
    author: requireString(raw, 'author', filePath),
    shortAnswer: requireString(raw, 'shortAnswer', filePath),
    summary: requireStringArray(raw, 'summary', filePath),
    checklist: requireStringArray(raw, 'checklist', filePath),
    content: requireString(raw, 'content', filePath),
    faqs,
    diagrams: source.diagrams ?? [],
    relatedGuides: source.relatedGuides ?? [],
    relatedToolKeys,
  };
}

export function validateBlogCollection(posts: BlogPost[], contentRoot: string): void {
  const seenSlugs = new Set<string>();
  const liveSlugs = new Set(posts.filter((post) => !post.draft).map((post) => post.slug));

  for (const post of posts) {
    if (seenSlugs.has(post.slug)) throw new Error(`Duplicate blog slug: ${post.slug}`);
    seenSlugs.add(post.slug);

    validateOptionalImage(post.coverImage, post.slug, contentRoot);
    validateOptionalImage(post.ogImage, post.slug, contentRoot);

    for (const relatedSlug of post.relatedPosts) {
      if (!liveSlugs.has(relatedSlug)) {
        throw new Error(`Blog post "${post.slug}" links to missing or draft related post "${relatedSlug}"`);
      }
    }

    for (const href of findInternalHrefs(post)) {
      validateInternalHref(href, post.slug, liveSlugs);
    }
  }
}

function validateOptionalImage(imagePath: string | undefined, slug: string, contentRoot: string): void {
  if (!imagePath) return;
  if (!imagePath.startsWith('/')) throw new Error(`Blog post "${slug}" image path must start with "/": ${imagePath}`);

  const publicPath = path.join(contentRoot, '..', '..', 'public', imagePath);
  if (!fs.existsSync(publicPath)) throw new Error(`Blog post "${slug}" references missing image: ${imagePath}`);
}

function findInternalHrefs(post: BlogPost): string[] {
  const markdownLinks = [...post.content.matchAll(/\]\((\/[^)\s#]+)(?:#[^)]+)?\)/g)].map((match) => match[1]);
  const guideLinks = post.relatedGuides.map((guide) => guide.href).filter((href) => href.startsWith('/'));
  const toolLinks = post.relatedTools.map((tool) => tool.href).filter((href) => href.startsWith('/'));
  return [...markdownLinks, ...guideLinks, ...toolLinks];
}

function validateInternalHref(href: string, sourceSlug: string, liveSlugs: Set<string>): void {
  if (staticInternalRoutes.has(href) || toolHrefs.has(href) || glossaryHrefs.has(href)) return;

  if (href.startsWith('/blog/category/')) {
    const categorySlug = href.replace('/blog/category/', '');
    if (categorySlugs.has(categorySlug as never)) return;
  }

  if (href.startsWith('/blog/')) {
    const slug = href.replace('/blog/', '');
    if (liveSlugs.has(slug)) return;
  }

  throw new Error(`Blog post "${sourceSlug}" contains broken internal link: ${href}`);
}
