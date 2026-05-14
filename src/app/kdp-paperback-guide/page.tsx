import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Paperback Guide — Formatting, Dimensions & Upload Checklist',
  description:
    'Complete guide to formatting and uploading a KDP paperback. Covers trim size, bleed, spine width, margins, cover wrap, and the most common Amazon KDP paperback upload errors.',
  path: '/kdp-paperback-guide',
  keywords: [
    'KDP paperback guide',
    'KDP paperback formatting',
    'Amazon KDP paperback checklist',
    'KDP paperback dimensions',
    'KDP paperback upload',
    'self-publishing KDP',
  ],
});

export default function KdpPaperbackGuidePage() {
  return (
    <SeoLandingPage
      schemaId="kdp-paperback-guide-schema"
      breadcrumb={[
        { name: 'Home', url: SITE_URL },
        { name: 'KDP Paperback Guide', url: `${SITE_URL}/kdp-paperback-guide` },
      ]}
      hero={{
        eyebrow: 'KDP Paperback Guide',
        h1: 'The complete KDP paperback formatting and upload guide.',
        intro:
          'Publishing a paperback on Amazon KDP requires precise file preparation across three separate areas: manuscript formatting, cover wrap design, and PDF export settings. This guide covers every dimension, margin, and bleed requirement so you can upload without the most common rejections.',
        primaryCta: { label: 'Scan My KDP Files', href: '/checker' },
        secondaryCta: { label: 'Calculate My Specs', href: '/setup' },
      }}
      sections={[
        {
          id: 'manuscript-requirements',
          h2: 'KDP paperback manuscript requirements',
          body:
            'The interior PDF (manuscript) must match the trim size you selected in KDP. If you use bleed in the interior, the PDF must be larger than the trim size. Margins must keep text inside the safe area.',
          items: [
            {
              title: 'PDF dimensions',
              body: 'Without bleed: exactly matches the trim size (e.g., 6×9"). With bleed: trim + 0.125" on outside, top, and bottom (e.g., 6.25×9.25" for 6×9 trim). The gutter edge does not get bleed.',
            },
            {
              title: 'Interior margins',
              body: 'KDP recommends a minimum 0.25" margin on all sides and a wider inside (gutter) margin to account for binding. For books over 150 pages, use 0.375" or more for the gutter.',
            },
            {
              title: 'Page count requirements',
              body: 'KDP requires a minimum of 24 pages and a maximum of 828 pages for paperbacks. The spine width must be at least 0.0625" for a cover to print — roughly 28 pages of white paper.',
            },
            {
              title: 'Font embedding',
              body: 'All fonts in the manuscript PDF must be embedded. Missing font embedding can cause text to render incorrectly or trigger a rejection. Check font embedding in Acrobat or use PDF/A export.',
            },
          ],
        },
        {
          id: 'cover-requirements',
          h2: 'KDP paperback cover requirements',
          body:
            'The cover PDF must include the full wrap: back cover, spine, and front cover, all at the correct bleed-inclusive dimensions. The spine width is calculated from the manuscript page count and paper type.',
          items: [
            {
              title: 'Cover PDF total width',
              body: 'Back trim width + spine width + front trim width + 0.25" (bleed on both sides). Must be recalculated every time the page count changes significantly.',
            },
            {
              title: 'Cover PDF total height',
              body: 'Trim height + 0.25" bleed (0.125" top + 0.125" bottom). The height is the same for manuscript and cover — both add 0.25" when bleed is enabled.',
            },
            {
              title: 'Cover image resolution',
              body: 'Cover images should be at least 300 DPI at print size. KDP recommends 300 DPI minimum. Images below 200 DPI will produce visible pixelation in print.',
            },
            {
              title: 'Color profile',
              body: 'Use CMYK or RGB — KDP converts RGB to CMYK for print. Avoid pure black (0,0,0,100 CMYK) for large text blocks; use rich black (60,40,40,100) or design-tool default CMYK black.',
            },
          ],
        },
        {
          id: 'upload-checklist',
          h2: 'KDP paperback upload checklist',
          body:
            'Run through this checklist before uploading to reduce rejection risk. Every item corresponds to a real upload error that Amazon KDP commonly flags.',
          items: [
            {
              title: 'Before designing',
              body: '✓ Trim size selected in KDP\n✓ Spine width calculated\n✓ Cover canvas set to correct total dimensions\n✓ Bleed included in canvas setup',
            },
            {
              title: 'Before exporting',
              body: '✓ All fonts embedded\n✓ Images at 300+ DPI\n✓ Bleed enabled in export dialog\n✓ No transparent backgrounds where solid color is intended',
            },
            {
              title: 'After exporting — manuscript',
              body: '✓ PDF dimensions match expected trim+bleed size\n✓ Page count matches KDP project\n✓ No mixed page sizes in the PDF\n✓ Gutter margin is adequate for binding',
            },
            {
              title: 'After exporting — cover',
              body: '✓ PDF total width matches calculated cover wrap\n✓ Spine content is within the spine boundary\n✓ Barcode area on back cover is clear\n✓ All four bleed edges are present',
            },
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I format a KDP paperback manuscript?',
          answer:
            'Set the page size to your chosen trim size (or trim + bleed if using bleed). Set margins to at least 0.25" on all sides with a wider gutter. Embed all fonts. Export as PDF without security restrictions.',
        },
        {
          question: 'What is the cheapest paper for KDP paperbacks?',
          answer:
            'White paper (60# offset) is the standard and least expensive paper for black-and-white interiors. Cream paper costs slightly more and produces a different reading feel. Color interiors are significantly more expensive per page.',
        },
        {
          question: 'Do KDP paperbacks look professional?',
          answer:
            'Yes, when files are prepared correctly with proper margins, resolution, and cover design. KDP uses print-on-demand technology that produces professional-quality results when the source files meet the technical requirements.',
        },
        {
          question: 'Can I upload an ISBN that I purchased elsewhere to KDP?',
          answer:
            'Yes. KDP accepts your own ISBN. Enter it during the book setup. KDP will also assign a free ISBN if you do not have one, though that ISBN is tied to KDP as the publisher of record.',
        },
        {
          question: 'Why does my KDP paperback interior look different from my design software preview?',
          answer:
            'Print rendering differs from screen rendering. Colors may shift (RGB to CMYK), and fonts may appear slightly different at print resolution. Always order a physical proof copy before making your book available for purchase.',
        },
        {
          question: 'How long does KDP take to review a paperback upload?',
          answer:
            'KDP typically reviews uploads within 72 hours. Files with dimension or bleed errors are often caught within minutes by the automated check. Files that pass the automated check may still be reviewed manually before publication.',
        },
      ]}
    />
  );
}
