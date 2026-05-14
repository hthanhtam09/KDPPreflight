import Link from 'next/link';
import { ArrowRight, FileCheck2 } from 'lucide-react';

export function BlogCTA({
  title = 'Check your KDP cover before uploading',
  description = 'Scan the exported PDF for bleed, trim size, spine width, safe area, and print-readiness before Amazon KDP reviews it.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          <Link
            href="/checker"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
          >
            <FileCheck2 className="h-4 w-4" />
            Open Free KDP Cover Checker
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
