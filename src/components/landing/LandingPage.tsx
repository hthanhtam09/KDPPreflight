'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Box, Check, FileCheck2, LockKeyhole, Ruler, SearchCheck } from 'lucide-react'
import Link from 'next/link'
import HeroMockup from './HeroMockup'

/* ─── Animation presets ──────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' } as const,
  transition: { duration: 0.55, ease: 'easeOut' as const },
}

/* ─── Data ───────────────────────────────── */
const marqueeItems = [
  'BLEED ERROR DETECTED',
  'TRIM SIZE MISMATCH',
  'SPINE WIDTH INCORRECT',
  'MARGIN UNSAFE',
  'DPI TOO LOW',
  'COVER SIZE WRONG',
  'PDF DIMENSIONS OFF',
  'SAFE AREA VIOLATED',
  'PAGE COUNT MISMATCH',
  'BARCODE AREA OVERLAP',
  'GUTTER TOO NARROW',
  'FONT NOT EMBEDDED',
]

const painPoints = [
  { num: '01', text: 'Your cover looks perfect in Canva and still fails KDP checks.' },
  { num: '02', text: "KDP rejected your file but the error message doesn't tell you what to fix." },
  { num: '03', text: 'Your manuscript passes upload but the printed copy has white edges.' },
  { num: '04', text: 'You fixed the file and re-uploaded three times before finding the real issue.' },
]

const steps = [
  {
    step: '01',
    title: 'Calculate Exact KDP Specs',
    description:
      'Enter your book format and get exact dimensions for trim, bleed, spine width, safe area, and margins before you export.',
    href: '/setup',
    label: 'Smart Book Setup',
    icon: Ruler,
    details: ['KDP trim size tool', 'Spine width calculator', 'Bleed and margin guide'],
  },
  {
    step: '02',
    title: 'Check Your Exported Files',
    description:
      'Upload your cover PDF and manuscript PDF. KDPPreflight detects size, bleed, trim, spine, and margin issues with KDP-realistic tolerances.',
    href: '/checker',
    label: 'Format Checker',
    icon: SearchCheck,
    details: ['KDP cover checker', 'KDP manuscript checker', 'Page-by-page issue reports'],
  },
  {
    step: '03',
    title: 'Preview the Physical Book',
    description:
      'See how your book will look as a paperback or hardcover. Rotate, inspect the spine, flip pages, and export preview images.',
    href: '/preview',
    label: '3D Book Preview',
    icon: Box,
    details: ['Paperback & hardcover preview', 'Full 360° rotation', 'Screenshot export'],
  },
]

const privacyItems = [
  'No manuscript storage',
  'No cover storage',
  'No AI training on your files',
  'Local browser processing when possible',
  'Files removed on refresh unless saved locally',
]

const guideItems = [
  {
    keyword: 'KDP bleed checker',
    title: 'What is KDP bleed and why it matters',
    body: 'KDP bleed is 0.125 inch of extra content extending beyond your trim line. Without it, the printed edge may show a white stripe if the paper shifts during cutting. Every cover needs full bleed on all four sides.',
  },
  {
    keyword: 'KDP trim size',
    title: 'How KDP trim sizes work',
    body: 'KDP supports 11 standard trim sizes from 5×8″ to 8.5×11″. Choosing the right trim affects spine width, page count requirements, and your cover dimensions. Your PDF must match the trim exactly.',
  },
  {
    keyword: 'KDP spine calculator',
    title: 'How spine width is calculated',
    body: 'Spine width depends on page count and paper type. For white paper, use 0.002252 inches per page. For cream, use 0.0025 inches per page. A 300-page white-paper book has a spine of approximately 0.676 inches.',
  },
  {
    keyword: 'Amazon KDP cover size',
    title: 'KDP safe area and margin requirements',
    body: 'The safe area is a 0.25 inch buffer inside your trim line where all text and important visuals must stay. Content outside this zone risks being cut. Cover barcodes also need a reserved 2″ × 1.2″ area on the back cover.',
  },
  {
    keyword: 'KDP PDF checker',
    title: 'Why cover PDFs fail KDP review',
    body: 'Common causes: wrong total cover width (missing spine and bleed), missing bleed on one or more sides, PDF dimensions off by more than 0.02 inches, or low-resolution images below 300 DPI.',
  },
]

