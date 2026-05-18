import type { Metadata } from 'next';
import type { BlogPost } from '@/types/blog';
import { SITE_URL, generateBlogMetadata } from '@/lib/seo';

export function getBlogPostMetadata(post: BlogPost): Metadata {
  return generateBlogMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.description,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    slug: post.slug,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    keywords: post.keywords,
    ogImage: post.ogImage,
    ogImageAlt: post.ogImageAlt,
  });
}

export function getBlogCanonicalUrl(post: BlogPost): string {
  return `${SITE_URL}/blog/${post.slug}`;
}
