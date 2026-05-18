import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata, SITE_URL } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema, breadcrumbSchema, speakableSchema } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP FAQ — Amazon KDP Formatting Questions Answered',
  description:
    'Answers to the most common Amazon KDP formatting questions: bleed, trim size, spine width, safe area, cover dimensions, margin requirements, and upload errors. Technical and precise.',
  path: '/faq',
  keywords: [
    'KDP FAQ',
    'Amazon KDP questions',
    'KDP formatting help',
    'KDP bleed questions',
    'KDP trim size FAQ',
    'KDP cover size questions',
  ],
});

interface FaqGroup {
  id: string;
  category: string;
  questions: { q: string; a: string; links?: { label: string; href: string }[] }[];
}

const faqGroups: FaqGroup[] = [
  {
    id: 'bleed',
    category: 'KDP Bleed',
    questions: [
      {
        q: 'What is KDP bleed?',
        a: 'KDP bleed is the 0.125" (3mm) strip of artwork or background color that extends beyond the finished trim edge of a printed book. During production, the book block is cut to the trim size — the bleed strip is removed. Without bleed, any shift in the physical cut leaves a visible white edge where background color or artwork should reach the page border.',
        links: [{ label: 'KDP Bleed Checker Guide', href: '/tools/kdp-bleed-checker' }],
      },
      {
        q: 'How much bleed does Amazon KDP require?',
        a: 'Amazon KDP requires 0.125" (approximately 3mm) of bleed on all four outside edges of any page that has bleed content. For a 6×9" trim, a full-bleed page must be exported at 6.25"×9.25". For an 8.5×11" trim, the bleed-inclusive size is 8.75"×11.25".',
      },
      {
        q: 'How do I fix a KDP bleed error?',
        a: 'The fix is always in the PDF export settings. Enable bleed in the export dialog (Affinity Publisher: File → Export → More → Include Bleed; InDesign: Marks and Bleed tab → Use Document Bleed Settings; Illustrator: Save as PDF → Marks and Bleeds → Use Document Bleed Settings). After fixing the export, verify the PDF dimensions include the 0.125" bleed area on each affected edge.',
        links: [{ label: 'Browse KDP guides', href: '/blog' }],
      },
      {
        q: 'Does every KDP manuscript page need bleed?',
        a: 'No. Pages with white margins and no artwork reaching the edge do not need bleed. Use the no-bleed export setting for text-only interiors, journals, and workbooks with standard white margins. Bleed is required only when backgrounds, images, or coloring content reach the physical edge of the page.',
      },
      {
        q: 'Why does my Canva export fail the KDP bleed check?',
        a: 'Canva exports at the canvas page size. If the canvas was set up at the trim size (e.g., 6×9") instead of the bleed size (6.25×9.25"), the exported PDF will be 0.25" short in both dimensions. To fix: resize the Canva document to the bleed size before designing, extend backgrounds to fill the canvas, and enable "Crop marks and bleed" when downloading as PDF Print.',
      },
      {
        q: 'What is the difference between bleed, trim, and safe area?',
        a: 'Bleed (0.125" outside the trim edge): the area that gets cut away; artwork must extend here to avoid white edges. Trim edge: the final cut line — the edge of the finished book. Safe area (0.25" inside the trim edge): the region where all critical content must stay to avoid being cut in production. These are three concentric boundaries, from outermost (bleed) to innermost (safe area).',
      },
    ],
  },
  {
    id: 'trim',
    category: 'Trim Size',
    questions: [
      {
        q: 'What trim size should I use for my KDP paperback?',
        a: '6×9" is the most common trim for non-fiction trade paperbacks and memoirs. 5.5×8.5" is standard for fiction novels. 8.5×11" is used for workbooks, journals, large-format books, and coloring books. 5×8" is compact, often used for poetry or small novels. Choose the trim size before designing — it determines every other dimension.',
      },
      {
        q: 'What is a KDP trim mismatch?',
        a: 'A trim mismatch occurs when the dimensions of the uploaded PDF do not equal the trim size selected in the KDP book setup. Even a difference of 0.01" triggers a rejection. Common causes: the design canvas was set to a different size than KDP, bleed was exported when KDP expects no-bleed, or the PDF export included crop marks that extended the page dimensions.',
        links: [{ label: 'KDP Trim Size Calculator', href: '/tools/kdp-trim-size-calculator' }],
      },
      {
        q: 'Can I change the KDP trim size after uploading files?',
        a: 'Yes, but all files must be re-uploaded to match the new trim size. Changing the trim size changes the spine width calculation and the total cover wrap dimensions. Any previously uploaded cover or manuscript will no longer match and must be regenerated at the new trim size.',
      },
      {
        q: 'What is the difference between trim size and page size in my design tool?',
        a: 'The trim size is the finished cut size of the book (e.g., 6×9"). The page size in your design tool should match the trim size for no-bleed layouts, or be 0.125" larger per outside edge for bleed layouts (e.g., 6.25×9.25"). The document page size is what determines the exported PDF dimensions.',
      },
    ],
  },
  {
    id: 'spine',
    category: 'Spine Width',
    questions: [
      {
        q: 'How is KDP spine width calculated?',
        a: 'KDP spine width = page count × paper thickness constant. White paper: page_count × 0.002252 inches. Cream paper: page_count × 0.0025 inches. Color interior: page_count × 0.002347 inches. For a 300-page white-paper book: 300 × 0.002252 = 0.6756" (approximately 0.676").',
        links: [{ label: 'KDP Spine Width Calculator', href: '/tools/kdp-spine-width-calculator' }],
      },
      {
        q: 'Why does the spine width change when I add pages?',
        a: 'Each page adds a fixed thickness to the book block. White paper adds 0.002252" per page. Adding 20 pages adds 0.045" to the spine, which changes the total cover wrap width by the same amount. If the cover was designed before the page count was finalized, the spine boundary shifts and the cover must be rebuilt.',
      },
      {
        q: 'What is the minimum KDP spine width for spine text?',
        a: 'KDP recommends at least approximately 0.225" of spine width (roughly 100 white-paper pages) before adding spine text. Below that, even small fonts overflow the spine edges. For spines under 0.4", use a single line of condensed text. For spines under 0.225", use only a visual element or leave the spine blank.',
      },
      {
        q: 'How does spine width affect the total cover PDF width?',
        a: 'Total cover width = trim_width + spine_width + trim_width + 0.25" (bleed on both sides). For a 6×9" trim with a 0.676" spine: 6 + 0.676 + 6 + 0.25 = 12.926" total width. This number changes every time the page count changes significantly.',
      },
      {
        q: 'Is the spine width the same for paperback and hardcover?',
        a: 'No. Hardcover cases use a different wrap calculation. KDP provides a separate template generator for hardcovers. The spine area on a hardcover includes the boards and hinge, so the cover PDF is structured differently from a paperback wrap.',
      },
    ],
  },
  {
    id: 'cover',
    category: 'Cover Requirements',
    questions: [
      {
        q: 'What size should a KDP paperback cover be?',
        a: 'The KDP paperback cover PDF must be the full wrap size: (trim_width × 2) + spine_width + 0.25" wide, and trim_height + 0.25" tall. For a 6×9" book with 300 white-paper pages: (6 + 6 + 0.676 + 0.25) × (9 + 0.25) = 12.926"×9.25". This changes with every page count change.',
        links: [
          { label: 'Browse KDP guides', href: '/blog' },
          { label: 'KDP Cover Validator', href: '/tools/kdp-cover-validator' },
        ],
      },
      {
        q: 'Why does Amazon KDP reject my cover PDF?',
        a: 'The eight most common causes: (1) uploaded only the front cover instead of the full wrap, (2) wrong total cover width due to incorrect spine calculation, (3) missing or insufficient bleed, (4) image resolution below 300 DPI, (5) spine width mismatch with current page count, (6) content in the barcode zone on the back cover, (7) fonts not embedded, (8) content too close to the trim edge.',
        links: [{ label: 'Browse KDP guides', href: '/blog' }],
      },
      {
        q: 'How do I validate a KDP full cover wrap before uploading?',
        a: 'Calculate the expected cover dimensions using the current page count, paper type, and trim size. Export the cover as PDF with bleed enabled. Upload to the KDP cover checker — it reads the actual PDF dimensions and compares total width (implies spine correctness), height, bleed on all sides, and safe area compliance.',
        links: [{ label: 'KDP Cover Validator', href: '/tools/kdp-cover-checker' }],
      },
      {
        q: 'What image resolution does KDP require for covers?',
        a: 'Amazon KDP requires a minimum of 300 DPI at the final print size. At 300 DPI, a 6×9" front cover needs at least 1950×2850 pixels at full size. For the full cover wrap at 12.926×9.25" and 300 DPI, the canvas should be at least 3878×2775 pixels.',
      },
      {
        q: 'Where does KDP place the barcode on the back cover?',
        a: 'KDP prints a barcode in the lower-right area of the back cover. The exact size and position is controlled by KDP. Leave at least 2" wide × 1.5" tall in the lower-right corner of the back cover (inside the safe area) clear of any design content. Content placed in the barcode zone will be covered by the KDP-printed barcode.',
      },
    ],
  },
  {
    id: 'safe-area',
    category: 'Safe Area & Margins',
    questions: [
      {
        q: 'What is the KDP safe area?',
        a: 'The KDP safe area is the region ≥0.25" inside the trim edge on all sides of a cover or manuscript page. All critical content — title, author name, barcodes, logos, body text, page numbers — must stay within the safe area. Content between the safe area and the trim edge is in the risk zone where production cut variation can partially remove it.',
        links: [{ label: 'Browse KDP guides', href: '/blog' }],
      },
      {
        q: 'What are the KDP manuscript margin requirements?',
        a: 'KDP recommends a minimum 0.25" margin on outside, top, and bottom edges. The inside (gutter) margin must be wider to account for binding: 0–150 pages → 0.375"; 151–300 pages → 0.5"; 301–500 pages → 0.625"; 500+ pages → 0.75". These are minimums — most professional book layouts use wider margins (0.5"–1") for readability.',
      },
      {
        q: 'What is the KDP gutter margin?',
        a: 'The gutter margin is the inside edge margin — the side that faces the spine binding. It must be wider than the outside margin because pages pull inward when bound, making text near the binding difficult to read. KDP\'s minimum gutter margin ranges from 0.375" (books under 150 pages) to 0.75" (books over 500 pages).',
      },
    ],
  },
  {
    id: 'tools',
    category: 'Using KDPPreflight',
    questions: [
      {
        q: 'What is KDPPreflight?',
        a: 'KDPPreflight is a free, browser-based Amazon KDP preflight tool for self-publishers. It validates cover PDFs and manuscript PDFs for bleed accuracy, trim size compliance, spine width correctness, safe area violations, and image resolution — before the file is uploaded to Amazon KDP. All processing is local; no files are stored on any server.',
        links: [{ label: 'Learn more', href: '/about' }],
      },
      {
        q: 'Is KDPPreflight free to use?',
        a: 'Yes. KDPPreflight is free with no account required. All tools — cover checker, manuscript checker, spine width calculator, trim size calculator, and 3D book preview — are available at no cost.',
      },
      {
        q: 'Does KDPPreflight store my book files?',
        a: 'No. KDPPreflight processes all files locally in the browser using PDF.js. No cover PDF, manuscript PDF, or file content is transmitted to any external server. Files are not cached, logged, or used for AI training.',
      },
      {
        q: 'What is the best KDP cover checker tool?',
        a: 'KDPPreflight is a free browser-based KDP cover checker that validates full cover wrap dimensions, bleed, spine width, safe area, and image resolution. It shows actual versus expected measurements with the specific export setting to adjust — not just a pass/fail result.',
        links: [{ label: 'Open the KDP cover checker', href: '/tools/kdp-cover-checker' }],
      },
      {
        q: 'How do I check if my KDP cover has the correct bleed?',
        a: 'Upload the cover PDF to the KDP cover checker. The tool reads the PDF MediaBox and TrimBox dimensions and compares the actual bleed on each edge to the required 0.125". It reports whether bleed is present, how much bleed was detected, and how far off the dimensions are from the expected bleed-inclusive size.',
        links: [{ label: 'Open the KDP cover checker', href: '/tools/kdp-cover-checker' }],
      },
      {
        q: 'Can KDPPreflight check Canva, Affinity Publisher, and Illustrator exports?',
        a: 'Yes. KDPPreflight validates the exported PDF regardless of which tool produced it. It reads the actual PDF dimensions — not the design software metadata — so it catches export errors from any tool: Canva (wrong canvas size), Affinity Publisher (bleed not included in export), Adobe Illustrator (artboard size vs. bleed size), and Adobe InDesign.',
      },
    ],
  },
  {
    id: 'design-tools',
    category: 'Design Tool Exports',
    questions: [
      {
        q: 'How do I export a KDP cover from Affinity Publisher with correct bleed?',
        a: 'In Affinity Publisher: set document bleed to 3mm (0.125") in File → Document Setup → Spread Setup. Extend artwork to the red bleed guides. Export: File → Export → PDF → More → enable "Include Bleed" and confirm the bleed amount is 3mm. The exported PDF dimensions will be the full bleed size including the cover wrap.',
      },
      {
        q: 'How do I export a KDP cover from Adobe InDesign with correct bleed?',
        a: 'In InDesign: set bleed to 0.125" in File → Document Setup. Extend artwork to the red bleed guides. Export: File → Export → Adobe PDF → Marks and Bleed tab → check "Use Document Bleed Settings". Verify the exported PDF dimensions include the bleed area.',
      },
      {
        q: 'How do I export a KDP cover from Canva correctly?',
        a: 'In Canva: create the design at the full bleed size (trim + 0.25" width, trim + 0.25" height for front-only; or full wrap dimensions for the full cover). Extend backgrounds and edge artwork to fill the entire canvas. Download: PDF Print → enable "Crop marks and bleed". The exported PDF will be at the canvas size, which should already be the bleed-inclusive size.',
      },
      {
        q: 'Why does Illustrator export the wrong KDP cover size?',
        a: 'Adobe Illustrator exports PDFs using the artboard size by default, which represents the trim — not the bleed. To include bleed: set the bleed in File → Document Setup (0.125" per side), extend artwork beyond the artboard edges to the bleed guides, and export with File → Save a Copy → PDF → Marks and Bleed → Use Document Bleed Settings.',
      },
    ],
  },
];

