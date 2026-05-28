'use client';

import { ErrorState } from '@/components/system/ErrorState';

export default function PreviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      tone="preview"
      title="Unable to render book preview."
      description="The 3D preview studio could not initialize. Retry the render or return to the checker with your book specs."
      error={error}
      reset={reset}
      context={{ boundary: 'route', route: '/preview' }}
      secondaryActions={[
        { label: 'KDP Preflight', href: '/preflight' },
        { label: 'Browse Guides', href: '/blog' },
      ]}
    />
  );
}
