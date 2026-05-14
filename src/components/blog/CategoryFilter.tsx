'use client';

import type { BlogCategoryFilter } from '@/lib/blog';

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
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter blog posts by category">
      {categories.map((category) => {
        const active = category === activeCategory;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 ${
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
            aria-selected={active}
            role="tab"
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
