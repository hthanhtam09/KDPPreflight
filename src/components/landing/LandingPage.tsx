'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Box,
  Check,
  CheckCircle2,
  FileCheck2,
  Gauge,
  LockKeyhole,
  Ruler,
  ScanLine,
  SearchCheck,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import HeroMockup from './HeroMockup'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-90px' } as const,
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

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

const uploadIssues = [
  {
    num: '01',
    badge: 'Bleed warning',
    status: 'Rejected',
    title: 'White edge after upload preview',
    body: 'Your 8.5 x 11 interior was exported without the extra 0.125" bleed, so artwork stops at the trim line.',
    metric: 'Actual 8.5" x 11"',
    expected: 'Expected 8.625" x 11.25"',
    kind: 'bleed',
    hoverLabel: 'Missing 0.125" bleed',
  },
  {
    num: '02',
    badge: 'Trim mismatch',
    status: 'Check file',
    title: 'Cover PDF does not match the selected trim',
    body: 'The cover looks correct in Canva, but the final PDF is 0.08" too narrow for the spine and bleed.',
    metric: 'Cover width off',
    expected: 'Spine + bleed missing',
    kind: 'trim',
    hoverLabel: '0.08" too narrow',
  },
  {
    num: '03',
    badge: 'Spine risk',
    status: 'Fix before upload',
    title: 'Page count changed after your cover was designed',
    body: 'A 300-page white-paper paperback needs about 0.676" of spine. Small page count changes move the cover wrap.',
    metric: 'White paper',
    expected: '0.002252" per page',
    kind: 'spine',
    hoverLabel: '300 pages = 0.676" spine',
  },
  {
    num: '04',
    badge: 'Safe area',
    status: 'Pass after fix',
    title: 'Barcode and back-cover text sit too close to trim',
    body: 'Important cover content is inside the cut-risk area instead of staying within KDP safe margins.',
    metric: 'Text inside risk zone',
    expected: 'Keep 0.25" safe area',
    kind: 'safe',
    hoverLabel: 'Moved inside safe area',
  },
]

const steps = [
  {
    step: '01',
    title: 'Calculate Exact KDP Specs',
    description:
      'Enter trim size, page count, paper type, and cover format to get KDP cover dimensions, bleed, spine width, margins, and safe area before export.',
    href: '/setup',
    label: 'Smart Book Setup',
    visual: 'setup',
    icon: Ruler,
    details: ['KDP trim size calculator', 'KDP spine width calculator', 'Bleed margin guide'],
  },
  {
    step: '02',
    title: 'Check Your Exported Files',
    description:
      'Scan your cover PDF and manuscript PDF for KDP upload errors: missing bleed, wrong trim, unsafe margins, low resolution images, and spine mismatch.',
    href: '/checker',
    label: 'Format Checker',
    visual: 'checker',
    icon: SearchCheck,
    details: ['KDP bleed checker', 'KDP manuscript checker', 'Actual vs expected measurements'],
    featured: true,
  },
  {
    step: '03',
    title: 'Preview the Physical Book',
    description:
      'Inspect the paperback or hardcover as a physical object after the files pass the production checks.',
    href: '/preview',
    label: '3D Book Preview',
    visual: 'preview',
    icon: Box,
    details: ['Paperback and hardcover preview', 'Spine inspection', 'Export preview images'],
  },
]

const privacyItems = [
  'Your unpublished files never leave your browser',
  'No cloud upload required',
  'No AI training',
  'No manuscript storage',
  'No cover storage',
  'Local processing whenever possible',
]

const guideItems = [
  {
    keyword: 'KDP bleed checker',
    title: 'Check the 0.125" bleed before KDP does',
    body: 'Paperback interiors with bleed need 0.125" added to the outside, top, and bottom edges. For an 8.5 x 11 trim, a full-bleed page should export as 8.625" x 11.25", not 8.5" x 11".',
  },
  {
    keyword: 'KDP trim size calculator',
    title: 'Match the PDF to the trim size selected in KDP',
    body: 'A trim mismatch happens when your uploaded PDF dimensions do not match the book size in the KDP setup screen. KDPPreflight compares the exported file to practical trim targets like 6 x 9, 8 x 10, and 8.5 x 11.',
  },
  {
    keyword: 'KDP spine width calculator',
    title: 'Calculate spine width from paper type and page count',
    body: 'Spine width changes with white paper, cream paper, color interiors, and page count. A 300-page white-paper paperback is about 0.676" wide, while cream paper uses 0.0025" per page.',
  },
  {
    keyword: 'KDP manuscript checker',
    title: 'Find manuscript bleed and margin problems',
    body: 'Interior PDFs can fail because pages mix sizes, artwork reaches the trim without bleed, or body text sits in unsafe margins. The checker highlights the page and measurement that caused the risk.',
  },
  {
    keyword: 'KDP cover dimensions',
    title: 'Build the full cover wrap, not just the front cover',
    body: 'A paperback cover PDF must include back cover, spine, front cover, and 0.125" bleed on all sides. Missing the spine or bleed is one of the most common Amazon KDP upload errors.',
  },
  {
    keyword: 'Amazon KDP upload errors',
    title: 'Turn vague upload errors into fixable measurements',
    body: 'KDP errors often say the file is the wrong size without explaining the source. KDPPreflight breaks the problem into actual dimensions, expected dimensions, and the export setting to check next.',
  },
]

