import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata, SITE_URL } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { definedTermSetSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Glossary — Amazon KDP Formatting Terms Defined',
  description:
    'Definitions of every Amazon KDP formatting term: bleed, trim size, spine width, safe area, full wrap, gutter, DPI, MediaBox, TrimBox, and more. Precise technical definitions for self-publishers.',
  path: '/kdp-glossary',
  keywords: [
    'KDP glossary',
    'Amazon KDP terms',
    'KDP formatting terms',
    'KDP bleed definition',
    'KDP trim size definition',
    'KDP spine width definition',
    'KDP safe area definition',
  ],
});

interface GlossaryTerm {
  term: string;
  shortDef: string;
  detail: string;
  formula?: string;
  example?: string;
  relatedLinks?: { label: string; href: string }[];
}

const terms: GlossaryTerm[] = [
  {
    term: 'Bleed',
    shortDef: 'The 0.125" (3mm) strip of artwork that extends beyond the trim edge and is cut away during production.',
    detail:
      'KDP bleed prevents white edges from appearing when the physical cut is slightly off-center. Any page with a background color or artwork that reaches the page edge must include 0.125" of bleed on each affected edge. The bleed area is not part of the finished book — it is trimmed away.',
    example: 'A 6×9" page with bleed must be exported at 6.25"×9.25". The outer 0.125" on each side is the bleed.',
    relatedLinks: [{ label: 'KDP Bleed Checker Guide', href: '/kdp-bleed-checker' }],
  },
  {
    term: 'Trim size',
    shortDef: 'The finished dimensions of a printed book after the pages are cut to their final size.',
    detail:
      'The trim size is the width × height of the book in inches. Common KDP trim sizes include 5×8", 5.5×8.5", 6×9", and 8.5×11". The trim size must be selected in the KDP book setup before any files are designed or uploaded. Every other dimension — manuscript page size, cover wrap size, spine width — is derived from the trim size.',
    example: 'A 6×9 trim size means the finished book pages are 6 inches wide and 9 inches tall.',
    relatedLinks: [{ label: 'KDP Trim Size Calculator', href: '/kdp-trim-size-calculator' }],
  },
  {
    term: 'Spine width',
    shortDef: 'The thickness of the book block — the narrow side visible on a bookshelf — calculated from page count and paper type.',
    detail:
      'KDP spine width is not a design choice; it is calculated from the number of pages and the paper stock. White paper adds 0.002252" per page; cream paper adds 0.0025" per page; color interiors add 0.002347" per page. The spine width determines the total cover wrap width.',
    formula: 'Spine width = page_count × paper_constant (white: 0.002252, cream: 0.0025, color: 0.002347)',
    example: 'A 300-page white-paper book has a spine width of 300 × 0.002252 = 0.6756" (≈0.676").',
    relatedLinks: [{ label: 'KDP Spine Width Calculator', href: '/kdp-spine-width-calculator' }],
  },
  {
    term: 'Safe area',
    shortDef: 'The region ≥0.25" inside the trim edge where all critical content must be placed to avoid being cut.',
    detail:
      'The safe area (also called the safe zone or content safe area) is the margin of safety between critical content and the trim edge. Production cuts can shift by 1–2mm, so content placed between the safe area boundary and the trim edge is at risk of being partially cut off. All text, logos, faces, barcodes, and key artwork must stay within the safe area.',
    example: 'On a 6×9" cover, the safe area starts 0.25" inside each trim edge — so the safe content zone is 5.5" × 8.5" centered on the front panel.',
    relatedLinks: [{ label: 'KDP Safe Area Guide', href: '/kdp-safe-area-guide' }],
  },
  {
    term: 'Full wrap cover',
    shortDef: 'The complete KDP cover PDF that includes the back cover, spine, and front cover in a single image.',
    detail:
      'KDP requires a full wrap cover PDF — not just the front cover. The single PDF page must contain all three panels: back cover (left), spine (center), and front cover (right), plus 0.125" bleed on all four outside edges. The total width is trim_width + spine_width + trim_width + 0.25" (bleed both sides).',
    formula: 'Total cover width = trim_width + spine_width + trim_width + 0.25"',
    example: 'For 6×9", 300 white-paper pages: 6 + 0.676 + 6 + 0.25 = 12.926" wide × 9.25" tall.',
    relatedLinks: [{ label: 'KDP Cover Validator', href: '/kdp-cover-validator' }],
  },
  {
    term: 'Gutter',
    shortDef: 'The inside margin of a manuscript page — the edge closest to the book binding.',
    detail:
      'The gutter (also called the inside margin or binding margin) must be wider than the outside margins because pages pull inward when bound. Text too close to the gutter is difficult to read because it disappears into the binding crease. KDP minimum gutter margin: 0.375" for books under 150 pages, scaling up to 0.75" for books over 500 pages.',
    example: 'A 250-page manuscript should have a gutter margin of at least 0.5" on the inside edge of every page.',
  },
  {
    term: 'MediaBox',
    shortDef: 'The outermost page boundary in a PDF file, defining the full physical size of the page including any bleed.',
    detail:
      'PDF files contain multiple page boundary boxes. The MediaBox defines the total page extent — for a bleed-inclusive page, it is larger than the trim size. KDPPreflight reads the MediaBox to determine the actual PDF dimensions and compare them to the expected bleed-inclusive size.',
    example: 'A 6×9" page with 0.125" bleed should have a MediaBox of 6.25"×9.25".',
  },
  {
    term: 'TrimBox',
    shortDef: 'The PDF boundary that defines the intended finished trim size after cutting, matching the book\'s nominal page dimensions.',
    detail:
      'The TrimBox is embedded in the PDF and marks the cut lines — the dimensions of the finished page. For a 6×9" book, the TrimBox should be exactly 6"×9" even if the MediaBox is larger due to bleed. KDPPreflight reads the TrimBox to confirm the trim size and compares it to the expected trim.',
    example: 'A PDF with MediaBox 6.25"×9.25" and TrimBox 6"×9" has 0.125" bleed on all sides.',
  },
  {
    term: 'DPI (dots per inch)',
    shortDef: 'The print resolution of a raster image, measured as the number of dots per linear inch at the final print size.',
    detail:
      'KDP requires a minimum of 300 DPI for print-quality images. At 300 DPI, a 6×9" cover front requires at least 1950×2850 pixels. An image that appears sharp on screen may be below 300 DPI at print size if it was sourced at low resolution or scaled up. KDPPreflight checks the effective print DPI of images embedded in cover PDFs.',
    formula: 'Minimum pixels = print_dimension_inches × 300',
    example: 'A 6×9" front cover at 300 DPI needs at least 1800×2700 px (6×300 = 1800; 9×300 = 2700).',
  },
  {
    term: 'Preflight',
    shortDef: 'The process of checking a print-ready file for technical errors before it is sent to a printer or publisher.',
    detail:
      'Preflight (from the aviation concept of a pre-flight check) is the publishing industry term for validating a PDF against print production requirements. A preflight check catches bleed errors, trim mismatches, font problems, low-resolution images, and color profile issues before they cause print defects or upload rejections. KDPPreflight automates this process for Amazon KDP files.',
  },
  {
    term: 'Paperback cover wrap',
    shortDef: 'The printed paper cover that wraps around a paperback book, including front, spine, and back panels.',
    detail:
      'For KDP paperbacks, the cover wrap is a single-page PDF that contains the back cover, spine, and front cover in one image. The paper is printed on both sides and glued to the book block at the spine. The wrap must include 0.125" bleed on all four outside edges and must be dimensioned to the current page count and paper type.',
  },
  {
    term: 'KDP (Kindle Direct Publishing)',
    shortDef: 'Amazon\'s self-publishing platform for digital (Kindle) and print-on-demand (paperback, hardcover) books.',
    detail:
      'Amazon Kindle Direct Publishing (KDP) allows authors to publish ebooks, paperbacks, and hardcovers directly to Amazon. For print books, KDP validates uploaded PDF files against precise formatting requirements: dimensions, bleed, spine width, image resolution, font embedding, and safe area compliance. Files that fail validation are rejected with an error message before publication.',
  },
  {
    term: 'Print-on-demand (POD)',
    shortDef: 'A printing model where individual copies are printed only when ordered, rather than in large print runs.',
    detail:
      'KDP uses print-on-demand technology. Each book copy is printed, bound, and shipped when a customer orders it. POD eliminates inventory costs but requires exact file precision — because each print is a fresh production run, dimensional accuracy in the PDF directly determines print quality.',
  },
  {
    term: 'Bleed box',
    shortDef: 'The PDF page boundary that defines the extent of the bleed area (MediaBox extended by the bleed amount).',
    detail:
      'The BleedBox in a PDF marks the outer boundary of the bleed area. It is equal to the TrimBox plus the bleed amount on each edge. For a 6×9" page with 0.125" bleed, the BleedBox is 6.25"×9.25". KDPPreflight reads BleedBox and MediaBox values to determine whether bleed is correctly specified in the PDF structure.',
  },
  {
    term: 'Rich black',
    shortDef: 'A CMYK black ink mixture that produces a deeper black than using only black (K) ink alone.',
    detail:
      'Pure black in CMYK is 0% cyan, 0% magenta, 0% yellow, 100% black (0,0,0,100). Rich black adds ink from other channels, typically 60% cyan, 40% magenta, 40% yellow, 100% black (60,40,40,100). Rich black appears denser in print but requires careful application — large areas of rich black can cause ink bleeding or misregistration. KDP recommends rich black for large dark areas on covers.',
  },
];

