import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Cover Validator — Validate Your Full Cover Wrap Before Upload',
  description:
    'Validate your KDP cover PDF dimensions, bleed, spine width, and safe area before uploading to Amazon KDP. Free KDP cover validator — catches cover errors that cause upload rejections.',
  path: '/kdp-cover-validator',
  keywords: [
    'KDP cover validator',
    'Amazon KDP cover validator',
    'KDP cover checker',
    'KDP full wrap calculator',
    'KDP cover template validator',
    'KDP cover upload errors',
    'KDP cover dimensions',
  ],
});

export default function KdpCoverValidatorPage() {
  return (
    <SeoLandingPage
      schemaId="kdp-cover-validator-schema"
      breadcrumb={[
        { name: 'Home', url: SITE_URL },
        { name: 'KDP Cover Validator', url: `${SITE_URL}/kdp-cover-validator` },
      ]}
      hero={{
        eyebrow: 'KDP Cover Validator',
        h1: 'Validate your KDP cover wrap before Amazon rejects it.',
        intro:
          'A KDP cover PDF must be the exact right width, height, spine, and bleed — down to the hundredth of an inch. The KDP cover validator reads your exported cover PDF and checks every dimension against your book specs, so you catch cover errors before the upload reviewer does.',
        primaryCta: { label: 'Validate My Cover', href: '/checker' },
        secondaryCta: { label: 'Calculate Cover Dimensions', href: '/setup' },
      }}
      sections={[
        {
          id: 'cover-requirements',
          h2: 'What a valid KDP cover PDF must include',
          body:
            'Amazon KDP validates multiple dimensions of your cover PDF simultaneously. Every check must pass for the upload to succeed. The most common rejection causes are a missing or incorrect spine width, incorrect bleed, or a cover that only includes the front without the full wrap.',
          items: [
            {
              title: 'Full cover wrap (not just the front)',
              body: 'KDP requires the full wrap: back cover + spine + front cover. Uploading only the front cover is the single most common mistake for first-time KDP authors. The PDF width must equal back + spine + front + bleed.',
            },
            {
              title: 'Correct total width',
              body: 'Total width = trim width × 2 + spine width + 0.25" bleed. For 6×9, 300 white-paper pages: 6 + 6 + 0.676 + 0.25 = 12.926". If your PDF width is 6.25" you have only the front with bleed.',
            },
            {
              title: 'Correct total height',
              body: 'Total height = trim height + 0.25" bleed (0.125" top + 0.125" bottom). For 9" trim height: 9.25". This is the same whether the cover has a spine or not.',
            },
            {
              title: 'Barcode safe area',
              body: 'KDP prints a barcode on the back cover lower-right. Leave at least 1"×2" in the lower-right quadrant of the back cover clear of critical content. The validator flags content that overlaps the barcode zone.',
            },
          ],
        },
        {
          id: 'common-cover-errors',
          h2: 'Common KDP cover upload errors and how to fix them',
          body:
            'Most cover rejections come from the same set of mistakes. Understanding the root cause — not just the error message — is what lets you fix it and move forward.',
          items: [
            {
              title: '"Cover dimensions are incorrect"',
              body: 'The PDF width or height does not match KDP\'s expected size for your page count, trim, and paper type. Recalculate the full cover dimensions and rebuild the cover canvas to the corrected size.',
            },
            {
              title: '"Bleed is missing or insufficient"',
              body: 'The PDF does not include 0.125" bleed on all four sides. The most common cause: exported at the trim size instead of the bleed size, or exported from a canvas without the bleed area included.',
            },
            {
              title: '"Image resolution is too low"',
              body: 'Cover images should be at least 300 DPI at the final print size. A 6×9" cover at 300 DPI needs at least 1950×2850 pixels at the print dimensions. Raster images scaled up will be flagged.',
            },
            {
              title: '"Spine width does not match"',
              body: 'The PDF cover width implies a spine width that does not match the current page count. Usually caused by building the cover with a different page count than what is uploaded as the manuscript.',
            },
          ],
        },
      ]}
      howTo={{
        name: 'How to validate your KDP cover before uploading',
        description:
          'Calculate the correct cover dimensions, export the cover PDF, and validate it against the expected spec before uploading to Amazon KDP.',
        steps: [
          {
            name: 'Finalize page count before building the cover',
            text: 'The spine width and total cover width depend on page count. Finalize the manuscript before building the cover to avoid rebuilding after page count changes.',
          },
          {
            name: 'Calculate the exact cover dimensions',
            text: 'Use Smart Book Setup to get the full cover PDF dimensions: total width, height, spine width, and bleed. These are the exact numbers to enter in your design tool.',
            url: `${SITE_URL}/setup`,
          },
          {
            name: 'Build the full cover wrap',
            text: 'Create a canvas at the full bleed dimensions. Include the back cover, spine, and front cover — do not design just the front and upload it as the full wrap.',
          },
          {
            name: 'Export the cover PDF with bleed enabled',
            text: 'Export using PDF Print quality with bleed enabled in the export dialog. Confirm the exported file dimensions match the bleed-inclusive total cover dimensions.',
          },
          {
            name: 'Scan the cover PDF in the KDP cover validator',
            text: 'Upload the cover PDF. The validator reads actual dimensions and checks total width, height, implied spine, bleed, and safe area compliance.',
            url: `${SITE_URL}/checker`,
          },
        ],
      }}
      faqs={[
        {
          question: 'What makes a KDP cover PDF invalid?',
          answer:
            'The most common causes: wrong total width (missing spine or bleed), wrong height (missing bleed), front-cover-only PDF instead of a full wrap, missing image bleed, low-resolution images, or a spine width that does not match the current page count.',
        },
        {
          question: 'How do I check if my cover includes the full wrap?',
          answer:
            'The total cover width should be roughly 2× the trim width plus the spine plus 0.25" for bleed. If your PDF width is close to your trim width, you have only the front cover and not the full wrap.',
        },
        {
          question: 'Does the KDP cover validator check image resolution?',
          answer:
            'The checker reads PDF metadata and flags when raster images appear below 300 DPI at the print size. Very low-resolution cover art will be visible in the check results.',
        },
        {
          question: 'Can I upload a JPEG cover to KDP instead of a PDF?',
          answer:
            'KDP prefers PDF for print books because PDFs preserve dimensions, color profile, bleed, and font embedding. JPEG covers may be accepted for some formats but PDF is the recommended format for accurate validation.',
        },
        {
          question: 'Why does my cover look perfect in the preview but fail the validator?',
          answer:
            'The KDP cover upload previewer shows how the cover looks visually, but the validator checks the raw PDF dimensions. Dimensions can be off by fractions of an inch that are invisible in a scaled preview.',
        },
        {
          question: 'How do I fix a cover where the spine calculation is wrong?',
          answer:
            'Recalculate the spine width using the current page count and paper type. Rebuild the cover canvas to the corrected total width, shift the spine content, and re-export the PDF.',
        },
      ]}
    />
  );
}
