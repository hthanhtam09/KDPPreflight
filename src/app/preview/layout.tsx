import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { generatePageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP 3D Book Preview — Paperback & Hardcover',
  description:
    'Preview your KDP paperback or hardcover as a 3D physical object before uploading to Amazon. Inspect the spine, cover wrap, and book proportions. Export transparent PNG mockups.',
  path: '/preview',
  keywords: [
    'KDP 3D book preview',
    'KDP book mockup',
    'KDP paperback preview',
    'KDP hardcover preview',
    'Amazon KDP book preview',
    'KDP cover mockup',
    'KDP spine preview',
  ],
});

const faqs = [
  {
    question: 'Can I preview a KDP paperback in 3D?',
    answer:
      'Yes. The 3D preview shows a realistic paperback with cover art, spine, and page stack so you can inspect the book as a physical object before uploading to Amazon KDP.',
  },
  {
    question: 'Can I preview a KDP hardcover book?',
    answer:
      'Yes. Switch the book type to hardcover to preview a rigid-cover presentation with correct proportions for your trim and page count.',
  },
  {
    question: 'Can I export a transparent PNG mockup?',
    answer:
      'Yes. Use the export control in the 3D preview studio to save a transparent book snapshot at high resolution.',
  },
  {
    question: 'How do I load my cover into the 3D preview?',
    answer:
      'Import your cover PDF or image in the preview step. The 3D renderer maps the cover art onto the book model using your configured spine width and trim dimensions.',
  },
];

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        id="preview-schema"
        data={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'KDP 3D Book Preview', url: `${SITE_URL}/preview` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
