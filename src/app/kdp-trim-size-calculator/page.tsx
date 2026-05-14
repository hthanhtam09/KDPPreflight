import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Trim Size Calculator — Find the Right Paperback Dimensions',
  description:
    'Calculate exact KDP trim size, bleed dimensions, and cover size for your Amazon paperback or hardcover. Free browser-based KDP trim size calculator with common trim presets.',
  path: '/kdp-trim-size-calculator',
  keywords: [
    'KDP trim size calculator',
    'Amazon KDP trim size guide',
    'KDP cover dimensions',
    'KDP paperback size',
    'KDP book dimensions',
    'KDP trim mismatch',
  ],
});

export default function KdpTrimSizeCalculatorPage() {
  return (
    <SeoLandingPage
      schemaId="kdp-trim-size-schema"
      breadcrumb={[
        { name: 'Home', url: SITE_URL },
        { name: 'KDP Trim Size Calculator', url: `${SITE_URL}/kdp-trim-size-calculator` },
      ]}
      hero={{
        eyebrow: 'KDP Trim Size Calculator',
        h1: 'Calculate your KDP trim size, cover size, and bleed dimensions.',
        intro:
          'Getting the trim size right before you design saves hours of rework. The KDP trim size calculator gives you the exact PDF dimensions for your manuscript, full cover wrap, and bleed area based on your selected trim, paper type, and page count.',
        primaryCta: { label: 'Calculate My KDP Specs', href: '/setup' },
        secondaryCta: { label: 'Check My Exported File', href: '/checker' },
      }}
      sections={[
        {
          id: 'common-trim-sizes',
          h2: 'Common KDP trim sizes and their PDF dimensions',
          body:
            'Amazon KDP supports dozens of trim sizes. The most common paperback trim sizes for non-fiction, fiction, and large-format books are listed below with their bleed-inclusive PDF dimensions.',
          items: [
            {
              title: '5" × 8" — Compact fiction & poetry',
              body: 'Trim: 5×8". Without bleed manuscript: 5×8". With bleed: 5.25×8.25". Popular for novels, short story collections, and poetry. Narrow spine requires 100+ pages for spine text.',
            },
            {
              title: '5.5" × 8.5" — Standard trade paperback',
              body: 'Trim: 5.5×8.5". Without bleed: 5.5×8.5". With bleed: 5.75×8.75". One of the most popular KDP fiction sizes. Works well for 200–400 page novels.',
            },
            {
              title: '6" × 9" — Standard non-fiction',
              body: 'Trim: 6×9". Without bleed: 6×9". With bleed: 6.25×9.25". The most popular size for business books, memoirs, and non-fiction. Great spine width for 150+ pages.',
            },
            {
              title: '8.5" × 11" — Large-format & workbooks',
              body: 'Trim: 8.5×11". Without bleed: 8.5×11". With bleed: 8.75×11.25". Used for workbooks, journals, activity books, and coloring books where full-page content is common.',
            },
          ],
        },
        {
          id: 'trim-mismatch',
          h2: 'Why KDP trim size mismatches cause upload rejections',
          body:
            'A trim mismatch happens when the PDF you upload does not match the trim size you selected in KDP\'s book setup. Even a difference of 0.01" can trigger a rejection. KDPPreflight compares your uploaded PDF to the expected dimensions and shows exactly how many inches are off.',
          items: [
            {
              title: 'Wrong canvas size in design tool',
              body: 'If you set your Canva or Affinity page at 6×9 but selected 5.5×8.5 in KDP, the dimensions will not match. Always confirm the trim in KDP before setting up the design file.',
            },
            {
              title: 'Bleed included vs. excluded',
              body: 'A manuscript exported with bleed at 6.25×9.25 uploaded to a no-bleed KDP project (expecting 6×9) will fail. Match the export mode to the KDP project setting.',
            },
            {
              title: 'Rounding or unit conversion errors',
              body: 'Some tools let you work in millimeters. A 6×9 in millimeters is 152.4×228.6mm. Small rounding errors in the conversion can produce a PDF that is a fraction of an inch off.',
            },
            {
              title: 'Cover wrap width calculation error',
              body: 'A paperback cover must be: back width + spine + front width + bleed on all sides. If the spine width changed because the page count changed, the cover PDF is now the wrong width.',
            },
          ],
        },
      ]}
      howTo={{
        name: 'How to calculate and verify your KDP trim size',
        description:
          'Use Smart Book Setup to calculate your KDP trim dimensions, then use the checker to confirm your exported PDF matches.',
        steps: [
          {
            name: 'Select your trim size in KDP',
            text: 'In KDP\'s book setup, choose the trim size before starting the design. The trim size determines every other dimension including cover, spine, and bleed.',
          },
          {
            name: 'Calculate full dimensions with Smart Book Setup',
            text: 'Enter trim size, page count, paper type, and bleed preference. The tool outputs manuscript PDF size, cover PDF size, spine width, and safe area.',
            url: `${SITE_URL}/setup`,
          },
          {
            name: 'Design to the exact calculated dimensions',
            text: 'Create your document at the bleed size, not the trim size, if your design has background colors or art that reach the page edge.',
          },
          {
            name: 'Scan the exported PDF',
            text: 'Upload the finished cover or manuscript PDF. The checker reads the PDF dimensions and compares to the target trim with bleed, flagging any mismatch.',
            url: `${SITE_URL}/checker`,
          },
        ],
      }}
      faqs={[
        {
          question: 'What trim size is most popular for KDP?',
          answer:
            '6×9" is the most popular KDP trim for non-fiction and general trade paperbacks. 5.5×8.5" is common for fiction. 8.5×11" is widely used for journals, workbooks, and large-format books.',
        },
        {
          question: 'Can I change the KDP trim size after uploading?',
          answer:
            'Yes, but you must re-upload files to match the new trim. The cover PDF total width changes when the trim changes because the spine calculation updates. Recalculate all dimensions with the new trim.',
        },
        {
          question: 'Why does my PDF trim size not match what I see in my design tool?',
          answer:
            'Export settings sometimes override the document page size. Check the actual exported PDF dimensions using the KDP cover checker, not the dimensions shown in your design software.',
        },
        {
          question: 'What is the maximum trim size for KDP paperback?',
          answer:
            'KDP supports paperback trim sizes from 4"×6" to 8.5"×11" (US) and 6.69"×9.61" (international). Always confirm supported sizes in KDP\'s current guidelines as they may change.',
        },
        {
          question: 'Do hardcovers use the same trim sizes as paperbacks?',
          answer:
            'KDP hardcovers use the same trim sizes as paperbacks but the cover wrap calculation differs. Hardcover cases wrap differently, so confirm the cover template in KDP\'s hardcover setup.',
        },
        {
          question: 'How do I find the exact trim size to enter in my design tool?',
          answer:
            'Use Smart Book Setup: enter the trim size, page count, and paper type. The tool gives the precise manuscript and cover PDF dimensions to enter in your design software.',
        },
      ]}
    />
  );
}
