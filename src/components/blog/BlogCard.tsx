import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { formatBlogDate, type BlogPost } from '@/lib/blog';

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="ds-card ds-card-interactive flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card"
      >
        <div className="relative h-36 overflow-hidden border-b border-border bg-muted/35">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_44%),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-[length:auto,28px_28px,28px_28px]" />
          <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              {post.category}
            </span>
            <span className="rounded-full border border-border bg-background/75 px-3 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur">
              {post.readingTime}
            </span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 h-10 rounded-xl border border-border bg-card/80 shadow-soft backdrop-blur transition group-hover:translate-y-[-2px]" />
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
