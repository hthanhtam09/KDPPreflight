import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Safe Area Guide — Keep Content Inside the Safe Zone',
  description:
    'Understand KDP safe areas and margins for paperback covers and manuscripts. Learn how much margin to leave from trim edges, spine, and barcode zone to avoid cut-off content.',
  path: '/kdp-safe-area-guide',
  keywords: [
    'KDP safe area',
    'KDP safe area checker',
    'KDP safe zone',
    'KDP margin guide',
    'KDP barcode area',
    'KDP content safe zone',
    'Amazon KDP margins',
  ],
});

export default function KdpSafeAreaGuidePage() {
  return (
    <SeoLandingPage
      schemaId="kdp-safe-area-guide-schema"
      breadcrumb={[
        { name: 'Home', url: SITE_URL },
        { name: 'KDP Safe Area Guide', url: `${SITE_URL}/kdp-safe-area-guide` },
      ]}
      hero={{
        eyebrow: 'KDP Safe Area Guide',
        h1: 'Keep critical content inside the KDP safe area.',
        intro:
          'The KDP safe area is the region inside the trim line where important content — text, logos, faces, barcodes, and key artwork — should live. Content outside the safe area may be cut off during production trimming. This guide explains the exact margins required for paperback covers and manuscripts.',
        primaryCta: { label: 'Check My KDP Files', href: '/checker' },
        secondaryCta: { label: 'Calculate Safe Area', href: '/setup' },
      }}
      sections={[
        {
          id: 'cover-safe-area',
          h2: 'KDP cover safe area requirements',
          body:
            'The full cover wrap has both a bleed zone (outside the trim) and a safe zone (inside the trim). All critical content must stay inside the safe zone. Content between the safe zone and the trim line is at risk of being cut.',
          items: [
            {
              title: 'Front cover safe area',
              body: 'Keep all critical content at least 0.25" from all four trim edges of the front cover. Titles, author names, and key artwork that must not be cut should sit well inside the 0.25" safe margin.',
            },
            {
              title: 'Back cover safe area',
              body: 'Same 0.25" rule on the outside edges. Additional caution: KDP places a barcode in the lower-right of the back cover. Leave approximately 2"×1.5" in the lower-right area of the back cover clear.',
            },
            {
              title: 'Spine safe area',
              body: 'Spine text should have a minimum 0.0625" margin from both spine edges (the lines where spine meets front and back cover). On very thin spines, reduce font size or use only a visual element.',
            },
            {
              title: 'Safe area vs. bleed zone',
              body: 'Bleed extends 0.125" beyond the trim edge (required for background colors and artwork). The safe area is 0.25" inside the trim edge. Do not confuse these — bleed is outside the trim, safe area is inside.',
            },
          ],
        },
        {
          id: 'manuscript-margins',
          h2: 'KDP manuscript margin and safe area guide',
          body:
            'Interior pages also have safe area requirements. Text and images that are too close to the page edges may be cut, or may interfere with the binding gutter. KDP recommends specific minimum margins based on page count.',
          items: [
            {
              title: 'Outside edge margin (minimum)',
              body: 'Keep at least 0.25" from the outside, top, and bottom trim edges. For a text-only interior, 0.5"–0.75" outside margins produce better readability and safer production tolerance.',
            },
            {
              title: 'Gutter margin (inside edge)',
              body: 'The gutter (inside edge) needs more space because pages pull inward when bound. KDP recommends: 0–150 pages: 0.375"; 151–300: 0.5"; 301–500: 0.625"; 500+: 0.75". Increase for larger page counts.',
            },
            {
              title: 'Coloring book and activity book safe area',
              body: 'Full-page art must include 0.125" bleed on outside edges. The drawable area should be inside the safe area boundary. Content too close to binding (gutter) is inaccessible when the book is flat.',
            },
            {
              title: 'Page number and footer position',
              body: 'Page numbers placed in the bottom margin must stay at least 0.25" from the bottom trim edge. Headers and footers too close to the edge risk being partially cut in production.',
            },
          ],
        },
      ]}
      howTo={{
        name: 'How to verify your KDP safe area compliance',
        description:
          'Use KDPPreflight to calculate your safe area margins and scan your cover and manuscript files to identify content that is too close to the trim edge.',
        steps: [
          {
            name: 'Calculate your safe area boundaries',
            text: 'Use Smart Book Setup to get the safe area coordinates for your trim size, including the front cover, back cover, spine, and barcode zone.',
            url: `${SITE_URL}/setup`,
          },
          {
            name: 'Check content placement in your design',
            text: 'Enable guides at your safe area boundaries. Verify that all critical content (title, author, barcode, body text) sits inside the safe area on every page and every cover panel.',
          },
          {
            name: 'Export and scan the PDF',
            text: 'Upload your cover or manuscript PDF. The checker identifies content that falls outside the safe zone and shows exactly which area is at risk.',
            url: `${SITE_URL}/checker`,
          },
          {
            name: 'Reposition and re-export',
            text: 'Move any flagged content inside the safe boundary, re-export the PDF, and re-scan to confirm all critical content is safe.',
          },
        ],
      }}
      faqs={[
        {
          question: 'What is the KDP safe area?',
          answer:
            'The KDP safe area is the region inside the trim line where important content should be placed. KDP recommends at least 0.25" from all trim edges on the cover and at least 0.25"–0.75" margins in the manuscript depending on page count.',
        },
        {
          question: 'What happens if content is outside the safe area?',
          answer:
            'Content in the risk zone between the safe area and the trim edge may be partially cut off during production trimming. Critical information like the author name, barcode, or key artwork should always be inside the safe area.',
        },
        {
          question: 'Where does KDP place the barcode on the back cover?',
          answer:
            'KDP places the barcode in the lower-right area of the back cover. Leave at least 2"×1.5" clear in the lower-right quadrant of the back cover. Do not place critical content in this zone.',
        },
        {
          question: 'Do bleed and safe area overlap?',
          answer:
            'No. Bleed extends 0.125" beyond the trim edge (outside the trim). The safe area is 0.25" inside the trim edge (inside the trim). They are on opposite sides of the trim line and do not overlap.',
        },
        {
          question: 'How wide should the gutter margin be?',
          answer:
            'KDP recommends a wider inside margin (gutter) to account for binding. For 0–150 pages: 0.375"; 151–300 pages: 0.5"; 301–500 pages: 0.625"; 500+ pages: 0.75". Always use at least 0.375" for any paperback.',
        },
        {
          question: 'Can I put text on the spine if it is very thin?',
          answer:
            'KDP recommends avoiding spine text on books with fewer than 100 pages (approximately 0.225" spine). Below that, text is usually too small to read and may overflow the spine edges.',
        },
      ]}
    />
  );
}