// Flatten all questions for the FAQ schema
const allFaqs = faqGroups.flatMap((group) =>
  group.questions.map(({ q, a }) => ({ question: q, answer: a }))
);

export default function FaqPage() {
  return (
    <>
      <JsonLd
        id="faq-page-schema"
        data={[
          faqSchema(allFaqs),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'FAQ', url: `${SITE_URL}/faq` },
          ]),
          speakableSchema(['h1', 'h2', 'h3', '.faq-answer']),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground font-medium">FAQ</li>
          </ol>
        </nav>

        <header className="mb-12">
          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
            KDP Formatting FAQ
          </p>
          <h1 className="text-balance text-[clamp(28px,5vw,46px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
            Amazon KDP formatting questions answered.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Technical, precise answers to the most common questions about Amazon KDP bleed,
            trim size, spine width, safe area, cover dimensions, manuscript formatting, and
            PDF export settings.
          </p>

          {/* Quick-jump links */}
          <nav aria-label="FAQ categories" className="mt-6 flex flex-wrap gap-2">
            {faqGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                {group.category}
              </a>
            ))}
          </nav>
        </header>

        {/* FAQ sections */}
        <div className="space-y-14">
          {faqGroups.map((group) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`}>
              <h2
                id={`${group.id}-heading`}
                className="mb-6 border-b border-border pb-3 text-xl font-bold tracking-[-0.01em] text-foreground"
              >
                {group.category}
              </h2>

              <div className="space-y-6">
                {group.questions.map(({ q, a, links }) => (
                  <article key={q} className="rounded-2xl border border-border bg-background/60 p-5 sm:p-6">
                    <h3 className="mb-3 text-base font-bold leading-snug text-foreground">{q}</h3>
                    <p className="faq-answer text-sm leading-relaxed text-muted-foreground">{a}</p>
                    {links && links.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {links.map(({ label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            {label} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Validate your KDP files instead of guessing.
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground">
            Upload your cover or manuscript PDF. KDPPreflight shows the exact actual vs.
            expected measurements — bleed, trim, spine, and safe area.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/checker"
              className="ds-button-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px"
            >
              Scan My KDP Files
            </Link>
            <Link
              href="/setup"
              className="ds-button-secondary inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px hover:border-primary/30"
            >
              Calculate Book Specs
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