const faqs = [
  {
    q: 'Why does Amazon KDP reject PDFs that look correct?',
    a: 'KDP validates exact PDF dimensions, bleed, trim size, margins, image resolution, and cover wrap math. A PDF can look correct in Preview, Canva, Acrobat, or Affinity Publisher and still be 0.05" off from the KDP cover dimensions required for upload.',
  },
  {
    q: 'What is a KDP bleed issue?',
    a: 'A KDP bleed issue means artwork or background color reaches the trim edge but the PDF does not include the required extra bleed area. For most bleed layouts, add 0.125" beyond the trim so cutting does not leave white edges.',
  },
  {
    q: 'How do I fix a KDP trim mismatch?',
    a: 'Confirm the trim size selected in KDP, then export the manuscript and cover to the exact expected size. For example, an 8.5 x 11 manuscript without bleed should be 8.5" x 11"; with bleed it should include the extra bleed dimensions.',
  },
  {
    q: 'Can KDPPreflight check manuscript bleed?',
    a: 'Yes. The KDP manuscript checker compares page boxes and dimensions to your selected trim and bleed mode so you can find paperback bleed issues before upload.',
  },
  {
    q: 'How is KDP spine width calculated?',
    a: 'Spine width depends on page count and paper type. White paper uses about 0.002252" per page, while cream paper uses about 0.0025" per page. The KDP spine width calculator applies those values to your book specs.',
  },
  {
    q: 'Why do low-resolution images cause KDP upload errors?',
    a: 'Images below roughly 300 DPI can print soft or trigger quality warnings. A useful KDP PDF checker should flag low resolution artwork before you upload the cover or manuscript.',
  },
  {
    q: 'Can Canva exports create KDP cover size problems?',
    a: 'Yes. Canva designs can export at the wrong page size if the document was created from a front-cover canvas instead of a full paperback wrap. Check the final PDF width, height, bleed, and spine before uploading.',
  },
  {
    q: 'Can Affinity Publisher exports fail KDP checks?',
    a: 'Yes. Affinity Publisher files can fail if bleed is set in the document but not included during PDF export, or if the PDF preset changes page boxes. Recheck actual vs expected dimensions after export.',
  },
  {
    q: 'Can Adobe Illustrator cover PDFs fail KDP checks?',
    a: 'Yes. Illustrator exports can use the artboard size instead of the full bleed box, flatten artwork unexpectedly, or omit the 0.125" bleed. Validate the exported PDF, not only the design file.',
  },
  {
    q: 'Does KDPPreflight store my unpublished files?',
    a: 'No. KDPPreflight is designed as a private creator workstation with local browser processing whenever possible. No manuscript storage, no cover storage, and no AI training on your book files.',
  },
]

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="ds-eyebrow mb-4">{children}</p>
}

function TrustNote({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
      <Check className="h-3 w-3 shrink-0 text-success" />
      {children}
    </span>
  )
}

function SectionHeader({
  label,
  title,
  body,
  id,
}: {
  label: string
  title: string
  body: string
  id?: string
}) {
  return (
    <motion.div {...fadeUp} className="mx-auto mb-12 max-w-3xl text-center">
      <SectionLabel>{label}</SectionLabel>
      <h2 id={id} className="ds-heading text-balance text-3xl sm:text-[44px]">
        {title}
      </h2>
      <p className="ds-body mx-auto mt-5 max-w-2xl text-base">{body}</p>
    </motion.div>
  )
}

