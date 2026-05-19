'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

type BlogStickySidebarProps = {
  children: React.ReactNode;
  className?: string;
  side: 'left' | 'right';
  width: number;
  scrollable?: boolean;
};

export function BlogStickySidebar({ children, className = '', side, width, scrollable = true }: BlogStickySidebarProps) {
  const [floating, setFloating] = useState(false);
  const [floatingTop, setFloatingTop] = useState(96);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    function updateFloating() {
      setFloating(mediaQuery.matches);
    }

    updateFloating();
    mediaQuery.addEventListener('change', updateFloating);

    return () => mediaQuery.removeEventListener('change', updateFloating);
  }, []);

  useEffect(() => {
    if (!floating) return;

    const articleElement = document.getElementById('blog-article-content');
    if (!(articleElement instanceof HTMLElement)) return;

    function updatePosition(article: HTMLElement) {
      const articleRect = article.getBoundingClientRect();
      const viewportTopOffset = 96;
      const viewportBottomPadding = 24;
      const sidebarMaxHeight = window.innerHeight - viewportTopOffset - viewportBottomPadding;
      const topLimitedByArticleStart = Math.max(viewportTopOffset, articleRect.top);
      const bottomLimitedTop = articleRect.bottom - sidebarMaxHeight;

      setFloatingTop(Math.min(topLimitedByArticleStart, bottomLimitedTop));
    }

    let frame = 0;
    const requestPositionUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => updatePosition(articleElement));
    };

    requestPositionUpdate();
    window.addEventListener('scroll', requestPositionUpdate, { passive: true });
    window.addEventListener('resize', requestPositionUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestPositionUpdate);
      window.removeEventListener('resize', requestPositionUpdate);
    };
  }, [floating]);

  const floatingStyle = floating
    ? ({
        position: 'fixed',
        top: `${floatingTop}px`,
        width: `${width}px`,
        zIndex: 20,
        ...(side === 'left'
          ? { left: 'max(24px, calc((100vw - 1280px) / 2 + 24px))' }
          : { right: 'max(24px, calc((100vw - 1280px) / 2 + 24px))' }),
      } as const)
    : undefined;

  return (
    <div
      style={floatingStyle}
      className={`space-y-8 ${scrollable ? 'lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1 [scrollbar-gutter:stable]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
