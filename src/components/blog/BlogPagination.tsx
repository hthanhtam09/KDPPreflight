import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildPageUrl } from '@/lib/blog/pagination';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) pages.push('ellipsis');

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);

  return pages;
}

const linkClass =
  'inline-flex h-10 items-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-muted-foreground shadow-soft transition hover:border-primary/30 hover:text-primary';
const disabledClass =
  'inline-flex h-10 cursor-not-allowed items-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-muted-foreground/40 opacity-50 shadow-soft';

export function BlogPagination({ currentPage, totalPages, baseUrl }: Readonly<BlogPaginationProps>) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const prevUrl = currentPage > 1 ? buildPageUrl(baseUrl, currentPage - 1) : null;
  const nextUrl = currentPage < totalPages ? buildPageUrl(baseUrl, currentPage + 1) : null;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5 py-10">
      {prevUrl ? (
        <Link href={prevUrl} rel="prev" aria-label="Previous page" className={linkClass}>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      <div className="flex flex-wrap items-center gap-1">
        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              aria-hidden="true"
              className="inline-flex h-10 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageUrl(baseUrl, page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition ${
                page === currentPage
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground shadow-soft hover:border-primary/30 hover:text-primary'
              }`}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      {nextUrl ? (
        <Link href={nextUrl} rel="next" aria-label="Next page" className={linkClass}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
