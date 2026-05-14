import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Spine Width Calculator — Calculate Paperback Spine by Page Count',
  description:
    'Calculate exact KDP spine width for your paperback or hardcover by entering page count and paper type. Free KDP spine width calculator — white paper, cream paper, and color interiors.',
  path: '/kdp-spine-width-calculator',
  keywords: [
    'KDP spine width calculator',
    'KDP spine width guide',
    'KDP paperback spine',
    'KDP spine calculation',
    'Amazon KDP spine',
    'how to calculate KDP spine',
  ],
});

export default function KdpSpineWidthCalculatorPage() {
  return (
    <SeoLandingPage
      schemaId="kdp-spine-width-schema"
      breadcrumb={[
        { name: 'Home', url: SITE_URL },
        { name: 'KDP Spine Width Calculator', url: `${SITE_URL}/kdp-spine-width-calculator` },
      ]}
      hero={{
        eyebrow: 'KDP Spine Width Calculator',
        h1: 'Calculate your KDP spine width from page count and paper type.',
        intro:
          'The spine width of your KDP paperback determines how wide the cover PDF must be. It changes with every page you add or remove and differs between white paper, cream paper, and color interiors. The KDP spine width calculator applies the official KDP formula to give you the precise spine measurement before you export the cover.',
        primaryCta: { label: 'Calculate Spine Width', href: '/setup' },
        secondaryCta: { label: 'Scan My Cover PDF', href: '/checker' },
      }}
      sections={[
        {
          id: 'spine-formula',
          h2: 'How KDP spine width is calculated',
          body:
            'Amazon KDP uses a fixed thickness-per-page that varies by paper stock. Multiply your page count by the paper constant to get the spine width in inches. Add 0.125" bleed on both spine edges when building the full cover wrap.',
          items: [
            {
              title: 'White paper formula',
              body: 'Spine width = page count × 0.002252". For 300 pages: 300 × 0.002252 = 0.6756" (approximately 0.676"). White paper is standard for most fiction and non-fiction.',
            },
            {
              title: 'Cream paper formula',
              body: 'Spine width = page count × 0.0025". For 300 pages: 300 × 0.0025 = 0.75". Cream paper is thicker per sheet and produces a wider spine at the same page count.',
            },
            {
              title: 'Color interior formula',
              body: 'Spine width = page count × 0.002347". Color interiors use a slightly different paper weight. The exact constant may vary — always verify against the current KDP template.',
            },
            {
              title: 'Minimum spine for text',
              body: 'KDP recommends at least 100 pages (0.225" white paper spine) to display spine text. Very thin spines support only art, not readable author name or title.',
            },
          ],
        },
        {
          id: 'spine-cover-width',
          h2: 'How spine width affects the full cover PDF width',
          body:
            'The cover wrap PDF total width = back cover + spine + front cover + bleed on both sides. Even a small page count change moves the spine boundary and shifts where back cover content must sit.',
          items: [
            {
              title: 'Full cover width formula',
              body: 'Total width = trim width + spine width + trim width + (2 × 0.125" bleed). For a 6×9 with 300 white-paper pages: 6 + 0.676 + 6 + 0.25 = 12.926" total width.',
            },
            {
              title: 'Page count changes after design',
              body: 'Adding or removing 20–30 pages can shift the spine by 0.05–0.06". If back-cover text is close to the spine, it may overlap after a page count change.',
            },
            {
              title: 'Hardcover spine calculation',
              body: 'Hardcover spine width uses a slightly different wrap method than paperback. KDP provides a separate hardcover template generator. Always download a fresh template after finalizing page count.',
            },
            {
              title: 'Spine too narrow for title',
              body: 'If the calculated spine is under 0.25–0.3", the title font must be very small or rotated sideways. Consider condensed fonts or an art-only spine design.',
            },
          ],
        },
      ]}
      howTo={{
        name: 'How to calculate and verify your KDP spine width',
        description:
          'Use Smart Book Setup to get the exact spine width, then scan the cover PDF to confirm the spine measurement matches.',
        steps: [
          {
            name: 'Finalize your page count',
            text: 'Before calculating the spine, finalize the number of pages in your manuscript. The cover must be redesigned if the page count changes significantly after the cover is created.',
          },
          {
            name: 'Enter specs in Smart Book Setup',
            text: 'Enter trim size, page count, and paper type. The setup tool calculates spine width and the full cover PDF dimensions including bleed.',
            url: `${SITE_URL}/setup`,
          },
          {
            name: 'Build the cover to the exact calculated width',
            text: 'Set up your design canvas to the exact total cover width (back + spine + front + bleed). Position spine text within the calculated spine boundary.',
          },
          {
            name: 'Scan the exported cover PDF',
            text: 'Upload the finished cover PDF. The checker reads the PDF width and calculates the implied spine, comparing it to the expected spine for your page count and paper type.',
            url: `${SITE_URL}/checker`,
          },
        ],
      }}
      faqs={[
        {
          question: 'What is KDP spine width?',
          answer:
            'KDP spine width is the thickness of the book\'s spine — the narrow side visible on a bookshelf. It is calculated from page count × paper thickness constant. A 300-page white-paper book has a spine of approximately 0.676".',
        },
        {
          question: 'Does spine width change if I add pages?',
          answer:
            'Yes. Every page added to the manuscript changes the spine width. White paper adds 0.002252" per page, so 10 extra pages adds about 0.023" to the spine. Recalculate the cover width whenever the page count changes significantly.',
        },
        {
          question: 'What is the difference between white paper and cream paper spine width?',
          answer:
            'Cream paper is thicker — 0.0025" per page versus 0.002252" for white paper. A 300-page cream-paper book has a 0.75" spine versus 0.676" for white paper, a difference of 0.074".',
        },
        {
          question: 'How do I know if my spine is wide enough for text?',
          answer:
            'KDP recommends a minimum spine of about 0.225" for spine text. Below that, even small font sizes may overlap the edges. For a white-paper book, you need roughly 100 pages minimum.',
        },
        {
          question: 'Why does the KDP template generator give a different spine than my calculation?',
          answer:
            'KDP\'s template may round slightly differently or use updated paper constants. Always use the template as the authoritative source for final production, and verify your calculation against it.',
        },
        {
          question: 'My cover PDF was correct but KDP shows the spine is off — why?',
          answer:
            'The most common cause is a page count change after the cover was designed. If pages were added or removed since the cover was built, the spine calculation no longer matches the current page count. Recalculate and rebuild the cover to the new spine width.',
        },
      ]}
    />
  );
}
