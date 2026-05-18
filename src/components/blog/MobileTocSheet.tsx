'use client';

import { useEffect, useRef, useState } from 'react';
import { ListTree, X } from 'lucide-react';
import type { TocItem } from '@/types/blog';

export function MobileTocSheet({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const activeIdRef = useRef(items[0]?.id ?? '');
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!items.length) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((h): h is HTMLElement => Boolean(h));

    if (!headings.length) return;

    const update = () => {
      tickingRef.current = false;
      const activationY = window.scrollY + 170;
      let next = headings[0].id;
      for (const h of headings) {
        if (h.offsetTop <= activationY) next = h.id;
        else break;
      }
      if (next !== activeIdRef.current) {
        activeIdRef.current = next;
        setActiveId(next);
      }
    };

    const requestUpdate = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    return () => window.removeEventListener('scroll', requestUpdate);
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-lg transition hover:border-primary/30 hover:text-primary"
        aria-label="Open table of contents"
      >
        <ListTree className="h-4 w-4 text-primary" />
        Contents
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Table of contents"
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-6 shadow-xl transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <ListTree className="h-4 w-4 text-primary" />
            On this page
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav aria-label="Article sections">
          <ol className="space-y-2">
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id} className={item.level === 3 ? 'pl-4' : undefined}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'location' : undefined}
                    className={`relative block rounded-lg border px-2 py-1.5 text-sm leading-5 transition ${
                      active
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                    ) : null}
                    <span className="block pl-2">{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
