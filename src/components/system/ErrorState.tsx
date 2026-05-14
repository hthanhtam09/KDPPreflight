'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bug,
  FileWarning,
  Home,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { reportClientError, sanitizeMessage, type ErrorReportContext } from '@/lib/error-reporting';
import { useNetworkStatus, useOnlineRecovery } from '@/lib/network';
import { cn } from '@/lib/utils';

export type ErrorStateTone = 'global' | 'not-found' | 'checker' | 'preview' | 'blog';

type ErrorStateProps = {
  tone?: ErrorStateTone;
  title: string;
  description: string;
  error?: Error & { digest?: string };
  reset?: () => void;
  context?: ErrorReportContext;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryActions?: Array<{
    label: string;
    href: string;
  }>;
  showSearch?: boolean;
  showQuickLinks?: boolean;
  className?: string;
};

const quickLinks = [
  { href: '/checker', label: 'Checker' },
  { href: '/preview', label: 'Preview' },
  { href: '/blog', label: 'Blog' },
  { href: '/kdp-trim-size-calculator', label: 'Trim Size Guide' },
];

const toneIcons: Record<ErrorStateTone, ReactNode> = {
  global: <AlertTriangle className="h-5 w-5" />,
  'not-found': <FileWarning className="h-5 w-5" />,
  checker: <ShieldCheck className="h-5 w-5" />,
  preview: <Sparkles className="h-5 w-5" />,
  blog: <BookOpen className="h-5 w-5" />,
};

