import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, ScanLine } from 'lucide-react';

const quickLinks = [
  { label: 'Cover rejected', href: '/blog/category/cover-rejections' },
  { label: 'Printable area error', href: '/blog/category/safe-area' },
  { label: 'Missing bleed', href: '/blog/category/bleed-issues' },
  { label: 'Spine width', href: '/blog/category/spine-width' },
];

export function BlogHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_30%),linear-gradient(180deg,color-mix(in_srgb,var(--surface)_72%,transparent),transparent)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end lg:py-24">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary shadow-soft">
            <CheckCircle2 className="h-3.5 w-3.5" />
            KDP troubleshooting knowledge hub
          </div>
          <h1 className="ds-heading text-balance text-[clamp(2.35rem,6vw,4.7rem)]">
            Fix KDP Cover Problems Before Amazon Rejects Your Upload
          </h1>
          <p className="mt-4 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:mt-6 sm:text-xl">
            Practical guides for bleed issues, printable area errors, spine width problems, safe area mistakes,
            PDF export settings, and KDP cover rejection fixes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground shadow-soft transition hover:border-primary/30 hover:text-foreground"
              >
                {link.label}
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </Link>
            ))}
          </div>
        </div>

        <div className="group rounded-3xl border border-primary/15 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card)),var(--card)_48%,color-mix(in_srgb,var(--warning)_8%,var(--card)))] p-5 shadow-card transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-background/80 text-primary shadow-soft">
              <FileCheck2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                <ScanLine className="h-3.5 w-3.5" />
                Auto-detect issues
              </span>
              <h2 className="mt-3 text-xl font-bold tracking-[-0.02em] text-foreground">
                Most KDP rejections come from sizing mistakes
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Even beautiful covers get rejected when bleed, trim size, spine width, safe area, or export settings do not match KDP's print requirements.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 rounded-2xl border border-border/70 bg-background/55 p-3 text-xs font-semibold text-muted-foreground sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Bleed and trim
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Spine width
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Safe area
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              PDF export
            </span>
          </div>

          <p className="mt-4 text-sm font-medium leading-6 text-foreground">
            Check your PDF before uploading to KDP.
          </p>
          <Link
            href="/tools/kdp-cover-checker"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            Analyze Cover PDF
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
