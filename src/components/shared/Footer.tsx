import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const toolLinks = [
  { href: '/tools/kdp-cover-checker', label: 'KDP Cover Checker' },
  { href: '/tools/kdp-bleed-checker', label: 'KDP Bleed Checker' },
  { href: '/tools/kdp-spine-width-calculator', label: 'Spine Width Calculator' },
  { href: '/tools/kdp-trim-size-calculator', label: 'Trim Size Calculator' },
]

const guideLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/glossary/full-wrap-cover', label: 'Full Wrap Cover' },
  { href: '/glossary/safe-area', label: 'Safe Area' },
  { href: '/glossary/trim-size', label: 'Trim Size' },
]

const resourceLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/blog/category/cover-rejections', label: 'KDP Cover Guides' },
  { href: '/faq', label: 'KDP FAQ' },
  { href: '/about', label: 'About KDPPreflight' },
]

const blogLinks: { href: string; label: string }[] = []

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + entity description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="group flex min-w-0 shrink items-center gap-1 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label="KDPPreflight home"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
                <Image
                  src="/logo-nav.png"
                  alt=""
                  width={60}
                  height={60}
                  className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] object-contain brightness-105 transition group-hover:brightness-125"
                  priority
                />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-base font-semibold leading-tight tracking-tight text-foreground sm:text-xl lg:text-xl md:text-lg hover:text-primary">
                  KDPPreflight
                </span>
              </div>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground/80">KDPPreflight</strong> is a free, browser-based Amazon KDP preflight
              tool. It validates cover bleed, trim size, spine width, safe area, and PDF dimensions before upload. No
              file storage. 100% private.
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
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60 mb-2 mt-1">
                  Resources
                </p>
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
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Blog</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/blog"
                  className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                >
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
            <strong className="text-foreground/70">KDPPreflight</strong> is a free Amazon KDP preflight validation tool
            for self-publishers. It checks KDP cover PDFs and manuscript PDFs for bleed accuracy, trim size compliance,
            spine width correctness, safe area violations, and image resolution before upload to Amazon Kindle Direct
            Publishing. All file processing is local — no files are stored on any server.
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
  )
}
