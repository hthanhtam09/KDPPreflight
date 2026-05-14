'use client';

import { useMemo, useState } from 'react';
import type { BlogCategoryFilter, BlogPost } from '@/lib/blog';
import { blogCategories } from '@/lib/blog';
import { BlogCard } from './BlogCard';
import { CategoryFilter } from './CategoryFilter';

export function BlogIndexExperience({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<BlogCategoryFilter>('All');
  const filteredPosts = useMemo(
    () =>
      activeCategory === 'All'
        ? posts
        : posts.filter((post) => post.category === activeCategory),
    [activeCategory, posts],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="all-guides-heading">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="ds-eyebrow">Resource library</p>
          <h2 id="all-guides-heading" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-foreground">
            Browse KDP guides by problem
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Filter by the exact publishing issue you are trying to solve before uploading to Amazon KDP.
          </p>
        </div>
        <CategoryFilter
          categories={blogCategories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      {!filteredPosts.length && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <p className="text-base font-bold text-foreground">Trim size guides are being grouped into the cover size path.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Start with the KDP cover size guide or the trim size calculator to calculate print-ready dimensions.
          </p>
        </div>
      )}
    </section>
  );
}
