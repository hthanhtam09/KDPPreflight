'use client';

import { useEffect, useRef, useState } from 'react';

export function BlogReadingProgress({ articleId }: { articleId: string }) {
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    const update = () => {
      tickingRef.current = false;
      const rect = article.getBoundingClientRect();
      const scrolled = -rect.top;
      const scrollable = rect.height - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (scrolled / scrollable) * 100)) : 0;
      setProgress(pct);
    };

    const requestUpdate = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    return () => window.removeEventListener('scroll', requestUpdate);
  }, [articleId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 h-[3px] bg-primary"
      style={{ width: `${progress}%`, willChange: 'width', transition: 'width 60ms linear' }}
    />
  );
}