export default function KdpGlossaryPage() {
  const schemaTerms = terms.map(({ term, shortDef }) => ({ term, definition: shortDef }));
  const firstLetters = [...new Set(terms.map((t) => t.term[0].toUpperCase()))].sort();

  return (
    <>
      <JsonLd
        id="glossary-schema"
        data={[
          definedTermSetSchema(schemaTerms),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'KDP Glossary', url: `${SITE_URL}/kdp-glossary` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground font-medium">KDP Glossary</li>
          </ol>
        </nav>

        <header className="mb-12">
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
            KDP Formatting Glossary
          </p>
          <h1 className="text-balance text-[clamp(28px,5vw,46px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
            Amazon KDP formatting terms defined.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Precise, technical definitions of every KDP formatting term — bleed, trim size,
            spine width, safe area, MediaBox, TrimBox, DPI, and more. Written for Amazon KDP
            self-publishers who need exact understanding, not vague marketing language.
          </p>

          {/* Alphabet quick-jump */}
          <div className="mt-6 flex flex-wrap gap-1">
            {firstLetters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 text-[12px] font-bold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                {letter}
              </a>
            ))}
          </div>
        </header>

        {/* Group terms alphabetically */}
        {firstLetters.map((letter) => {
          const letterTerms = terms.filter((t) => t.term[0].toUpperCase() === letter);
          return (
            <section key={letter} id={`letter-${letter}`} className="mb-12">
              <h2 className="mb-5 border-b border-border pb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                {letter}
              </h2>
              <dl className="space-y-6">
                {letterTerms.map(({ term, shortDef, detail, formula, example, relatedLinks }) => (
                  <div
                    key={term}
                    id={term.toLowerCase().replace(/\s+/g, '-')}
                    className="rounded-2xl border border-border bg-background/60 p-5 sm:p-6"
                  >
                    <dt className="mb-2 text-lg font-bold text-foreground">
                      <dfn>{term}</dfn>
                    </dt>
                    <dd className="mb-3 text-sm font-medium text-foreground/80">{shortDef}</dd>
                    <dd className="mb-3 text-sm leading-relaxed text-muted-foreground">{detail}</dd>
                    {formula && (
                      <dd className="mb-3">
                        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">Formula</p>
                          <code className="text-sm text-foreground font-mono">{formula}</code>
                        </div>
                      </dd>
                    )}
                    {example && (
                      <dd className="mb-3">
                        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70 mb-1">Example</p>
                          <p className="text-sm text-muted-foreground">{example}</p>
                        </div>
                      </dd>
                    )}
                    {relatedLinks && relatedLinks.length > 0 && (
                      <dd className="flex flex-wrap gap-3 mt-2">
                        {relatedLinks.map(({ label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            {label} →
                          </Link>
                        ))}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          );
        })}

        {/* CTA */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Apply the definitions — check your KDP files.
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground">
            KDPPreflight validates bleed, trim size, spine width, and safe area in your actual
            exported PDF — not a guess based on the design tool preview.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/checker"
              className="ds-button-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px"
            >
              Scan My KDP Files
            </Link>
            <Link
              href="/faq"
              className="ds-button-secondary inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px hover:border-primary/30"
            >
              KDP FAQ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
