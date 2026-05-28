'use client';

import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ErrorState } from '@/components/system/ErrorState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <title>Something went wrong | KDP Preflight</title>
      </head>
      <body className="notranslate antialiased" translate="no">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ErrorState
            tone="global"
            title="Something went wrong"
            description="We encountered an unexpected error while loading this page."
            error={error}
            reset={reset}
            context={{ boundary: 'global', route: 'app' }}
            secondaryActions={[
              { label: 'Go Home', href: '/' },
              { label: 'KDP Preflight', href: '/preflight' },
            ]}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
