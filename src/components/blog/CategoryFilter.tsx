'use client';

import { getBlogCategory, type BlogCategoryFilter } from '@/lib/blog-categories';

export function CategoryFilter({
  categories,
  activeCategory,
  onChange,
}: {
  categories: readonly BlogCategoryFilter[];
  activeCategory: BlogCategoryFilter;
  onChange: (category: BlogCategoryFilter) => void;
}) {
  return (
    <div className="hide-scrollbar -mx-4 flex overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 gap-2" role="tablist" aria-label="Filter blog posts by category">
      {categories.map((category) => {
        const active = category === activeCategory;
        const label = category === 'all' ? 'All guides' : getBlogCategory(category).label;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 ${
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
            aria-selected={active}
            role="tab"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
