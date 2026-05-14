import { CheckCircle2 } from 'lucide-react';

export function BlogHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_30%),linear-gradient(180deg,color-mix(in_srgb,var(--surface)_72%,transparent),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary shadow-soft">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Guides for Amazon KDP creators
          </div>
          <h1 className="ds-heading text-balance text-[clamp(2.35rem,6vw,4.7rem)]">
            KDP Preflight Blog
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
            Practical guides to fix KDP cover issues, bleed errors, trim size problems,
            spine width mistakes, and print-ready formatting.
          </p>
        </div>
      </div>
    </section>
  );
}
