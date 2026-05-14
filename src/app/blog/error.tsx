'use client';

import { ErrorState } from '@/components/system/ErrorState';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      tone="blog"
      title="This guide could not be loaded."
      description="The KDP guide library hit a temporary issue. You can retry the page or return to the main guide index."
      error={error}
      reset={reset}
      context={{ boundary: 'route', route: '/blog' }}
      secondaryActions={[
        { label: 'Browse Guides', href: '/blog' },
        { label: 'Open KDP Checker', href: '/checker' },
      ]}
    />
  );
}
