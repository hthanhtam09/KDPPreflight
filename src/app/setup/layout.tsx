import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { generatePageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Trim Size Calculator & Spine Width Calculator',
  description:
    'Calculate exact KDP trim size, bleed, spine width, margins, and safe area for your paperback or hardcover before designing. Free browser-based KDP book setup tool.',
  path: '/setup',
  keywords: [
    'KDP trim size calculator',
    'KDP spine width calculator',
    'KDP cover dimensions',
    'KDP bleed calculator',
    'Amazon KDP book setup',
    'KDP paperback dimensions',
    'KDP safe area',
  ],
  // App screen with almost no standalone text — kept out of the index so it is
  // not judged as thin content. Revert once the page carries real copy.
  noIndex: true,
});

const faqs = [
  {
    question: 'What KDP trim size should I design for?',
    answer:
      'Choose the trim size before designing. Smart Book Setup shows the manuscript size, bleed size, cover size, and safe area so your export matches Amazon KDP formatting requirements.',
  },
  {
    question: 'How is KDP spine width calculated?',
    answer:
      'Spine width depends on page count and paper type. White paper uses 0.002252" per page, cream paper 0.0025" per page. Enter your specs and the calculator applies the correct formula.',
  },
  {
    question: 'When do I need KDP bleed?',
    answer:
      'Use bleed when artwork, backgrounds, or coloring book pages reach the edge. No-bleed is safer for journals, text interiors, and books with white margins.',
  },
  {
    question: 'What is the KDP safe area?',
    answer:
      'The safe area is the region inside the trim line where important content (text, logos, barcodes) should stay to avoid being cut. KDP recommends keeping key content at least 0.25" from the trim edge.',
  },
];

export default function SetupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        id="setup-schema"
        data={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'KDP Book Setup', url: `${SITE_URL}/setup` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
