import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

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
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-24">
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

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Most common upload blocker</p>
              <p className="text-xs leading-5 text-muted-foreground">A good-looking cover exported with the wrong technical dimensions.</p>
            </div>
          </div>
          <Link
            href="/tools/kdp-cover-checker"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
          >
            Check a cover PDF
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