const faqs = [
  {
    q: 'Is KDPPreflight a KDP cover checker?',
    a: 'Yes. KDPPreflight checks cover dimensions, trim fit, bleed, spine width, and common cover export mistakes before you upload to Amazon KDP.',
  },
  {
    q: 'Can it check manuscript bleed?',
    a: 'Yes. The KDP manuscript checker flags page size and bleed risks that often create white edges or unexpected print trimming in the physical book.',
  },
  {
    q: 'Does KDPPreflight store my book files?',
    a: 'No. Files are processed locally in your browser whenever possible. We do not store manuscripts, covers, or use them for AI training.',
  },
  {
    q: 'What does the KDP trim size tool do?',
    a: 'It helps you choose supported KDP trim sizes and understand expected dimensions, bleed size, safe areas, and export measurements for your book.',
  },
  {
    q: 'How accurate is the spine calculator?',
    a: "KDPPreflight uses the same formula KDP documents: 0.002252 inches per page for white paper, 0.0025 for cream. Results match KDP's official template generator.",
  },
  {
    q: 'Why do KDP upload errors happen?',
    a: "Most errors come from small mismatches: wrong PDF size, missing bleed, unsafe margins, low-resolution artwork, or a cover that doesn't match page count and paper type.",
  },
  {
    q: 'Can I preview my KDP book in 3D?',
    a: 'Yes. The preview lets you rotate the book, inspect the cover and spine, open pages, and see the project as a physical paperback or hardcover before printing.',
  },
  {
    q: 'What file formats are supported?',
    a: 'KDPPreflight accepts PDF for covers and manuscripts. Cover files can also be PNG or JPEG. Manuscripts must be PDF only.',
  },
]

