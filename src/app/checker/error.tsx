'use client';

import { ErrorState } from '@/components/system/ErrorState';

export default function CheckerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      tone="checker"
      title="The cover validation tool failed to load."
      description="Your files remain private in the browser. Retry the checker workspace or restart from the setup flow."
      error={error}
      reset={reset}
      context={{ boundary: 'route', route: '/checker' }}
      secondaryActions={[
        { label: 'Open Setup', href: '/setup' },
        { label: 'Browse KDP Guides', href: '/blog' },
      ]}
    />
  );
}
