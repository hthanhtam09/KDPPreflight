'use client';

import { useMemo, useState } from 'react';
import type React from 'react';
import { Search } from 'lucide-react';
import { blogCategoryFilters, getBlogCategory, type BlogCategoryFilter } from '@/lib/blog-categories';
import type { BlogPost } from '@/types/blog';
import { BlogCard } from './BlogCard';
import { CategoryFilter } from './CategoryFilter';

export function BlogIndexExperience({ posts, footer }: { posts: BlogPost[]; footer?: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<BlogCategoryFilter>('all');
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return posts.filter((post) => {
      const categoryMatch = activeCategory === 'all' || post.category === activeCategory;
      if (!categoryMatch) return false;
      if (!normalized) return true;

      const category = getBlogCategory(post.category);
      return [post.title, post.description, post.excerpt, category.label, ...post.keywords, ...post.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [activeCategory, posts, query]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="all-guides-heading">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="ds-eyebrow">Resource library</p>
          <h2 id="all-guides-heading" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-foreground">
            Browse KDP guides by problem
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Search by the exact Amazon KDP publishing problem you are trying to solve.
          </p>
        </div>
        <div className="w-full max-w-xl space-y-3 lg:max-w-2xl">
          <label className="relative block">
            <span className="sr-only">Search KDP guides</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bleed, spine, Canva, printable area..."
              className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm font-medium text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <CategoryFilter categories={blogCategoryFilters} activeCategory={activeCategory} onChange={setActiveCategory} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      {!filteredPosts.length && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          {posts.length ? (
            <>
              <p className="text-base font-bold text-foreground">No guide matched that search.</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Try &ldquo;bleed,&rdquo; &ldquo;spine,&rdquo; &ldquo;Canva,&rdquo; &ldquo;safe area,&rdquo; or &ldquo;cover rejected.&rdquo;
              </p>
            </>
          ) : (
            <p className="text-base font-bold text-foreground">New KDP formatting guides are coming soon.</p>
          )}
        </div>
      )}
      {footer}
    </section>
  );
}
