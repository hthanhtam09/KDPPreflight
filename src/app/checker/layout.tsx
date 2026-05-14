import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { generatePageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Cover Checker & Manuscript Checker',
  description:
    'Scan your KDP cover and manuscript PDFs for bleed errors, trim mismatch, spine width problems, unsafe margins, and low-resolution images before uploading to Amazon KDP.',
  path: '/checker',
  keywords: [
    'KDP cover checker',
    'KDP manuscript checker',
    'KDP bleed checker',
    'KDP PDF checker',
    'Amazon KDP upload errors',
    'KDP trim mismatch',
    'KDP margin checker',
  ],
});

const faqs = [
  {
    question: 'What does the KDP manuscript checker inspect?',
    answer:
      'It checks page size, trim match, bleed, margins, page count, and print-risk issues so you can see which pages need attention before upload.',
  },
  {
    question: 'What does the KDP cover checker inspect?',
    answer:
      'It compares your cover PDF against the selected book specs — full cover size, trim, bleed, spine width, and practical KDP upload risk.',
  },
  {
    question: 'How do I fix a KDP bleed error?',
    answer:
      'Set your export to include 0.125" bleed on all sides, then re-export the PDF. For an 8.5×11 trim, the final PDF should be 8.75×11.25" with bleed.',
  },
  {
    question: 'Why does KDP reject a PDF that looks correct in Canva?',
    answer:
      'Canva may export at the front-cover canvas size instead of the full wrap size. The exported PDF dimensions — not the design — are what KDP validates.',
  },
];

export default function CheckerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        id="checker-schema"
        data={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'KDP Cover Checker', url: `${SITE_URL}/checker` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
