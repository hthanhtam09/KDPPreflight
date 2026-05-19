import type { BlogCategorySlug } from '@/lib/blog-categories';
import {
  blogCategories,
  blogCategoryFilters,
  getBlogCategory,
  type BlogCategory,
  type BlogCategoryFilter,
} from '@/lib/blog-categories';
import type { BlogGuideLink, BlogPost } from '@/types/blog';
import { blogPosts } from './content';
import { blogTools } from './blog-tools';
import { formatBlogDate, getTableOfContents, slugifyHeading } from './blog-utils';
import { getRelatedBlogPosts } from './related-posts';

export type {
  BlogFAQ,
  BlogGuideLink,
  BlogPost,
  BlogToolLink,
  TocItem,
} from '@/types/blog';
export type { BlogCategory, BlogCategoryFilter, BlogCategorySlug } from '@/lib/blog-categories';
export { blogCategories, blogCategoryFilters, blogPosts, blogTools, formatBlogDate, getBlogCategory, getTableOfContents, slugifyHeading };
export { buildPageUrl, getBlogPageCount, paginateItems, POSTS_PER_PAGE } from './pagination';
export type { PaginatedResult } from './pagination';

export const topicClusters: {
  title: string;
  description: string;
  category: BlogCategorySlug;
  links: BlogGuideLink[];
}[] = [];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts[0];
}

export function getPostsByCategory(category: BlogCategorySlug): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return getRelatedBlogPosts(post, blogPosts, limit);
}
