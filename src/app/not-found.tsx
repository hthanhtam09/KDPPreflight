import type { Metadata } from 'next';
import { ErrorState } from '@/components/system/ErrorState';

export const metadata: Metadata = {
  title: {
    absolute: '404 - Page Not Found | KDP Preflight',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NotFound() {
  return (
    <ErrorState
      tone="not-found"
      title="Page Not Found"
      description="The page you’re looking for may have been moved, deleted, or never existed."
      primaryAction={{ label: 'Back to Home', href: '/' }}
      secondaryActions={[
        { label: 'Open KDP Checker', href: '/checker' },
        { label: 'Browse Guides', href: '/blog' },
      ]}
      showSearch
      showQuickLinks
    />
  );
}
