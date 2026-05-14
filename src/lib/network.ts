'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

type NetworkSnapshot = {
  online: boolean;
  supported: boolean;
};

const serverSnapshot: NetworkSnapshot = {
  online: true,
  supported: false,
};

const onlineSnapshot: NetworkSnapshot = {
  online: true,
  supported: true,
};

const offlineSnapshot: NetworkSnapshot = {
  online: false,
  supported: true,
};

export function useNetworkStatus(): NetworkSnapshot & {
  retryConnection: () => Promise<boolean>;
  reloadPage: () => void;
} {
  const snapshot = useSyncExternalStore(
    subscribeToNetwork,
    getNetworkSnapshot,
    () => serverSnapshot,
  );

  const retryConnection = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    try {
      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store',
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const reloadPage = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  return {
    ...snapshot,
    retryConnection,
    reloadPage,
  };
}

export function useOnlineRecovery(onRecover: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    window.addEventListener('online', onRecover);
    return () => window.removeEventListener('online', onRecover);
  }, [enabled, onRecover]);
}

function subscribeToNetwork(onStoreChange: () => void) {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);

  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

function getNetworkSnapshot(): NetworkSnapshot {
  if (typeof navigator === 'undefined') return serverSnapshot;

  return navigator.onLine ? onlineSnapshot : offlineSnapshot;
}
