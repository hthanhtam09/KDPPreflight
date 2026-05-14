'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { RefreshCw, RotateCcw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/lib/network';

export function OfflineBanner() {
  const { online, retryConnection, reloadPage } = useNetworkStatus();
  const [checking, setChecking] = useState(false);
  const [recentlyRestored, setRecentlyRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setRecentlyRestored(true);
      window.setTimeout(() => setRecentlyRestored(false), 2600);
    };
    const handleOffline = () => setRecentlyRestored(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const visible = !online || recentlyRestored;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {visible ? (
          <m.aside
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-3 z-[var(--z-overlay)] mx-auto max-w-xl rounded-2xl border border-border bg-surface-glass p-3 shadow-elevated backdrop-blur-2xl sm:bottom-5"
            role="status"
            aria-live="polite"
          >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-muted/40 text-primary">
                <WifiOff className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {online ? 'Connection restored' : 'You are offline'}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {online
                    ? 'KDPPreflight is back online.'
                    : 'Some features may not work until your connection is restored.'}
                </p>
              </div>
            </div>

            {!online ? (
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={checking}
                  onClick={async () => {
                    setChecking(true);
                    await retryConnection();
                    setChecking(false);
                  }}
                >
                  <RefreshCw className={checking ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                  Retry connection
                </Button>
                <Button type="button" size="sm" className="rounded-xl" onClick={reloadPage}>
                  <RotateCcw className="h-4 w-4" />
                  Reload page
                </Button>
              </div>
            ) : null}
          </div>
          </m.aside>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}
