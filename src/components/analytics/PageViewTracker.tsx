'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const payload = JSON.stringify({ path, referrer: document.referrer || undefined });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/page-view', new Blob([payload], { type: 'application/json' }));
      return;
    }

    void fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  }, [pathname, searchParams]);

  return null;
}

