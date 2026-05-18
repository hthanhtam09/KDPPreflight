import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getBlogCategory } from '@/lib/blog-categories';
import type { BlogPost } from '@/types/blog';

export function RelatedArticles({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-articles-heading">
      <h2 id="related-articles-heading" className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Related guides
      </h2>
      <div className="mt-4 grid gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{getBlogCategory(post.category).label}</p>
            <h3 className="mt-2 text-sm font-bold leading-5 text-foreground transition group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{post.excerpt}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
              Read next
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
