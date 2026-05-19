import type { ArticleDiagramType } from '@/components/blog/ArticleDiagram';
import type { BlogCategorySlug } from '@/lib/blog-categories';

export type BlogToolLink = {
  label: string;
  href: string;
  description: string;
};

export type BlogGuideLink = {
  label: string;
  href: string;
};

export type BlogFAQ = {
  question: string;
  answer: string;
};

export type BlogHowTo = {
  name: string;
  description: string;
  totalTime?: string;
  steps: {
    name: string;
    text: string;
    url?: string;
  }[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageAlt?: string;
  excerpt: string;
  category: BlogCategorySlug;
  tags: string[];
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  readingTimeMinutes: number;
  sortPriority?: number;
  featured?: boolean;
  draft?: boolean;
  author: string;
  shortAnswer: string;
  coverImage?: string;
  ogImage?: string;
  relatedTools: BlogToolLink[];
  relatedPosts: string[];
  relatedGuides: BlogGuideLink[];
  faqs: BlogFAQ[];
  summary: string[];
  checklist: string[];
  howTo?: BlogHowTo;
  diagrams: ArticleDiagramType[];
  content: string;
};

export type BlogPostSource = Omit<BlogPost, 'readingTime' | 'readingTimeMinutes' | 'relatedTools' | 'relatedPosts'> & {
  slug?: string;
  readingTime?: string;
  readingTimeMinutes?: number;
  relatedToolKeys?: string[];
};

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};
