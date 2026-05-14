import LandingPage from '@/components/landing/LandingPage';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  softwareApplicationSchema,
  faqSchema,
  howToSchema,
  websiteSchema,
  organizationSchema,
  speakableSchema,
  SITE_URL,
} from '@/lib/schema';

const homeFaqs = [
  {
    question: 'Why does Amazon KDP reject PDFs that look correct?',
    answer:
      'KDP validates exact PDF dimensions, bleed, trim size, margins, image resolution, and cover wrap math. A PDF can look correct in Preview, Canva, Acrobat, or Affinity Publisher and still be 0.05" off from the KDP cover dimensions required for upload.',
  },
  {
    question: 'What is a KDP bleed issue?',
    answer:
      'A KDP bleed issue means artwork or background color reaches the trim edge but the PDF does not include the required extra bleed area. For most bleed layouts, add 0.125" beyond the trim so cutting does not leave white edges.',
  },
  {
    question: 'How do I fix a KDP trim mismatch?',
    answer:
      'Confirm the trim size selected in KDP, then export the manuscript and cover to the exact expected size. For example, an 8.5×11 manuscript without bleed should be 8.5"×11"; with bleed it should include the extra bleed dimensions.',
  },
  {
    question: 'Can KDPPreflight check manuscript bleed?',
    answer:
      'Yes. The KDP manuscript checker compares page boxes and dimensions to your selected trim and bleed mode so you can find paperback bleed issues before upload.',
  },
  {
    question: 'How is KDP spine width calculated?',
    answer:
      'Spine width depends on page count and paper type. White paper uses about 0.002252" per page, while cream paper uses about 0.0025" per page. The KDP spine width calculator applies those values to your book specs.',
  },
  {
    question: 'Why do low-resolution images cause KDP upload errors?',
    answer:
      'Images below roughly 300 DPI can print soft or trigger quality warnings. A useful KDP PDF checker should flag low-resolution artwork before you upload the cover or manuscript.',
  },
  {
    question: 'Can Canva exports create KDP cover size problems?',
    answer:
      'Yes. Canva designs can export at the wrong page size if the document was created from a front-cover canvas instead of a full paperback wrap. Check the final PDF width, height, bleed, and spine before uploading.',
  },
  {
    question: 'Does KDPPreflight store my unpublished files?',
    answer:
      'No. KDPPreflight is designed as a private creator workstation with local browser processing whenever possible. No manuscript storage, no cover storage, and no AI training on your book files.',
  },
];

const homeHowTo = howToSchema({
  name: 'How to check your KDP book files before uploading to Amazon',
  description:
    'Use KDPPreflight to calculate book specs, scan cover and manuscript PDFs, identify bleed or trim problems, and preview the corrected KDP book before uploading to Amazon.',
  steps: [
    {
      name: 'Calculate exact KDP specs',
      text: 'Enter trim size, page count, paper type, and cover format to calculate bleed, spine width, safe area, margins, and final cover dimensions.',
      url: `${SITE_URL}/setup`,
    },
    {
      name: 'Scan exported KDP files',
      text: 'Upload your cover PDF and manuscript PDF to detect missing bleed, trim mismatch, unsafe margins, low-resolution images, and spine width issues.',
      url: `${SITE_URL}/checker`,
    },
    {
      name: 'Fix issues and preview the book',
      text: 'Use actual vs. expected measurements to adjust the export, then preview the paperback or hardcover before uploading to KDP.',
      url: `${SITE_URL}/preview`,
    },
  ],
});

export default function Home() {
  return (
    <>
      <JsonLd
        id="homepage-schema"
        data={[
          websiteSchema(),
          organizationSchema(),
          softwareApplicationSchema(),
          faqSchema(homeFaqs),
          homeHowTo,
          speakableSchema(['h1', 'h2', '.ds-body', 'p']),
        ]}
      />
      <LandingPage />
    </>
  );
}
