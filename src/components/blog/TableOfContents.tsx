'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import type { TocItem } from '@/lib/blog';

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [floating, setFloating] = useState(false);
  const [floatingTop, setFloatingTop] = useState(96);
  const activeIdRef = useRef(items[0]?.id ?? '');
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!items.length) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) return;

    const updateActive = () => {
      tickingRef.current = false;

      const activationY = window.scrollY + 170;
      let nextActiveId = headings[0].id;

      for (const heading of headings) {
        if (heading.offsetTop <= activationY) {
          nextActiveId = heading.id;
        } else {
          break;
        }
      }

      if (nextActiveId !== activeIdRef.current) {
        activeIdRef.current = nextActiveId;
        setActiveId(nextActiveId);
      }
    };

    const requestUpdate = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [items]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    function updateFloating() {
      setFloating(mediaQuery.matches);
    }

    updateFloating();
    mediaQuery.addEventListener('change', updateFloating);

    return () => mediaQuery.removeEventListener('change', updateFloating);
  }, []);

  useEffect(() => {
    if (!floating) return;

    const article = document.getElementById('blog-article-content');
    if (!article) return;

    function updatePosition() {
      const articleRect = article.getBoundingClientRect();
      const viewportTopOffset = 96;
      const viewportBottomPadding = 24;
      const tocMaxHeight = window.innerHeight - viewportTopOffset - viewportBottomPadding;
      const topLimitedByArticleStart = Math.max(viewportTopOffset, articleRect.top);
      const bottomLimitedTop = articleRect.bottom - tocMaxHeight;

      setFloatingTop(Math.min(topLimitedByArticleStart, bottomLimitedTop));
    }

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [floating]);

  const floatingStyle = floating
    ? ({
        position: 'fixed',
        top: `${floatingTop}px`,
        right: 'max(24px, calc((100vw - 1280px) / 2 + 24px))',
        width: '260px',
        zIndex: 20,
      } as const)
    : undefined;

  if (!items.length) return null;

  return (
    <div
      style={floatingStyle}
      className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-soft [scrollbar-gutter:stable]"
    >
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
          {items.map((item) => {
            const active = item.id === activeId;

            return (
              <li key={item.id} className={item.level === 3 ? 'pl-4' : undefined}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? 'location' : undefined}
                  className={`relative block rounded-lg border px-2 py-1.5 text-sm leading-5 transition ${
                    active
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  {active ? <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" /> : null}
                  <span className="block pl-2">{item.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