export function ErrorState({
  tone = 'global',
  title,
  description,
  error,
  reset,
  context,
  primaryAction,
  secondaryActions = [],
  showSearch = false,
  showQuickLinks = false,
  className,
}: ErrorStateProps) {
  const [errorId, setErrorId] = useState<string | null>(error?.digest ? `next_${error.digest.slice(0, 18)}` : null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const network = useNetworkStatus();

  useEffect(() => {
    if (!error) return;

    let mounted = true;
    void reportClientError(error, context).then((id) => {
      if (mounted) setErrorId(id);
    });

    return () => {
      mounted = false;
    };
  }, [context, error]);

  useEffect(() => {
    if (!error || typeof document === 'undefined') return;

    const selector = 'meta[name="robots"][data-kdp-fallback="true"]';
    const existing = document.head.querySelector<HTMLMetaElement>(selector);
    const meta = existing ?? document.createElement('meta');

    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    meta.dataset.kdpFallback = 'true';

    if (!existing) document.head.append(meta);
  }, [error]);

  useOnlineRecovery(() => {
    if (reset) reset();
  }, Boolean(reset));

  const fallbackPrimary = useMemo(() => {
    if (primaryAction) return primaryAction;
    if (reset) return { label: 'Try Again', onClick: reset };
    return { label: 'Back to Home', href: '/' };
  }, [primaryAction, reset]);

  return (
    <section className={cn('relative isolate overflow-hidden bg-background', className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_55%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-var(--app-current-header-height))] max-w-6xl place-items-center px-4 py-16 sm:px-6">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface-glass px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground shadow-soft backdrop-blur-xl lg:mx-0">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/12 text-primary">
                {toneIcons[tone]}
              </span>
              KDPPreflight fallback
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
              {description}
            </p>

            {!network.online ? (
              <div className="mx-auto mt-5 rounded-2xl border border-warning/25 bg-warning/10 p-4 text-left shadow-soft lg:mx-0">
                <p className="text-sm font-bold text-foreground">You are offline</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  This page may recover automatically once your connection is restored.
                </p>
              </div>
            ) : null}

            {showSearch ? <NotFoundSearch /> : null}

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <PrimaryAction action={fallbackPrimary} />
              {secondaryActions.map((action) => (
                <Button key={action.href} asChild variant="outline" size="lg" className="rounded-xl">
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>

            {showQuickLinks ? (
              <nav className="mt-8" aria-label="Suggested pages">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Quick links
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="ds-focus rounded-full border border-border bg-surface-glass px-3 py-1.5 text-sm font-semibold text-muted-foreground shadow-soft backdrop-blur-xl transition hover:border-primary/30 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ) : null}

            {error ? (
              <div className="mt-7 text-left">
                <button
                  type="button"
                  onClick={() => setDetailsOpen((open) => !open)}
                  className="ds-focus inline-flex items-center gap-2 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground"
                  aria-expanded={detailsOpen}
                >
                  <Bug className="h-4 w-4" />
                  Technical details
                </button>
                {detailsOpen ? (
                  <div className="mt-3 rounded-2xl border border-border bg-card/70 p-4 text-sm shadow-card">
                    <p className="font-mono text-xs text-muted-foreground">
                      Error ID: <span className="text-foreground">{errorId ?? 'pending'}</span>
                    </p>
                    {process.env.NODE_ENV !== 'production' ? (
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {sanitizeMessage(error.message)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <ErrorIllustration tone={tone} />
        </div>
      </div>
    </section>
  );
}

function PrimaryAction({
  action,
}: {
  action: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}) {
  if (action.href) {
    return (
      <Button asChild size="lg" className="rounded-xl">
        <Link href={action.href}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button type="button" size="lg" className="rounded-xl" onClick={action.onClick}>
      <RefreshCw className="h-4 w-4" />
      {action.label}
    </Button>
  );
}

function NotFoundSearch() {
  return (
    <form action="/blog" className="mx-auto mt-7 max-w-xl lg:mx-0" role="search">
      <label htmlFor="fallback-search" className="sr-only">
        Search guides or tools
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-glass p-2 shadow-card backdrop-blur-xl">
        <Search className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          id="fallback-search"
          name="q"
          placeholder="Search guides or tools"
          className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="submit" variant="outline" className="rounded-xl">
          Search
        </Button>
      </div>
    </form>
  );
}

function ErrorIllustration({ tone }: { tone: ErrorStateTone }) {
  const accent =
    tone === 'checker' ? 'var(--success)' : tone === 'preview' ? 'var(--primary)' : 'var(--warning)';

  return (
    <div className="relative mx-auto hidden h-[420px] w-full max-w-[500px] lg:block" aria-hidden="true">
      <div className="absolute inset-10 rounded-[2rem] border border-border bg-surface-glass shadow-elevated backdrop-blur-2xl" />
      <div className="absolute left-12 top-14 h-28 w-40 animate-[float_7s_ease-in-out_infinite] rounded-2xl border border-border bg-card shadow-card" />
      <div className="absolute right-16 top-20 h-20 w-32 animate-[float_8s_ease-in-out_infinite] rounded-2xl border border-border bg-card/80 shadow-card [animation-delay:900ms]" />
      <div className="absolute bottom-16 left-16 h-24 w-36 animate-[float_9s_ease-in-out_infinite] rounded-2xl border border-border bg-card/80 shadow-card [animation-delay:1400ms]" />
      <div className="absolute bottom-20 right-12 h-32 w-44 rounded-2xl border border-border bg-card shadow-card">
        <div className="m-4 h-3 w-20 rounded-full bg-muted" />
        <div className="mx-4 mt-3 h-2 w-28 rounded-full bg-muted/70" />
        <div className="mx-4 mt-2 h-2 w-20 rounded-full bg-muted/60" />
      </div>
      <div
        className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-border bg-background shadow-elevated"
        style={{ color: accent }}
      >
        <Wrench className="h-9 w-9" />
      </div>
      <div className="absolute left-[34%] top-[41%] h-px w-20 rotate-[-18deg] bg-border" />
      <div className="absolute right-[32%] top-[45%] h-px w-20 rotate-[20deg] bg-border" />
      <div className="absolute bottom-[36%] left-[36%] h-px w-24 rotate-[24deg] bg-border" />
    </div>
  );
}
