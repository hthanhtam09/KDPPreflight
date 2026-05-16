import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { formatBlogDate, getBlogCategory, type BlogPost } from '@/lib/blog';
import { BlogPostVisual } from './BlogPostVisual';

export function FeaturedPostCard({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated">
      <Link href={`/blog/${post.slug}`} className="grid min-h-[360px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-[260px] overflow-hidden border-b border-border bg-muted/30 lg:border-b-0 lg:border-r">
          <BlogPostVisual postSlug={post.slug} category={category} variant="featured" />
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-bold uppercase tracking-[0.14em] text-primary">
              {category.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 font-semibold">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatBlogDate(post.updatedAt ?? post.publishedAt)}
            </span>
          </div>
          <h2 className="max-w-2xl text-2xl font-bold leading-tight tracking-[-0.025em] text-foreground sm:text-3xl">
            {post.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {post.excerpt}
          </p>
          <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition group-hover:-translate-y-0.5">
            Read guide
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
}