function IssueCard({ issue, index }: { issue: (typeof uploadIssues)[number]; index: number }) {
  const isSuccess = issue.status.includes('Pass')

  return (
    <motion.article
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: index * 0.06 }}
      className="ds-card ds-card-interactive issue-card group relative min-h-[292px] overflow-hidden p-5"
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.16em] text-primary/60">{issue.num}</span>
          <h3 className="mt-4 text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground">{issue.title}</h3>
        </div>
        <span className={isSuccess ? 'ds-status-success issue-badge' : 'ds-status-warning issue-badge'}>
          {issue.status}
        </span>
      </div>

      <div className={`issue-preview issue-preview-${issue.kind}`} aria-hidden="true">
        <span className="issue-scan-line" />
        <span className="issue-page">
          <span className="issue-artwork" />
          <span className="issue-white-edge" />
          <span className="issue-expected-outline" />
          <span className="issue-actual-outline" />
          <span className="issue-spine" />
          <span className="issue-safe" />
          <span className="issue-risk-zone" />
          <span className="issue-barcode" />
          <span className="issue-text-line issue-text-one" />
          <span className="issue-text-line issue-text-two" />
          <span className="issue-selected-edge" />
        </span>
        <span className="issue-hover-label">{issue.hoverLabel}</span>
      </div>

      <p className="relative z-10 mt-5 text-sm leading-6 text-muted-foreground">{issue.body}</p>
      <div className="relative z-10 mt-5 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Actual</p>
          <p className="mt-1 text-sm font-semibold text-foreground/90">{issue.metric}</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/8 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/75">Expected</p>
          <p className="mt-1 text-sm font-semibold text-foreground/90">{issue.expected}</p>
        </div>
      </div>
      <div className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <TriangleAlert className="h-3 w-3 text-warning" />
        {issue.badge}
      </div>
    </motion.article>
  )
}

function WorkflowVisual({ featured, visual }: { featured?: boolean; visual: string }) {
  return (
    <div
      className={`workflow-visual workflow-visual-${visual} ${featured ? 'workflow-visual-featured' : ''}`}
      aria-hidden="true"
    >
      {visual === 'setup' ? (
        <div className="workflow-calculator">
          <span className="workflow-field workflow-field-trim">Trim 8.5 x 11</span>
          <span className="workflow-field workflow-field-pages">300 pages</span>
          <span className="workflow-field workflow-field-paper">White paper</span>
          <span className="workflow-calc-arrow" />
          <span className="workflow-result-line">Bleed 0.125"</span>
          <span className="workflow-result-line workflow-result-spine">Spine 0.676"</span>
          <span className="workflow-ready">
            <Check className="h-3 w-3" />
            Spec ready
          </span>
        </div>
      ) : visual === 'checker' ? (
        <div className="workflow-scanner">
          <span className="workflow-file workflow-file-cover">cover.pdf</span>
          <span className="workflow-file workflow-file-manuscript">manuscript.pdf</span>
          <span className="workflow-scan-page">
            <span className="workflow-page-art" />
            <span className="workflow-page-bleed" />
            <span className="workflow-page-trim" />
            <span className="workflow-scan" />
          </span>
          <span className="workflow-warning">Bleed issue selected</span>
        </div>
      ) : (
        <div className="workflow-book-preview">
          <span className="workflow-book-back" />
          <span className="workflow-book-spine" />
          <span className="workflow-book-front">
            <span className="workflow-book-safe" />
          </span>
          <span className="workflow-export">
            <Check className="h-3 w-3" />
            Export preview
          </span>
        </div>
      )}
      <div className="workflow-status">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {featured ? 'Ready to scan cover.pdf' : visual === 'preview' ? 'Physical preview' : 'Spec ready'}
      </div>
    </div>
  )
}

