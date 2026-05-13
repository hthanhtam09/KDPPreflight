import LandingPage from '@/components/landing/LandingPage';
import Script from 'next/script';

const faqSchemaItems = [
  {
    name: 'Why does Amazon KDP reject PDFs that look correct?',
    text: 'KDP validates exact PDF dimensions, bleed, trim size, margins, image resolution, and cover wrap math. A PDF can look correct in Preview, Canva, Acrobat, or Affinity Publisher and still be 0.05 inches off from the KDP cover dimensions required for upload.',
  },
  {
    name: 'What is a KDP bleed issue?',
    text: 'A KDP bleed issue means artwork or background color reaches the trim edge but the PDF does not include the required extra bleed area. For most bleed layouts, add 0.125 inches beyond the trim so cutting does not leave white edges.',
  },
  {
    name: 'How do I fix a KDP trim mismatch?',
    text: 'Confirm the trim size selected in KDP, then export the manuscript and cover to the exact expected size. For example, an 8.5 x 11 manuscript without bleed should be 8.5 inches by 11 inches; with bleed it should include the extra bleed dimensions.',
  },
  {
    name: 'Can KDPPreflight check manuscript bleed?',
    text: 'Yes. The KDP manuscript checker compares page boxes and dimensions to your selected trim and bleed mode so you can find paperback bleed issues before upload.',
  },
  {
    name: 'How is KDP spine width calculated?',
    text: 'Spine width depends on page count and paper type. White paper uses about 0.002252 inches per page, while cream paper uses about 0.0025 inches per page. The KDP spine width calculator applies those values to your book specs.',
  },
  {
    name: 'Why do low-resolution images cause KDP upload errors?',
    text: 'Images below roughly 300 DPI can print soft or trigger quality warnings. A useful KDP PDF checker should flag low resolution artwork before you upload the cover or manuscript.',
  },
  {
    name: 'Can Canva exports create KDP cover size problems?',
    text: 'Yes. Canva designs can export at the wrong page size if the document was created from a front-cover canvas instead of a full paperback wrap. Check the final PDF width, height, bleed, and spine before uploading.',
  },
  {
    name: 'Can Affinity Publisher exports fail KDP checks?',
    text: 'Yes. Affinity Publisher files can fail if bleed is set in the document but not included during PDF export, or if the PDF preset changes page boxes. Recheck actual vs expected dimensions after export.',
  },
  {
    name: 'Can Adobe Illustrator cover PDFs fail KDP checks?',
    text: 'Yes. Illustrator exports can use the artboard size instead of the full bleed box, flatten artwork unexpectedly, or omit the 0.125 inch bleed. Validate the exported PDF, not only the design file.',
  },
  {
    name: 'Does KDPPreflight store my unpublished files?',
    text: 'No. KDPPreflight is designed as a private creator workstation with local browser processing whenever possible. No manuscript storage, no cover storage, and no AI training on your book files.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'KDPPreflight',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web browser',
      description:
        'Amazon KDP preflight workflow platform with a KDP cover checker, KDP manuscript checker, KDP bleed checker, trim size calculator, spine width calculator, and 3D book preview.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'KDP cover checker',
        'KDP manuscript checker',
        'KDP bleed checker',
        'KDP trim size calculator',
        'KDP spine width calculator',
        'KDP PDF checker',
        'Amazon KDP upload error detection',
        'KDP 3D book preview',
      ],
      browserRequirements: 'Modern browser with JavaScript enabled',
      softwareHelp: 'https://kdppreflight.app/#guide-heading',
      url: 'https://kdppreflight.app',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqSchemaItems.map((item) => ({
        '@type': 'Question',
        name: item.name,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.text,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to check your KDP book files before uploading to Amazon',
      description:
        'Use KDPPreflight to calculate book specs, scan cover and manuscript PDFs, identify bleed or trim problems, and preview the corrected KDP book before uploading to Amazon.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Calculate exact KDP specs',
          text: 'Enter trim size, page count, paper type, and cover format to calculate bleed, spine width, safe area, margins, and final cover dimensions.',
          url: 'https://kdppreflight.app/setup',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Scan exported KDP files',
          text: 'Upload your cover PDF and manuscript PDF to detect missing bleed, trim mismatch, unsafe margins, low-resolution images, and spine width issues.',
          url: 'https://kdppreflight.app/checker',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Fix issues and preview the book',
          text: 'Use actual vs expected measurements to adjust the export, then preview the paperback or hardcover before uploading to KDP.',
          url: 'https://kdppreflight.app/preview',
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <Script
        id="homepage-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