/* ─── JSON-LD structured data ────────────── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'KDPPreflight',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web browser',
      description:
        'Amazon KDP formatting tool with a KDP cover checker, KDP manuscript checker, KDP bleed checker, trim size tool, spine calculator, and 3D book preview.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'KDP cover checker',
        'KDP manuscript checker',
        'KDP bleed checker',
        'KDP trim size tool',
        'KDP spine calculator',
        'KDP 3D book preview',
      ],
      url: 'https://kdppreflight.app',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to check your KDP book files before uploading to Amazon',
      description: 'Use KDPPreflight to validate your KDP cover and manuscript before uploading to Amazon KDP.',
      step: steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.description,
        url: `https://kdppreflight.app${s.href}`,
      })),
    },
  ],
}

/* ─── Small shared primitives ────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="ds-eyebrow mb-4">{children}</p>
}

function TrustNote({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
      <Check className="h-3 w-3 shrink-0 text-success" />
      {children}
    </span>
  )
}

/* ─── Main export ────────────────────────── */
export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ════════════════════════════════════
          HERO — KDP Preflight Command Center
      ════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-background">
        {/* Subtle dot-grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.038] dark:opacity-[0.032]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />
        {/* Soft radial spotlight from top-left */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-primary/[0.08] blur-[120px] dark:bg-primary/[0.06]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
            {/* ── Left: Copy ── */}
            <div>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.46 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <BookOpen className="h-3 w-3" />
                  Free KDP Preflight Tool · For Amazon Creators
                </span>
              </motion.div>

              {/* H1 — contains all target SEO keywords */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="ds-heading mt-6 max-w-xl text-balance text-[clamp(34px,5.5vw,58px)]"
              >
                KDP rejected your book file? Check <span className="text-primary">bleed, trim, spine,</span> and{' '}
                <span className="text-primary">margins</span> before upload.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="ds-body mt-5 max-w-lg text-[clamp(14px,1.5vw,17px)]"
              >
                Preview practical KDP issues before they cost you hours — cover bleed, trim size, spine width, safe
                areas, manuscript margins, and PDF setup.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.27 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/checker"
                  className="ds-button-primary inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px active:translate-y-px"
                >
                  <FileCheck2 className="h-4 w-4" />
                  Start KDP Check
                </Link>
                <Link
                  href="/setup"
                  className="ds-button-secondary inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px hover:border-primary/30 active:translate-y-px"
                >
                  <Ruler className="h-4 w-4" />
                  Calculate Cover Size
                </Link>
              </motion.div>

              {/* Trust notes */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.36 }}
                className="mt-5 flex flex-wrap gap-x-4 gap-y-2"
              >
                <TrustNote>Files processed locally</TrustNote>
                <TrustNote>No file storage</TrustNote>
                <TrustNote>Built for KDP creators</TrustNote>
              </motion.div>

              {/* Internal nav hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.48 }}
                className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground/60"
              >
                <Link href="/setup" className="flex items-center gap-1 transition hover:text-primary">
                  <span>Setup specs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span aria-hidden="true">·</span>
                <Link href="/checker" className="flex items-center gap-1 transition hover:text-primary">
                  <span>Check files</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span aria-hidden="true">·</span>
                <Link href="/preview" className="flex items-center gap-1 transition hover:text-primary">
                  <span>3D Preview</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            </div>

            {/* ── Right: Product UI mockup ── */}
            <div className="relative">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          MARQUEE / TICKER STRIP
      ════════════════════════════════════ */}
      <section className="mt-14 overflow-hidden border-y border-border bg-secondary/35 py-3.5" aria-hidden="true">
        <div className="animate-marquee flex w-max select-none gap-8 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground/50"
            >
              <span className="h-1 w-1 rounded-full bg-primary/40" />
              {item}
            </span>
          ))}
        </div>
      </section>

      <main>
        {/* ════════════════════════════════════
            PAIN POINTS
        ════════════════════════════════════ */}
        <section className="ds-section px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mx-auto mb-12 max-w-3xl text-center">
              <SectionLabel>What creators run into</SectionLabel>
              <h2 className="ds-heading text-balance text-3xl sm:text-[44px]">
                KDP problems rarely announce themselves clearly.
              </h2>
              <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
                The file can look right in Canva, Preview, or Acrobat and still miss the exact dimensions KDP expects at
                upload or in print.
              </p>
            </motion.div>
            <div className="grid gap-3 md:grid-cols-2">
              {painPoints.map((point, i) => (
                <motion.article
                  key={point.text}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                  className="ds-card ds-card-interactive min-h-[178px] p-6"
                >
                  <span className="mb-10 block text-xs font-bold tracking-[0.14em] text-primary/55">{point.num}</span>
                  <p className="text-[19px] leading-snug text-foreground/90">{point.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            HOW IT WORKS / THREE TOOLS
        ════════════════════════════════════ */}
        <section className="ds-section px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mx-auto mb-12 max-w-3xl text-center">
              <SectionLabel>The workflow</SectionLabel>
              <h2 className="ds-heading text-balance text-3xl sm:text-[44px]">
                Three focused tools, not a settings maze.
              </h2>
              <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
                Calculate specs before exporting, check files before uploading, then preview the physical book before
                ordering a proof copy.
              </p>
            </motion.div>
            <div className="grid gap-5 lg:grid-cols-3">
              {steps.map((s) => {
                return (
                  <motion.article
                    key={s.step}
                    {...fadeUp}
                    className="ds-card ds-card-interactive group relative min-h-[420px] overflow-hidden p-7 max-sm:min-h-0 max-sm:p-5"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <span className="text-[11px] font-bold tracking-[0.16em] text-primary/60">{s.step}</span>
                      <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {s.label}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{s.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{s.description}</p>
                    <div className="mt-6 space-y-2.5">
                      {s.details.map((detail) => (
                        <p key={detail} className="flex items-center gap-2 text-sm text-foreground/80">
                          <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                          {detail}
                        </p>
                      ))}
                    </div>
                    <Link
                      href={s.href}
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      Open tool{' '}
                      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                    </Link>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            VALIDATION DEMO
        ════════════════════════════════════ */}
        <section className="ds-section px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mx-auto mb-12 max-w-3xl text-center">
              <SectionLabel>A real KDP bleed checker result</SectionLabel>
              <h2 className="ds-heading text-balance text-3xl sm:text-[44px]">
                The result should look like something you can fix.
              </h2>
              <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
                Concrete measurements matter. A useful KDP bleed checker tells you what happened, not just decorates a
                warning badge.
              </p>
            </motion.div>
            <motion.div {...fadeUp} className="ds-card-elevated relative overflow-hidden p-[clamp(24px,4vw,40px)]">
              {/* Header row */}
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                    Inspection result
                  </p>
                  <h3 className="text-[clamp(22px,3.2vw,38px)] font-semibold tracking-[-0.03em] text-foreground">
                    Page 2 bleed is incomplete
                  </h3>
                </div>
                <span className="ds-status-warning rounded-full border px-3 py-1.5 text-xs font-bold">Warning</span>
              </div>

              {/* Data grid */}
              <div className="relative z-10 mt-8 grid max-w-[680px] grid-cols-2 gap-3 max-sm:grid-cols-1">
                {[
                  ['Actual', '8.625″ × 11.25″'],
                  ['Expected', '8.75″ × 11.25″'],
                  ['KDP Risk', 'May upload — print edge risk exists.'],
                  ['Fix', 'Export with full bleed enabled on all sides.'],
                ].map(([label, value]) => (
                  <div key={label} className="ds-card min-h-[100px] p-[18px]">
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                      {label}
                    </p>
                    <strong className="block text-[16px] leading-snug text-foreground/90">{value}</strong>
                  </div>
                ))}
              </div>

              {/* Decorative page mockup */}
              <div
                className="absolute bottom-[-30px] right-[clamp(20px,5vw,56px)] h-[270px] w-[min(27vw,250px)] min-w-[190px] -rotate-[5deg] max-sm:relative max-sm:right-auto max-sm:bottom-auto max-sm:mx-auto max-sm:mb-[-50px] max-sm:mt-8 max-sm:w-[190px]"
                aria-hidden="true"
              >
                <div className="absolute inset-0 rounded-[7px] border border-border bg-card shadow-card">
                  <span className="absolute inset-[14px] border border-dashed border-muted-foreground/20" />
                  <span className="absolute inset-x-0 top-0 h-5 bg-destructive/20" />
                  <span className="absolute inset-x-0 bottom-0 h-5 bg-destructive/20" />
                </div>
                <div className="absolute inset-x-[36px] top-[68px] grid gap-2.5">
                  <i className="block h-[8px] rounded-full bg-muted" />
                  <i className="block h-[8px] w-[78%] rounded-full bg-muted" />
                  <i className="block h-[8px] w-[60%] rounded-full bg-muted" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════
            PRIVACY-FIRST
        ════════════════════════════════════ */}
        <section className="ds-section px-4 py-24 sm:px-6">
          <motion.div
            {...fadeUp}
            className="ds-card-elevated mx-auto max-w-6xl overflow-hidden p-[clamp(28px,5vw,48px)]"
          >
            <div className="max-w-3xl">
              <LockKeyhole className="mb-7 h-8 w-8 text-primary" />
              <SectionLabel>Privacy-first by design</SectionLabel>
              <h2 className="ds-heading text-balance text-4xl sm:text-5xl">Your unpublished book stays private.</h2>
              <p className="ds-body mt-5 text-base">
                KDP creators upload manuscripts they haven&rsquo;t published yet, covers they paid for, and interiors
                they plan to sell. KDPPreflight treats those files like private work&mdash;not sample data.
              </p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {privacyItems.map((item) => (
                <div
                  key={item}
                  className="ds-card flex min-h-[106px] items-end p-4 text-sm font-semibold leading-snug text-foreground/85"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════
            KDP GUIDE — SEO content
        ════════════════════════════════════ */}
        <section className="ds-section px-4 py-24 sm:px-6" aria-labelledby="guide-heading">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mx-auto mb-12 max-w-3xl text-center">
              <SectionLabel>KDP formatting guide</SectionLabel>
              <h2 id="guide-heading" className="ds-heading text-balance text-3xl sm:text-[44px]">
                Common KDP upload problems explained.
              </h2>
              <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
                Understanding bleed, trim, spine, and safe area is the difference between a clean print and a costly
                rejection.
              </p>
            </motion.div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guideItems.map((item, i) => (
                <motion.article
                  key={item.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                  className="ds-card ds-card-interactive p-6"
                >
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.18em] text-primary/55">
                    {item.keyword}
                  </span>
                  <h3 className="mb-3 text-lg font-bold leading-snug text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            FAQ
        ════════════════════════════════════ */}
        <section className="ds-section px-4 py-24 sm:px-6" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-5xl">
            <motion.div {...fadeUp} className="mx-auto mb-12 max-w-3xl text-center">
              <SectionLabel>FAQ</SectionLabel>
              <h2 id="faq-heading" className="ds-heading text-balance text-3xl sm:text-[44px]">
                Questions self-publishers ask after KDP rejects a file.
              </h2>
              <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
                Straight answers for KDP cover checker, KDP manuscript checker, KDP bleed checker, trim size, and
                preview questions.
              </p>
            </motion.div>
            <div className="grid gap-3 md:grid-cols-2">
              {faqs.map((faq) => (
                <motion.article key={faq.q} {...fadeUp} className="ds-card ds-card-interactive min-h-[180px] p-5">
                  <h3 className="text-[17px] font-bold leading-snug text-foreground">{faq.q}</h3>
                  <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            FINAL CTA
        ════════════════════════════════════ */}
        <section className="px-4 pb-28 pt-8 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center">
            <SectionLabel>Before the next upload</SectionLabel>
            <h2 className="ds-heading text-balance text-4xl sm:text-6xl">Check the book while you can still fix it.</h2>
            <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
              Use KDPPreflight as your Amazon KDP formatting tool before the file reaches KDP&rsquo;s upload screen.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/checker"
                className="ds-button-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-[22px] text-sm font-bold transition hover:-translate-y-px active:translate-y-px"
              >
                <FileCheck2 className="h-4 w-4" />
                Check My KDP File
              </Link>
              <Link
                href="/setup"
                className="ds-button-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-[22px] text-sm font-bold transition hover:-translate-y-px hover:border-primary/30 active:translate-y-px"
              >
                <BookOpen className="h-4 w-4" />
                Setup Book Specs
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
