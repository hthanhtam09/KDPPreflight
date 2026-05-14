import Link from 'next/link';
import { BookOpen, ExternalLink } from 'lucide-react';

const toolLinks = [
  { href: '/setup', label: 'KDP Book Setup Calculator' },
  { href: '/checker', label: 'KDP Cover & Manuscript Checker' },
  { href: '/preview', label: 'KDP 3D Book Preview' },
];

const guideLinks = [
  { href: '/kdp-bleed-checker', label: 'KDP Bleed Checker' },
  { href: '/kdp-trim-size-calculator', label: 'KDP Trim Size Calculator' },
  { href: '/kdp-spine-width-calculator', label: 'KDP Spine Width Calculator' },
  { href: '/kdp-cover-validator', label: 'KDP Cover Validator' },
  { href: '/kdp-cover-size-guide', label: 'KDP Cover Size Guide' },
  { href: '/kdp-safe-area-guide', label: 'KDP Safe Area Guide' },
  { href: '/kdp-paperback-guide', label: 'KDP Paperback Guide' },
];

const resourceLinks = [
  { href: '/about', label: 'About KDPPreflight' },
  { href: '/faq', label: 'KDP FAQ' },
  { href: '/kdp-glossary', label: 'KDP Glossary' },
  { href: '/blog', label: 'Blog' },
];

const blogLinks = [
  { href: '/blog/how-to-fix-kdp-bleed-issues', label: 'How to Fix KDP Bleed Issues' },
  { href: '/blog/best-kdp-cover-dimensions', label: 'Best KDP Cover Dimensions' },
  { href: '/blog/why-amazon-rejects-your-cover', label: 'Why Amazon Rejects Your Cover' },
  { href: '/blog/kdp-safe-area-explained', label: 'KDP Safe Area Explained' },
  { href: '/blog/kdp-spine-width-guide', label: 'KDP Spine Width Guide' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand + entity description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-semibold text-foreground"
              aria-label="KDPPreflight home"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              KDPPreflight
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground/80">KDPPreflight</strong> is a free, browser-based
              Amazon KDP preflight tool. It validates cover bleed, trim size, spine width, safe area,
              and PDF dimensions before upload. No file storage. 100% private.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Free to use', 'No account', 'Files stay local', 'No AI training'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Tools */}
          <nav aria-label="Tool pages">
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Free Tools
            </h3>
            <ul className="space-y-2.5">
              {toolLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
              <li className="pt-1 border-t border-border">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60 mb-2 mt-1">Resources</p>
              </li>
              {resourceLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Guides */}
          <nav aria-label="KDP guides">
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              KDP Guides
            </h3>
            <ul className="space-y-2.5">
              {guideLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Blog */}
          <nav aria-label="Blog articles">
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Blog
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/blog" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                  All articles →
                </Link>
              </li>
              {blogLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Entity statement + legal */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-4 max-w-3xl text-[12px] leading-relaxed text-muted-foreground">
            <strong className="text-foreground/70">KDPPreflight</strong> is a free Amazon KDP preflight
            validation tool for self-publishers. It checks KDP cover PDFs and manuscript PDFs for bleed
            accuracy, trim size compliance, spine width correctness, safe area violations, and image
            resolution before upload to Amazon Kindle Direct Publishing. All file processing is local
            — no files are stored on any server.
          </p>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-[12px] text-muted-foreground">
              © {new Date().getFullYear()} KDPPreflight. Free for Amazon KDP self-publishers.
            </p>
            <p className="text-[12px] text-muted-foreground">
              Not affiliated with Amazon or Kindle Direct Publishing.{' '}
              <a
                href="https://kdp.amazon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline decoration-muted-foreground/40 underline-offset-2 hover:text-foreground transition-colors"
              >
                kdp.amazon.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
