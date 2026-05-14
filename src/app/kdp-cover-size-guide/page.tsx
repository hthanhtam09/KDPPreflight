import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Cover Size Guide — Full Cover Wrap Dimensions for Every Trim Size',
  description:
    'Find the exact KDP cover size for your paperback or hardcover. Full cover wrap dimensions, spine width, and bleed for every common trim size. Free KDP cover size guide.',
  path: '/kdp-cover-size-guide',
  keywords: [
    'KDP cover size guide',
    'KDP cover dimensions',
    'Amazon KDP cover size',
    'KDP paperback cover template',
    'KDP full wrap dimensions',
    'KDP cover width calculator',
  ],
});

export default function KdpCoverSizeGuidePage() {
  return (
    <SeoLandingPage
      schemaId="kdp-cover-size-guide-schema"
      breadcrumb={[
        { name: 'Home', url: SITE_URL },
        { name: 'KDP Cover Size Guide', url: `${SITE_URL}/kdp-cover-size-guide` },
      ]}
      hero={{
        eyebrow: 'KDP Cover Size Guide',
        h1: 'Find the exact KDP cover dimensions for your book.',
        intro:
          'The KDP cover PDF size changes with every trim size, page count, and paper type combination. This guide explains how the full cover wrap dimension is calculated and shows common cover sizes — plus how to use the KDP cover size calculator to get the exact pixel and inch dimensions for your specific book.',
        primaryCta: { label: 'Calculate My Cover Size', href: '/setup' },
        secondaryCta: { label: 'Validate My Cover', href: '/checker' },
      }}
      sections={[
        {
          id: 'cover-size-formula',
          h2: 'How to calculate KDP cover size',
          body:
            'The full cover wrap PDF size is determined by a formula using your trim size, spine width (from page count and paper type), and bleed. The height is simply the trim height plus bleed. The width requires adding back cover, spine, front cover, and bleed together.',
          items: [
            {
              title: 'Cover width formula',
              body: 'Total width = trim width + spine width + trim width + 0.25" (bleed both sides). For 6×9 with 300 white-paper pages: 6 + 0.676 + 6 + 0.25 = 12.926". This is the PDF canvas width.',
            },
            {
              title: 'Cover height formula',
              body: 'Total height = trim height + 0.25" (0.125" top bleed + 0.125" bottom bleed). For 6×9 trim: 9 + 0.25 = 9.25". Height does not change with page count.',
            },
            {
              title: 'Spine width in the formula',
              body: 'Spine width = page count × paper constant. White paper: ×0.002252". Cream paper: ×0.0025". Color: ×0.002347". The spine is the only variable that changes with your page count.',
            },
            {
              title: 'Pixel dimensions for the cover',
              body: 'At 300 DPI: multiply inches by 300. A 12.926"×9.25" cover at 300 DPI is 3878×2775 pixels. At 350 DPI: multiply by 350. KDP accepts 300 DPI minimum for print quality.',
            },
          ],
        },
        {
          id: 'common-sizes',
          h2: 'Common KDP cover sizes reference',
          body:
            'The table below shows common cover sizes at representative page counts. These are bleed-inclusive dimensions for the full cover wrap PDF. Use Smart Book Setup for the exact size for your specific page count.',
          items: [
            {
              title: '5×8 trim — 200 white-paper pages',
              body: 'Spine: 200 × 0.002252 = 0.45". Total width: 5 + 0.45 + 5 + 0.25 = 10.70". Total height: 8.25". Full cover canvas: 10.70"×8.25" (3210×2475 px at 300 DPI).',
            },
            {
              title: '6×9 trim — 300 white-paper pages',
              body: 'Spine: 300 × 0.002252 = 0.676". Total width: 6 + 0.676 + 6 + 0.25 = 12.926". Total height: 9.25". Full cover canvas: 12.926"×9.25" (3878×2775 px at 300 DPI).',
            },
            {
              title: '8.5×11 trim — 100 white-paper pages',
              body: 'Spine: 100 × 0.002252 = 0.225". Total width: 8.5 + 0.225 + 8.5 + 0.25 = 17.475". Total height: 11.25". Full cover canvas: 17.475"×11.25" (5243×3375 px at 300 DPI).',
            },
            {
              title: '5.5×8.5 trim — 250 cream-paper pages',
              body: 'Spine: 250 × 0.0025 = 0.625". Total width: 5.5 + 0.625 + 5.5 + 0.25 = 11.875". Total height: 8.75". Full cover canvas: 11.875"×8.75" (3563×2625 px at 300 DPI).',
            },
          ],
        },
        {
          id: 'design-tools',
          h2: 'Setting up the cover canvas in common design tools',
          body:
            'Once you have the exact cover dimensions, you need to create a document of exactly that size in your design tool. Here is how to set up the cover canvas in the most common KDP design tools.',
          items: [
            {
              title: 'Canva',
              body: 'Create a custom design at the full cover width × height. Work in inches if possible. Add guide lines at the spine boundaries (from left: trim width + 0.125" bleed, and trim width + 0.125" bleed + spine width).',
            },
            {
              title: 'Affinity Publisher',
              body: 'File → New → set width and height to the full cover bleed dimensions. Enable bleed at 0.125" in Document Setup → Spread Setup → Bleed. The bleed is already included in the canvas size.',
            },
            {
              title: 'Adobe InDesign',
              body: 'New Document → set the page size to the full cover bleed dimensions. Add bleed 0.125" in the new document dialog Bleed field. Draw guide columns to mark the spine boundaries.',
            },
            {
              title: 'Adobe Illustrator',
              body: 'New Document → set artboard size to the full cover bleed dimensions. File → Document Setup → set bleed to 0.125" on all sides. The artboard is the trim; the bleed extends beyond.',
            },
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I find the exact KDP cover size for my book?',
          answer:
            'Use Smart Book Setup: enter your trim size, page count, and paper type. The tool calculates the full cover PDF dimensions (width, height, spine width) to the nearest thousandth of an inch.',
        },
        {
          question: 'Does the KDP cover size change when I add pages?',
          answer:
            'Yes — the spine width changes with page count, which changes the total cover width. If you add or remove pages after building the cover, you must recalculate the spine and rebuild the cover canvas.',
        },
        {
          question: 'What pixel resolution should I use for the KDP cover?',
          answer:
            'KDP requires a minimum of 300 DPI. To get pixels, multiply the inch dimensions by 300. For maximum quality, some designers use 350 DPI. Anything above 300 is acceptable.',
        },
        {
          question: 'Can I use the same cover PDF for both paperback and hardcover?',
          answer:
            'No. Paperback and hardcover covers use different wrap calculations and templates. A hardcover has a case wrap that differs from a paperback\'s glued spine. Always create separate covers for each format.',
        },
        {
          question: 'Why is my cover 0.1" wider than the KDP template says?',
          answer:
            'The most common cause is using an outdated template or a different page count than the template was generated for. Recalculate the spine width and total cover size using the current page count.',
        },
        {
          question: 'What DPI should I set in Canva for the KDP cover?',
          answer:
            'Canva exports at 300 DPI for PDF Print. Set up the canvas in inches at the correct dimensions. Canva automatically outputs at 300 DPI — do not try to set DPI manually in Canva.',
        },
      ]}
    />
  );
}
