import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { getBlogCategory } from '@/lib/blog-categories';
import { formatBlogDate } from '@/lib/blog/blog-utils';
import type { BlogPost } from '@/types/blog';
import { BlogPostVisual } from './BlogPostVisual';

export type BlogCardPost = Pick<
  BlogPost,
  'slug' | 'title' | 'excerpt' | 'category' | 'updatedAt' | 'publishedAt' | 'readingTime' | 'author'
>;

export function BlogCard({ post }: { post: BlogCardPost }) {
  const category = getBlogCategory(post.category);

  return (
    <article className="group h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="ds-card ds-card-interactive flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card"
      >
        <div className="relative h-40 overflow-hidden border-b border-border bg-muted/35">
          <BlogPostVisual postSlug={post.slug} category={category} />
          <div className="absolute inset-x-5 top-5 z-10 flex items-center justify-between gap-3">
            <span className="max-w-[calc(100%-7.5rem)] truncate rounded-full border border-primary/25 bg-card/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary shadow-soft backdrop-blur-md">
              {category.label}
            </span>
            <span className="shrink-0 rounded-full border border-border bg-card/95 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-soft backdrop-blur-md">
              {post.readingTime}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
            <time dateTime={post.updatedAt ?? post.publishedAt}>
              {formatBlogDate(post.updatedAt ?? post.publishedAt)}
            </time>
            <span aria-hidden="true">/</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
          <h2 className="text-lg font-bold leading-snug tracking-[-0.01em] text-foreground transition group-hover:text-primary">
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-xs font-medium text-muted-foreground">{post.author}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              Read guide
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
