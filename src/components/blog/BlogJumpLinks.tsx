import type { TocItem } from '@/types/blog';

export function BlogJumpLinks({ items }: { items: TocItem[] }) {
  const h2Items = items.filter((item) => item.level === 2).slice(0, 6);
  if (!h2Items.length) return null;

  return (
    <nav aria-label="Jump to section" className="mb-8 flex flex-wrap gap-2">
      {h2Items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
