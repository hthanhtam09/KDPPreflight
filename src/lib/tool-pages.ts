import type { InternalTopic } from './internal-links';

export type ToolPageSlug =
  | 'kdp-cover-checker'
  | 'kdp-bleed-checker'
  | 'kdp-spine-width-calculator'
  | 'kdp-trim-size-calculator'
  | 'kdp-cover-validator';

export type ToolPage = {
  slug: ToolPageSlug;
  topic: InternalTopic;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  eyebrow: string;
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  checks: string[];
  steps: { name: string; text: string }[];
  faqs: { question: string; answer: string }[];
};

export const toolPages: ToolPage[] = [
  {
    slug: 'kdp-cover-checker',
    topic: 'cover',
    title: 'KDP Cover Checker | Check Your Amazon KDP Cover Before Upload',
    description: 'Use the free KDP cover checker to scan cover PDF dimensions, bleed, spine width, safe area, barcode space, and export issues before Amazon rejects your upload.',
    keywords: ['KDP cover checker', 'Amazon KDP cover checker', 'KDP cover PDF checker', 'check KDP cover before upload'],
    eyebrow: 'KDP Cover Checker',
    h1: 'Check your KDP cover before Amazon rejects your upload.',
    intro: 'Upload your exported cover PDF to check the production details that cause Amazon KDP warnings: full wrap size, bleed, trim, spine width, safe area, and PDF readiness.',
    primaryCta: { label: 'Open KDP Cover Checker', href: '/checker' },
    secondaryCta: { label: 'Calculate Book Specs', href: '/setup' },
    checks: ['Full wrap PDF size', '0.125 inch bleed', 'Trim size match', 'Spine width from page count', 'Safe area risk zones', 'Barcode area conflicts', 'PDF export dimensions'],
    steps: [
      { name: 'Export your final cover PDF', text: 'Use the same file you plan to upload to Amazon KDP, not a screenshot or source design preview.' },
      { name: 'Open the cover checker', text: 'Choose your trim size, paper type, and page count so the checker knows the expected cover dimensions.' },
      { name: 'Review each warning', text: 'Fix dimension, bleed, spine, safe area, or barcode warnings in your design tool.' },
      { name: 'Export and scan again', text: 'Validate the corrected PDF before returning to the KDP upload flow.' },
    ],
    faqs: [
      { question: 'What does the KDP cover checker check?', answer: 'It checks the exported cover PDF against common KDP production requirements: cover dimensions, bleed, trim, spine width, safe area, barcode space, and export readiness.' },
      { question: 'Is this different from the KDP cover validator?', answer: 'The checker is the broad tool for authors who want a complete scan. The validator page focuses specifically on full wrap cover validation as a search intent.' },
      { question: 'Do files upload to a server?', answer: 'No. KDP Preflight is designed so file processing runs locally in the browser.' },
    ],
  },
  {
    slug: 'kdp-bleed-checker',
    topic: 'bleed',
    title: 'KDP Bleed Checker | Fix Missing Bleed Before Upload',
    description: 'Check whether your KDP cover PDF includes the required 0.125 inch bleed and fix missing bleed before uploading to Amazon KDP.',
    keywords: ['KDP bleed checker', 'Amazon KDP bleed checker', 'KDP missing bleed', '0.125 bleed KDP'],
    eyebrow: 'KDP Bleed Checker',
    h1: 'Check KDP bleed before Amazon flags your PDF.',
    intro: 'Missing bleed is one of the easiest KDP upload problems to prevent. Check whether your exported PDF includes the correct 0.125 inch bleed area before upload.',
    primaryCta: { label: 'Check Bleed in My PDF', href: '/checker' },
    secondaryCta: { label: 'Browse Guides', href: '/blog' },
    checks: ['Bleed-inclusive PDF size', 'Trim vs bleed mismatch', 'Full-bleed artwork risk', 'Canva and Photoshop export mistakes'],
    steps: [
      { name: 'Choose trim size', text: 'Select the trim size used in your KDP book setup.' },
      { name: 'Upload the PDF', text: 'Use the final exported PDF so the checker can read actual page dimensions.' },
      { name: 'Compare expected vs actual bleed', text: 'If the PDF is trim-only, return to the design tool and export with bleed included.' },
      { name: 'Recheck before upload', text: 'Upload the corrected PDF to confirm the dimensions now include bleed.' },
    ],
    faqs: [
      { question: 'How much bleed does KDP require?', answer: 'KDP commonly requires 0.125 inch bleed on outside edges where artwork reaches the trim.' },
      { question: 'Can bleed guides pass if the PDF is wrong?', answer: 'Yes. Guides inside Canva or Photoshop do not matter unless the exported PDF includes the bleed area.' },
      { question: 'Does every page need bleed?', answer: 'No. Bleed is needed when artwork, images, or backgrounds reach the edge.' },
    ],
  },
  {
    slug: 'kdp-spine-width-calculator',
    topic: 'spine',
    title: 'KDP Spine Width Calculator | Calculate Paperback Spine Width',
    description: 'Calculate KDP spine width from page count, paper type, and trim size before exporting your paperback cover PDF.',
    keywords: ['KDP spine width calculator', 'Amazon KDP spine calculator', 'paperback spine width', 'calculate KDP spine'],
    eyebrow: 'KDP Spine Width Calculator',
    h1: 'Calculate KDP spine width from page count and paper type.',
    intro: 'Your KDP cover width changes whenever the spine changes. Calculate the spine before exporting the full wrap cover so front, back, and spine panels align.',
    primaryCta: { label: 'Calculate Spine Width', href: '/setup' },
    secondaryCta: { label: 'Check Cover PDF', href: '/checker' },
    checks: ['Page count impact', 'Paper type impact', 'Full wrap width', 'Spine text safety', 'Cover PDF width mismatch'],
    steps: [
      { name: 'Finalize page count', text: 'Use the final formatted manuscript page count, not a draft estimate.' },
      { name: 'Choose paper type', text: 'Match white, cream, or color paper to the KDP setup.' },
      { name: 'Calculate spine', text: 'Use the calculator to get spine width and full cover dimensions.' },
      { name: 'Validate the cover', text: 'Scan the exported PDF to confirm the implied spine matches the expected spine.' },
    ],
    faqs: [
      { question: 'Why does page count change spine width?', answer: 'More pages create a thicker book block, so the spine panel must become wider.' },
      { question: 'Does paper type matter?', answer: 'Yes. Cream, white, and color paper can produce different spine widths at the same page count.' },
      { question: 'When should I remove spine text?', answer: 'Remove spine text when the spine is too narrow to keep text readable and safely inside the spine area.' },
    ],
  },
  {
    slug: 'kdp-trim-size-calculator',
    topic: 'trim',
    title: 'KDP Trim Size Calculator | Calculate Paperback Dimensions',
    description: 'Calculate KDP trim size, bleed size, and full cover dimensions for paperback and hardcover files before upload.',
    keywords: ['KDP trim size calculator', 'Amazon KDP trim size', 'KDP paperback dimensions', 'KDP book dimensions'],
    eyebrow: 'KDP Trim Size Calculator',
    h1: 'Calculate KDP trim, bleed, and cover dimensions.',
    intro: 'Choose the right trim size and calculate the dimensions your manuscript and cover PDF need before you design or export.',
    primaryCta: { label: 'Calculate Trim Dimensions', href: '/setup' },
    secondaryCta: { label: 'Browse Guides', href: '/blog' },
    checks: ['Common paperback trim sizes', 'Bleed-inclusive page size', 'Cover wrap dimensions', 'Trim mismatch risk', 'Setup consistency'],
    steps: [
      { name: 'Select trim size', text: 'Pick the book size that matches genre, page count, and reader expectations.' },
      { name: 'Choose bleed mode', text: 'Use bleed dimensions when artwork reaches page edges.' },
      { name: 'Add page count', text: 'Page count determines spine width and total cover wrap width.' },
      { name: 'Build to exact dimensions', text: 'Use the calculator output in Canva, Photoshop, or your layout tool.' },
    ],
    faqs: [
      { question: 'What trim size is common for KDP?', answer: '6 x 9 inches is common for nonfiction; 5.5 x 8.5 is common for fiction; 8.5 x 11 is common for workbooks.' },
      { question: 'Does trim size include bleed?', answer: 'No. Trim size is the final cut size. Bleed is extra area outside trim.' },
      { question: 'Can I change trim size later?', answer: 'Yes, but you must rebuild manuscript layout and cover dimensions.' },
    ],
  },
  {
    slug: 'kdp-cover-validator',
    topic: 'cover',
    title: 'KDP Cover Validator | Validate Your Full Cover Wrap',
    description: 'Validate KDP cover PDF dimensions, spine width, bleed, barcode area, and safe area before uploading your full wrap cover to Amazon KDP.',
    keywords: ['KDP cover validator', 'Amazon KDP cover validator', 'KDP full wrap validator', 'KDP cover upload errors'],
    eyebrow: 'KDP Cover Validator',
    h1: 'Validate your KDP full cover wrap before upload.',
    intro: 'A valid KDP print cover must be one full wrap PDF with the correct back cover, spine, front cover, and bleed dimensions. Validate the final PDF before Amazon reviews it.',
    primaryCta: { label: 'Validate My Cover', href: '/checker' },
    secondaryCta: { label: 'Browse Guides', href: '/blog' },
    checks: ['Back + spine + front cover wrap', 'Total cover width', 'Total cover height', 'Bleed on outside edges', 'Barcode zone', 'Safe area content'],
    steps: [
      { name: 'Calculate cover dimensions', text: 'Use trim size, page count, paper type, spine width, and bleed.' },
      { name: 'Export a full wrap PDF', text: 'Do not upload a front-cover-only file for print books.' },
      { name: 'Validate the PDF', text: 'Scan the exact exported file and review every issue.' },
      { name: 'Fix and re-export', text: 'Repair the source design and validate the new PDF before upload.' },
    ],
    faqs: [
      { question: 'What makes a KDP cover invalid?', answer: 'Wrong total width or height, missing bleed, incorrect spine width, front-cover-only upload, barcode conflicts, or unsafe text placement.' },
      { question: 'Is a validator the same as a calculator?', answer: 'No. A calculator predicts dimensions. A validator reads the actual exported PDF and checks what is really in the file.' },
      { question: 'Can I validate Canva and Photoshop exports?', answer: 'Yes. Export the PDF first, then validate that final file.' },
    ],
  },
];

export function getToolPage(slug: string): ToolPage | undefined {
  return toolPages.find((page) => page.slug === slug);
}
