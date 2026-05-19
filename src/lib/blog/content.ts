import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import type { BlogPost, BlogPostSource } from '@/types/blog';
import { blogTools, type BlogToolKey } from './blog-tools';
import { calculateReadingTime } from './reading-time';
import { getRelatedBlogPosts } from './related-posts';
import { validateBlogCollection, validateBlogSource } from './validation';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function findContentFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return findContentFiles(entryPath);
      return entry.isFile() && entry.name.endsWith('.json') ? [entryPath] : [];
    })
    .sort();
}

function readSourceFile(filePath: string): BlogPostSource {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  const expectedSlug = path.basename(filePath, '.json');
  return validateBlogSource(raw, expectedSlug, filePath);
}

function normalizePost(source: BlogPostSource): BlogPost {
  const readingTime = calculateReadingTime(`${source.content}\n${source.faqs.map((faq) => `${faq.question} ${faq.answer}`).join('\n')}`);
  const toolKeys = source.relatedToolKeys ?? [];

  return {
    ...source,
    slug: source.slug ?? '',
    readingTime: readingTime.label,
    readingTimeMinutes: readingTime.minutes,
    relatedTools: toolKeys.map((key) => blogTools[key as BlogToolKey]).filter(Boolean),
    relatedPosts: [],
  };
}

function loadBlogPosts(): BlogPost[] {
  const posts = findContentFiles(BLOG_CONTENT_DIR)
    .map(readSourceFile)
    .map(normalizePost)
    .filter((post) => !post.draft)
    .sort((a, b) => {
      const publishedDelta = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (publishedDelta !== 0) return publishedDelta;
      const priorityDelta = (b.sortPriority ?? 0) - (a.sortPriority ?? 0);
      if (priorityDelta !== 0) return priorityDelta;
      return a.title.localeCompare(b.title);
    });

  const withGeneratedRelated = posts.map((post) => {
    const automatic = getRelatedBlogPosts(post, posts, 8).map((related) => related.slug);
    const relatedPosts = [...new Set(automatic)].filter((slug) => slug !== post.slug).slice(0, 6);
    return { ...post, relatedPosts };
  });

  validateBlogCollection(withGeneratedRelated, BLOG_CONTENT_DIR);
  return withGeneratedRelated;
}

export const blogPosts = loadBlogPosts();
