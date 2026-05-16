import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, FileCheck2, Lock, Ruler, ShieldCheck, Zap } from 'lucide-react';
import { generatePageMetadata, SITE_URL } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  aboutPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  breadcrumbSchema,
  itemListSchema,
} from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'About KDPPreflight — Free Amazon KDP Preflight Validation Tool',
  description:
    'KDPPreflight is a free, browser-based Amazon KDP preflight tool. It validates cover PDFs and manuscript PDFs for bleed, trim size, spine width, safe area, and image resolution before upload to Amazon KDP. No file storage. 100% private.',
  path: '/about',
  keywords: [
    'about KDPPreflight',
    'KDP preflight tool',
    'Amazon KDP validation tool',
    'KDP cover checker tool',
    'KDP bleed checker tool',
    'free KDP tool',
  ],
});

const capabilities = [
  {
    id: 'cover-checker',
    icon: FileCheck2,
    title: 'KDP Cover Checker',
    summary: 'Validates the full cover wrap PDF against your book specs.',
    detail:
      'Reads the exported cover PDF dimensions and compares total width (back + spine + front + bleed), height (trim + bleed), implied spine width, and safe area compliance. Flags any dimension that does not match the expected value for your page count, paper type, and trim size.',
    href: '/tools/kdp-cover-checker',
  },
  {
    id: 'bleed-checker',
    icon: Ruler,
    title: 'KDP Bleed Checker',
    summary: 'Detects missing or insufficient 0.125" bleed in cover and manuscript PDFs.',
    detail:
      'Compares the PDF MediaBox and TrimBox dimensions to the expected bleed-inclusive size. Reports the actual dimensions, the expected bleed size, and the exact amount by which bleed is missing or incorrect — for both cover PDFs and individual manuscript pages.',
    href: '/tools/kdp-bleed-checker',
  },
  {
    id: 'trim-validator',
    icon: Check,
    title: 'KDP Trim Size Validator',
    summary: 'Confirms the PDF matches the trim size selected in the KDP project.',
    detail:
      'Measures the actual PDF dimensions and compares them to the target trim size with and without bleed. A mismatch of even 0.01" is flagged with the actual and expected values, so the correct export setting can be identified.',
    href: '/tools/kdp-trim-size-calculator',
  },
  {
    id: 'spine-calculator',
    icon: BookOpen,
    title: 'KDP Spine Width Calculator',
    summary: 'Computes spine width from page count × paper-type constant.',
    detail:
      'Applies the official KDP formula: white paper = page_count × 0.002252", cream paper = page_count × 0.0025", color interior = page_count × 0.002347". The result is used to compute the required total cover wrap width and verify the uploaded cover against the current manuscript page count.',
    href: '/tools/kdp-spine-width-calculator',
  },
  {
    id: 'safe-area',
    icon: ShieldCheck,
    title: 'KDP Safe Area Checker',
    summary: 'Identifies content placed in the trim-risk zone.',
    detail:
      'The safe area is the region ≥0.25" inside the trim edge on all sides. The checker flags content that falls between the safe area boundary and the trim line — the zone where production cut variation can remove or damage printed content.',
    href: '/blog/kdp-safe-area-guide',
  },
  {
    id: 'preview',
    icon: Zap,
    title: 'KDP 3D Book Preview',
    summary: 'Renders a paperback or hardcover as a 3D physical object.',
    detail:
      'Maps the cover art and spine onto a 3D book model using the configured trim dimensions and spine width. Supports paperback and hardcover formats. Exportable as a transparent PNG for use in marketing materials.',
    href: '/preview',
  },
];

