import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-2xl bg-muted/55 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/8 before:to-transparent',
        className,
      )}
    />
  );
}

export function PageLoadingSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'blog' | 'checker' | 'preview';
}) {
  if (variant === 'checker') {
    return (
      <LoadingFrame label="Loading KDP checker workspace">
        <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-3 rounded-2xl border border-border bg-card/70 p-4 shadow-card">
            <LoadingSkeleton className="h-5 w-32 rounded-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-11/12" />
            <LoadingSkeleton className="h-28 w-full" />
            <LoadingSkeleton className="h-10 w-36" />
          </div>
          <div className="space-y-4 rounded-2xl border border-border bg-card/70 p-4 shadow-card">
            <LoadingSkeleton className="h-[320px] w-full" />
            <div className="grid gap-3 sm:grid-cols-3">
              <LoadingSkeleton className="h-20" />
              <LoadingSkeleton className="h-20" />
              <LoadingSkeleton className="h-20" />
            </div>
          </div>
        </div>
      </LoadingFrame>
    );
  }

  if (variant === 'blog') {
    return (
      <LoadingFrame label="Loading KDP guides">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-4 text-center">
            <LoadingSkeleton className="mx-auto h-4 w-36 rounded-full" />
            <LoadingSkeleton className="mx-auto h-12 w-full max-w-xl" />
            <LoadingSkeleton className="mx-auto h-5 w-full max-w-2xl" />
          </div>
          <LoadingSkeleton className="h-64 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <LoadingSkeleton className="h-48" />
            <LoadingSkeleton className="h-48" />
            <LoadingSkeleton className="h-48" />
          </div>
        </div>
      </LoadingFrame>
    );
  }

  if (variant === 'preview') {
    return (
      <LoadingFrame label="Loading 3D preview">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3 rounded-2xl border border-border bg-card/70 p-4 shadow-card">
            <LoadingSkeleton className="h-5 w-28 rounded-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-4/5" />
          </div>
          <LoadingSkeleton className="min-h-[420px] w-full" />
        </div>
      </LoadingFrame>
    );
  }

  return (
    <LoadingFrame label="Loading page">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <LoadingSkeleton className="h-4 w-36 rounded-full" />
          <LoadingSkeleton className="h-12 w-full max-w-2xl" />
          <LoadingSkeleton className="h-5 w-full max-w-3xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <LoadingSkeleton className="h-56" />
          <LoadingSkeleton className="h-56" />
          <LoadingSkeleton className="h-56" />
        </div>
      </div>
    </LoadingFrame>
  );
}

function LoadingFrame({
  label,
  children,
}: Readonly<{
  label: string;
  children: ReactNode;
}>) {
  return (
    <section className="ws-shell" aria-label={label} aria-busy="true">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <span className="sr-only">{label}</span>
        {children}
      </div>
    </section>
  );
}
