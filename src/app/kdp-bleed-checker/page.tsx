import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Bleed Checker — Fix Bleed Errors Before Amazon Rejects Your Cover',
  description:
    'Use the free KDP bleed checker to verify that your cover and manuscript PDFs include the correct 0.125" bleed. Catch bleed errors before Amazon KDP rejects your upload.',
  path: '/kdp-bleed-checker',
  keywords: [
    'KDP bleed checker',
    'how to fix KDP bleed',
    'KDP bleed error',
    'paperback bleed issue',
    'bleed margin guide',
    'KDP 0.125 bleed',
    'KDP cover bleed',
  ],
});

export default function KdpBleedCheckerPage() {
  return (
    <SeoLandingPage
      schemaId="kdp-bleed-checker-schema"
      breadcrumb={[
        { name: 'Home', url: SITE_URL },
        { name: 'KDP Bleed Checker', url: `${SITE_URL}/kdp-bleed-checker` },
      ]}
      hero={{
        eyebrow: 'KDP Bleed Checker',
        h1: 'Check KDP bleed errors before Amazon rejects your cover.',
        intro:
          'A missing or incorrect bleed is one of the most common reasons Amazon KDP rejects a cover or manuscript PDF. The KDP bleed checker scans your exported PDF and shows the exact bleed margin found versus what KDP expects — so you can fix the export setting before you upload.',
        primaryCta: { label: 'Scan My KDP Files', href: '/checker' },
        secondaryCta: { label: 'Calculate Bleed Specs', href: '/setup' },
      }}
      sections={[
        {
          id: 'what-is-bleed',
          h2: 'What is KDP bleed and why does it matter?',
          body:
            'KDP bleed is the extra artwork or background color that extends beyond the finished trim edge of your book. When the book is cut to its final size, the bleed area is trimmed away — preventing white edges from showing if the cut is slightly off-center. For Amazon KDP paperbacks, the required bleed is 0.125" (3mm) added to the outside, top, and bottom edges of every page that has bleed content.',
          items: [
            {
              title: 'What happens with no bleed?',
              body: 'If artwork or a background color stops exactly at the trim line and the physical cut shifts 1–2mm, a thin white edge appears on the finished book. KDP may reject the file or produce a poor-quality result.',
            },
            {
              title: 'Cover vs. manuscript bleed',
              body: 'The full cover wrap always needs bleed. Manuscripts only need bleed when pages have backgrounds or full-bleed artwork. Text-only interiors with white margins can use the no-bleed export setting.',
            },
            {
              title: 'Bleed dimensions by trim size',
              body: 'For 6×9: with bleed export as 6.25×9.25". For 8.5×11: export as 8.75×11.25". For 5×8: export as 5.25×8.25". The full cover wrap adds bleed on all four sides plus includes the spine.',
            },
            {
              title: 'Common Canva bleed mistake',
              body: 'Canva exports at the canvas size. If the canvas was set to the trim size rather than the bleed size, the PDF will be 0.25" short on width and height. Always set up the Canva page at the bleed size.',
            },
          ],
        },
        {
          id: 'how-to-fix',
          h2: 'How to fix a KDP bleed error',
          body:
            'After the bleed checker identifies the problem, the fix depends on the design tool you used. Every tool has a specific export or document setting that controls whether bleed is included in the output PDF.',
          items: [
            {
              title: 'Fix bleed in Affinity Publisher',
              body: 'Go to File → Export → PDF → More → enable "Include Bleed". Set bleed to 3mm (0.125") in the document setup under File → Document Setup → Spread Setup.',
            },
            {
              title: 'Fix bleed in Adobe InDesign',
              body: 'In File → Export, go to Marks and Bleed → check "Use Document Bleed Settings". Make sure the document bleed is set to 0.125" under File → Document Setup.',
            },
            {
              title: 'Fix bleed in Adobe Illustrator',
              body: 'In File → Save As (PDF), click Marks and Bleeds. Enable "Use Document Bleed Settings". Set bleed in File → Document Setup → Bleed (0.125" on all sides).',
            },
            {
              title: 'Fix bleed in Canva',
              body: 'Create the design page at the bleed size (trim + 0.25" on width and height). When exporting PDF Print, enable "Crop marks and bleed" in the download settings.',
            },
          ],
        },
      ]}
      howTo={{
        name: 'How to check and fix KDP bleed before uploading',
        description:
          'Use KDPPreflight to calculate the correct bleed dimensions, scan your exported PDF, and confirm the bleed is correct before uploading to Amazon KDP.',
        steps: [
          {
            name: 'Calculate your KDP bleed spec',
            text: 'Enter your trim size, paper type, and cover format in Smart Book Setup to get the exact bleed dimensions required for your book.',
            url: `${SITE_URL}/setup`,
          },
          {
            name: 'Export your PDF with bleed enabled',
            text: 'In your design tool, enable the bleed export setting before saving the PDF. The final file dimensions should match the bleed size, not the trim size.',
          },
          {
            name: 'Scan the PDF in the KDP cover checker',
            text: 'Upload your cover or manuscript PDF. The checker reads the actual PDF dimensions and bleed box and compares them to the expected bleed spec.',
            url: `${SITE_URL}/checker`,
          },
          {
            name: 'Review actual vs. expected measurements',
            text: 'If the actual bleed is missing or incorrect, the checker shows exactly how many inches are off and which export setting to adjust.',
          },
        ],
      }}
      faqs={[
        {
          question: 'What is KDP bleed?',
          answer:
            'KDP bleed is the 0.125" (3mm) extra area added beyond the trim edge that gets cut away during production. It prevents white edges from appearing if the cut is slightly off-center.',
        },
        {
          question: 'Does every KDP book need bleed?',
          answer:
            'No. Manuscripts with white margins and no edge artwork can use the no-bleed setting. Bleed is required when backgrounds, images, or artwork extend to the page edges.',
        },
        {
          question: 'How much bleed does KDP require?',
          answer:
            'Amazon KDP requires 0.125" (approximately 3mm) of bleed on all four sides of the page. For a 6×9 trim, the bleed-inclusive page size is 6.25×9.25".',
        },
        {
          question: 'Why does Canva export look correct but KDP rejects it?',
          answer:
            'Canva exports at the canvas page size. If the design page was created at the trim size instead of the bleed size, the PDF will be exactly 0.25" short in both dimensions. Set up the Canva page to include the bleed area.',
        },
        {
          question: 'Can the KDP bleed checker find interior bleed problems?',
          answer:
            'Yes. The manuscript checker compares each page\'s PDF dimensions to the expected bleed size so you can find specific pages that are missing bleed in a large interior file.',
        },
        {
          question: 'What if my PDF has bleed marks but KDP still rejects it?',
          answer:
            'Bleed marks (crop marks) are visual guides, not extra bleed area. The actual PDF page size must be larger than the trim size to include real bleed. Check that the PDF page box — not just the artwork — extends beyond the trim.',
        },
      ]}
    />
  );
}