const validationLogic = [
  {
    term: 'Bleed detection',
    definition:
      'The PDF parser reads the MediaBox (full page size) and TrimBox (trim-only area). If MediaBox equals TrimBox, no bleed is present. Bleed is measured as the difference per edge and compared to the required 0.125".',
  },
  {
    term: 'Spine width inference',
    definition:
      'The total cover PDF width implies a spine width: implied_spine = pdf_width − (2 × trim_width) − 0.25". This is compared to the calculated spine for the manuscript’s current page count and paper type.',
  },
  {
    term: 'Trim match',
    definition:
      'The manuscript PDF dimensions (MediaBox) are compared to the target trim size. For no-bleed manuscripts, the match is exact. For bleed manuscripts, the expected size is trim + 0.125" per outside edge.',
  },
  {
    term: 'Resolution check',
    definition:
      'Embedded raster images are analyzed for effective DPI at print size. Images with an effective resolution below 300 DPI are flagged with the actual DPI and the minimum required.',
  },
  {
    term: 'Safe area analysis',
    definition:
      'The checker calculates the safe boundary (trim edge minus 0.25") and identifies any content element that falls in the risk zone between the safe area and the trim edge.',
  },
];

const privacyFacts = [
  'No cover or manuscript data is transmitted to any external server',
  'PDF parsing runs entirely in the browser using PDF.js',
  'No user account or login required',
  'No analytics on uploaded file content',
  'Files are not cached, stored, or logged',
  'No AI training on uploaded book files',
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        id="about-schema"
        data={[
          aboutPageSchema(),
          organizationSchema(),
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'About', url: `${SITE_URL}/about` },
          ]),
          itemListSchema('KDPPreflight Tools', capabilities.map((c) => ({
            name: c.title,
            url: `${SITE_URL}${c.href}`,
            description: c.summary,
          }))),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground font-medium">About</li>
          </ol>
        </nav>

        {/* Entity definition — most important section for LLM retrieval */}
        <header className="mb-14">
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
            About KDPPreflight
          </p>
          <h1 className="text-balance text-[clamp(28px,5vw,46px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
            The free Amazon KDP preflight tool for self-publishers.
          </h1>
          <p className="intro mt-5 max-w-3xl text-[clamp(15px,1.4vw,17px)] leading-relaxed text-muted-foreground">
            <strong className="text-foreground">KDPPreflight</strong> is a free, browser-based Amazon KDP
            preflight and validation platform. It checks cover PDFs and manuscript PDFs for bleed errors,
            trim size mismatches, spine width inaccuracies, safe area violations, and low-resolution images{' '}
            <em>before</em> the file is uploaded to Amazon Kindle Direct Publishing. All file processing
            happens locally in the user's browser — no cover or manuscript data is transmitted to any server.
          </p>
        </header>

        {/* What problem it solves */}
        <section aria-labelledby="problem-heading" className="mb-14">
          <h2 id="problem-heading" className="mb-4 text-2xl font-bold tracking-[-0.02em] text-foreground">
            What problem KDPPreflight solves
          </h2>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground">
            Amazon KDP validates uploaded cover and manuscript PDFs against precise technical requirements:
            exact page dimensions, bleed area, trim match, spine width (derived from page count and paper
            type), image resolution, and content safe area. A PDF can look visually correct in Canva,
            Affinity Publisher, Adobe Illustrator, or Adobe InDesign and still be rejected because the
            exported file is 0.05" off in one dimension.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            KDPPreflight intercepts this before upload. It reads the actual PDF dimensions and compares
            them to the mathematically correct values for the user's book specs, reporting the exact
            difference between what the file contains and what KDP expects — so the specific export
            setting that needs to change can be identified and corrected.
          </p>
        </section>

        {/* Capabilities */}
        <section aria-labelledby="capabilities-heading" className="mb-14">
          <h2 id="capabilities-heading" className="mb-8 text-2xl font-bold tracking-[-0.02em] text-foreground">
            What KDPPreflight validates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <article
                  key={cap.id}
                  className="rounded-2xl border border-border bg-background/60 p-5"
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-bold text-foreground">{cap.title}</h3>
                  </div>
                  <p className="mb-2 text-sm font-medium text-foreground/80">{cap.summary}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{cap.detail}</p>
                  <Link
                    href={cap.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Validation logic — technical transparency for trust/GEO */}
        <section aria-labelledby="logic-heading" className="mb-14">
          <h2 id="logic-heading" className="mb-4 text-2xl font-bold tracking-[-0.02em] text-foreground">
            How KDPPreflight validates files
          </h2>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            KDPPreflight uses the same mathematical rules that Amazon KDP applies during upload review.
            The formulas below are the source of every check result.
          </p>
          <dl className="space-y-4">
            {validationLogic.map(({ term, definition }) => (
              <div key={term} className="rounded-2xl border border-border bg-background/60 p-5">
                <dt className="mb-1.5 font-bold text-foreground">
                  <dfn>{term}</dfn>
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{definition}</dd>
              </div>
            ))}
          </dl>

          {/* Key formulas as a structured block — AI loves extracting these */}
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-4 font-bold text-foreground">KDP validation formulas</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="font-semibold text-foreground">Bleed size (manuscript):</dt>
                <dd className="text-muted-foreground font-mono">
                  PDF width = trim_width + 0.125" · PDF height = trim_height + 0.25"
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="font-semibold text-foreground">Spine width (white paper):</dt>
                <dd className="text-muted-foreground font-mono">page_count × 0.002252"</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="font-semibold text-foreground">Spine width (cream paper):</dt>
                <dd className="text-muted-foreground font-mono">page_count × 0.0025"</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="font-semibold text-foreground">Full cover wrap width:</dt>
                <dd className="text-muted-foreground font-mono">
                  trim_width + spine_width + trim_width + 0.25"
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="font-semibold text-foreground">Full cover wrap height:</dt>
                <dd className="text-muted-foreground font-mono">trim_height + 0.25"</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Privacy */}
        <section aria-labelledby="privacy-heading" className="mb-14">
          <div className="flex items-start gap-4">
            <Lock className="h-6 w-6 shrink-0 text-primary mt-0.5" />
            <div>
              <h2 id="privacy-heading" className="mb-4 text-2xl font-bold tracking-[-0.02em] text-foreground">
                Privacy model
              </h2>
              <p className="mb-5 text-base leading-relaxed text-muted-foreground">
                KDP self-publishers upload manuscripts and covers they have not yet published. KDPPreflight
                treats those files as private production assets. The tool is architecturally designed so
                that file data never leaves the browser.
              </p>
              <ul className="space-y-2">
                {privacyFacts.map((fact) => (
                  <li key={fact} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success mt-0.5" />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section aria-labelledby="audience-heading" className="mb-14">
          <h2 id="audience-heading" className="mb-4 text-2xl font-bold tracking-[-0.02em] text-foreground">
            Who uses KDPPreflight
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Self-publishing authors',
                body: 'Authors who design and format their own KDP paperbacks and need to verify files before upload without paying for a professional preflight service.',
              },
              {
                title: 'Book cover designers',
                body: 'Freelance cover designers who need to deliver KDP-ready cover PDFs to clients and want to confirm the spine, bleed, and safe area before delivery.',
              },
              {
                title: 'Book formatters',
                body: 'Interior formatters and publishing service providers who prepare manuscript PDFs for Amazon KDP and need to validate trim size and bleed accuracy.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-background/60 p-5">
                <h3 className="mb-2 font-bold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-3 text-xl font-bold text-foreground">Start using KDPPreflight</h2>
          <p className="mx-auto mb-6 max-w-lg text-sm text-muted-foreground">
            Free to use. No account required. Upload your cover or manuscript PDF and get exact
            measurements before Amazon KDP reviews the file.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/checker"
              className="ds-button-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px"
            >
              <FileCheck2 className="h-4 w-4" />
              Scan My KDP Files
            </Link>
            <Link
              href="/setup"
              className="ds-button-secondary inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px hover:border-primary/30"
            >
              <Ruler className="h-4 w-4" />
              Calculate Book Specs
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
