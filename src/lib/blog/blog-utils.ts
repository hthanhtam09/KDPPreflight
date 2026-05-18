import type { TocItem } from '@/types/blog';

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getTableOfContents(markdown: string): TocItem[] {
  const headingPattern = /^(##|###)\s+(.+)$/gm;
  const items: TocItem[] = [];
  const usedIds = new Map<string, number>();
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(markdown)) !== null) {
    const title = match[2].replace(/\*\*/g, '').trim();
    const baseId = slugifyHeading(title);
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);

    items.push({
      id: count ? `${baseId}-${count + 1}` : baseId,
      title,
      level: match[1] === '##' ? 2 : 3,
    });
  }

  return items;
}