function ResultDemo() {
  return (
    <motion.div {...fadeUp} className="ds-card-elevated result-demo relative overflow-hidden p-[clamp(22px,4vw,40px)]">
      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            Inspection result
          </p>
          <h3 className="text-[clamp(24px,3.2vw,40px)] font-semibold tracking-[-0.03em] text-foreground">
            Page 2 bleed is incomplete.
          </h3>
          <p className="ds-body mt-4 text-base">
            KDPPreflight turns a vague paperback bleed issue into the exact measurement to fix.
          </p>

          <div className="mt-6 space-y-3">
            {[
              ['Actual file', '8.5" x 11"', 'warning'],
              ['Expected with bleed', '8.625" x 11.25"', 'default'],
              ['Fix preview', 'Export with bleed enabled', 'success'],
            ].map(([label, value, tone]) => (
              <div key={label} className={`result-row result-row-${tone}`}>
                <span>
                  <strong>{label}</strong>
                  <small>{value}</small>
                </span>
                {tone === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Gauge className="h-5 w-5" />}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="ds-status-warning rounded-full border px-3 py-1.5 text-xs font-bold">
              Bleed edge selected
            </span>
            <span className="ds-status-success rounded-full border px-3 py-1.5 text-xs font-bold">
              Fix preview ready
            </span>
          </div>
        </div>

        <div className="result-stage" aria-hidden="true">
          <div className="result-page result-page-before">
            <span className="result-label">Before</span>
            <span className="result-art" />
            <span className="result-white-edge" />
            <span className="result-trim-line" />
            <span className="result-measure result-measure-x">8.5"</span>
            <span className="result-measure result-measure-y">11"</span>
          </div>
          <div className="result-page result-page-after">
            <span className="result-label">After</span>
            <span className="result-art" />
            <span className="result-bleed-fill" />
            <span className="result-trim-line" />
            <span className="result-pass">Corrected</span>
          </div>
          <span className="result-apply">
            <Check className="h-3.5 w-3.5" />
            Apply fix
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function PrivacyVisual() {
  return (
    <div className="privacy-visual" aria-hidden="true">
      <span className="privacy-grid" />
      <div className="privacy-browser">
        <span className="privacy-browser-bar">
          <i />
          <i />
          <i />
        </span>
        <span className="privacy-file">cover.pdf</span>
        <span className="privacy-data-path" />
        <div className="privacy-core">
          <ShieldCheck className="h-9 w-9 text-primary" />
          <strong>Local processing</strong>
          <small>cover.pdf analyzed in browser</small>
        </div>
        <span className="privacy-result">
          <Check className="h-3.5 w-3.5" />
          Private check complete
        </span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '76px 76px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[8%] top-[10%] h-[560px] w-[560px] rounded-full bg-primary/[0.105] blur-[140px] dark:bg-primary/[0.075]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-[12%] top-[58%] h-[260px] w-[260px] rounded-full bg-primary/[0.075] blur-[95px] dark:bg-primary/[0.05]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:pb-16 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.22fr] lg:gap-10">
            <div>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.46 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <BookOpen className="h-3 w-3" />
                  Free KDP Preflight Tool for Amazon Creators
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="ds-heading mt-6 max-w-[650px] text-balance text-[clamp(34px,4.8vw,56px)]"
              >
                Fix bleed, trim, spine, and margin issues{' '}
                <span className="text-primary">before KDP rejects</span> your upload.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="ds-body mt-5 max-w-[590px] text-[clamp(14px,1.5vw,17px)]"
              >
                Scan your cover and manuscript PDF for practical KDP problems: bleed, trim size, spine width, safe
                areas, margins, and export mistakes that create painful Amazon KDP upload errors.
              </motion.p>

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
                  Scan My KDP Files
                </Link>
                <Link
                  href="/setup"
                  className="ds-button-secondary inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px hover:border-primary/30 active:translate-y-px"
                >
                  <Ruler className="h-4 w-4" />
                  Calculate Book Specs
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.36 }}
                className="mt-5 flex flex-wrap gap-x-4 gap-y-2"
              >
                <TrustNote>Files processed locally</TrustNote>
                <TrustNote>No manuscript storage</TrustNote>
                <TrustNote>Built for KDP creators</TrustNote>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground/60"
              >
                <Link href="/setup" className="flex items-center gap-1 transition hover:text-primary">
                  <span>Setup specs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span aria-hidden="true">/</span>
                <Link href="/checker" className="flex items-center gap-1 transition hover:text-primary">
                  <span>Check files</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span aria-hidden="true">/</span>
                <Link href="/preview" className="flex items-center gap-1 transition hover:text-primary">
                  <span>3D preview</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            </div>

            <div className="relative lg:-mr-10 xl:-mr-16">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 overflow-hidden border-y border-border bg-secondary/35 py-3.5" aria-hidden="true">
        <div className="landing-marquee flex w-max select-none gap-8 whitespace-nowrap">
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
        <section className="ds-section px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              label="Real upload mistakes"
              title="Real KDP upload mistakes creators run into."
              body="The file can look finished in Canva, Preview, Acrobat, Affinity, or Illustrator and still fail because the final PDF does not match what KDP measures."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {uploadIssues.map((issue, i) => (
                <IssueCard key={issue.title} issue={issue} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              label="The workflow"
              title="Problem, scan, issue, fix, confidence."
              body="KDPPreflight works like a production workstation: calculate the specs, scan the exported files, identify the issue, then preview the corrected book."
            />
            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.18fr_0.92fr]">
              {steps.map((s) => {
                const Icon = s.icon
                return (
                  <motion.article
                    key={s.step}
                    {...fadeUp}
                    className={`ds-card ds-card-interactive group relative overflow-hidden p-6 ${
                      s.featured ? 'workflow-card-featured min-h-[480px]' : 'min-h-[430px]'
                    } max-sm:min-h-0`}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold tracking-[0.16em] text-primary/60">{s.step}</span>
                      <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {s.label}
                      </span>
                    </div>
                    <WorkflowVisual featured={s.featured} visual={s.visual} />
                    <div className="mt-6 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{s.title}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{s.description}</p>
                    <div className="mt-6 space-y-2.5">
                      {s.details.map((detail) => (
                        <p key={detail} className="flex items-center gap-2 text-sm text-foreground/80">
                          <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                          {detail}
                        </p>
                      ))}
                    </div>
                    <Link href={s.href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open tool
                      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                    </Link>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="ds-section px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              label="A real KDP bleed checker result"
              title="Understand exactly what is wrong."
              body="A practical result should show the selected issue, highlighted bleed edge, actual vs expected measurements, and the export setting that fixes it."
            />
            <ResultDemo />
          </div>
        </section>

        <section className="ds-section px-4 py-24 sm:px-6">
          <motion.div
            {...fadeUp}
            className="ds-card-elevated mx-auto grid max-w-6xl gap-10 overflow-hidden p-[clamp(28px,5vw,48px)] lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
          >
            <div>
              <LockKeyhole className="mb-7 h-8 w-8 text-primary" />
              <SectionLabel>Private creator workstation</SectionLabel>
              <h2 className="ds-heading text-balance text-4xl sm:text-5xl">
                Your unpublished files never leave your browser.
              </h2>
              <p className="ds-body mt-5 text-base">
                KDP creators upload manuscripts they have not published yet, covers they paid for, and interiors they
                plan to sell. KDPPreflight treats those files like private production assets, not sample data.
              </p>
              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                {privacyItems.map((item) => (
                  <span key={item} className="privacy-badge">
                    <ShieldCheck className="h-4 w-4" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <PrivacyVisual />
          </motion.div>
        </section>

        <section className="ds-section px-4 py-24 sm:px-6" aria-labelledby="guide-heading">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              id="guide-heading"
              label="KDP formatting guide"
              title="KDP bleed, trim size, spine width, and PDF upload errors explained."
              body="Practical KDP measurements and examples for creators who want to catch rejection risks before they upload."
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guideItems.map((item, i) => (
                <motion.article
                  key={item.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  className="ds-card ds-card-interactive guide-card p-6"
                >
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.18em] text-primary/65">
                    {item.keyword}
                  </span>
                  <h3 className="mb-3 text-lg font-bold leading-snug text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section px-4 py-24 sm:px-6" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-5xl">
            <SectionHeader
              id="faq-heading"
              label="FAQ"
              title="Questions self-publishers ask after KDP rejects a file."
              body="Specific answers for KDP cover checker, KDP manuscript checker, KDP bleed checker, trim mismatch, PDF export, Canva, Affinity Publisher, and Adobe Illustrator workflows."
            />
            <div className="grid gap-3 md:grid-cols-2">
              {faqs.map((faq, i) => (
                <motion.article
                  key={faq.q}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.025 }}
                  className="ds-card ds-card-interactive min-h-[190px] p-5"
                >
                  <h3 className="text-[17px] font-bold leading-snug text-foreground">{faq.q}</h3>
                  <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-28 pt-8 sm:px-6">
          <motion.div {...fadeUp} className="final-cta mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-panel)] p-8 text-center sm:p-12">
            <SectionLabel>Before the next upload</SectionLabel>
            <h2 className="ds-heading mx-auto max-w-3xl text-balance text-4xl sm:text-6xl">
              Your PDF looks fine until KDP checks it.
            </h2>
            <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
              Catch the bleed, trim, spine, margin, and PDF export issue before it becomes another rejected upload.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/checker"
                className="ds-button-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-[22px] text-sm font-bold transition hover:-translate-y-px active:translate-y-px"
              >
                <ScanLine className="h-4 w-4" />
                Scan My KDP Files
              </Link>
              <Link
                href="/setup"
                className="ds-button-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-[22px] text-sm font-bold transition hover:-translate-y-px hover:border-primary/30 active:translate-y-px"
              >
                <Ruler className="h-4 w-4" />
                Calculate Book Specs
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
