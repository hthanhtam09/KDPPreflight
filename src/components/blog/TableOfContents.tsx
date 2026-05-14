'use client';

import { useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import type { TocItem } from '@/lib/blog';

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft lg:sticky lg:top-28">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left lg:pointer-events-none"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
          <ListTree className="h-4 w-4 text-primary" />
          On this page
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition lg:hidden ${open ? 'rotate-180' : ''}`} />
      </button>
      <nav className={`${open ? 'mt-4 block' : 'hidden'} lg:mt-4 lg:block`} aria-label="Article table of contents">
        <ol className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? 'pl-4' : undefined}>
              <a
                href={`#${item.id}`}
                className="block rounded-lg px-2 py-1.5 text-sm leading-5 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
