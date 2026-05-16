import type { InternalTopic } from './internal-links';

export type GlossaryTerm = {
  slug: string;
  term: string;
  topic: InternalTopic;
  definition: string;
  whyItMatters: string;
  commonMistakes: string[];
  faqs: { question: string; answer: string }[];
};

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: 'bleed',
    term: 'Bleed',
    topic: 'bleed',
    definition: 'Bleed is the extra artwork area that extends beyond the final trim edge and is cut away during print production.',
    whyItMatters: 'KDP uses bleed to prevent white edges when a background, image, or illustration reaches the edge of a cover or page.',
    commonMistakes: ['Adding guides but exporting without bleed', 'Putting important text in the bleed area', 'Using trim-only dimensions for a full-bleed design'],
    faqs: [{ question: 'How much bleed does KDP require?', answer: 'KDP commonly requires 0.125 inch bleed on outside edges with edge-to-edge artwork.' }],
  },
  {
    slug: 'trim-size',
    term: 'Trim Size',
    topic: 'trim',
    definition: 'Trim size is the final width and height of a printed book after the pages are cut.',
    whyItMatters: 'Trim size controls manuscript dimensions, cover panel size, bleed size, and the full cover wrap calculation.',
    commonMistakes: ['Changing trim size after designing', 'Mixing manuscript and cover trim sizes', 'Confusing trim size with bleed size'],
    faqs: [{ question: 'Does trim size include bleed?', answer: 'No. Bleed is extra area outside the trim size.' }],
  },
  {
    slug: 'safe-area',
    term: 'Safe Area',
    topic: 'safe-area',
    definition: 'Safe area is the inside zone where important text and graphics should stay so trimming does not cut them off.',
    whyItMatters: 'KDP printing and trimming can shift slightly, so important cover elements need space away from trim and fold lines.',
    commonMistakes: ['Placing titles near the edge', 'Using borders close to trim', 'Putting spine text close to fold edges'],
    faqs: [{ question: 'Is safe area the same as bleed?', answer: 'No. Bleed is outside trim; safe area is inside trim.' }],
  },
  {
    slug: 'spine-width',
    term: 'Spine Width',
    topic: 'spine',
    definition: 'Spine width is the thickness of the printed book block, calculated from page count and paper type.',
    whyItMatters: 'The spine width is part of the total cover PDF width and affects spine text placement.',
    commonMistakes: ['Using a draft page count', 'Choosing the wrong paper type', 'Adding spine text to a very narrow spine'],
    faqs: [{ question: 'Does page count affect spine width?', answer: 'Yes. More pages make the spine wider.' }],
  },
  {
    slug: 'printable-area',
    term: 'Printable Area',
    topic: 'safe-area',
    definition: 'Printable area is the region KDP expects printable content to occupy without risking trim, binding, or production conflicts.',
    whyItMatters: 'Printable area warnings often mean important content is too close to trim or outside a safe production zone.',
    commonMistakes: ['Treating background art as text', 'Leaving logos near corners', 'Putting objects in the barcode zone'],
    faqs: [{ question: 'Can backgrounds extend outside printable area?', answer: 'Background art can extend into bleed, but important text should stay safe.' }],
  },
  {
    slug: 'full-wrap-cover',
    term: 'Full Wrap Cover',
    topic: 'cover',
    definition: 'A full wrap cover is one PDF containing the back cover, spine, front cover, and bleed.',
    whyItMatters: 'KDP print books require a full wrap cover, not a front-cover-only image.',
    commonMistakes: ['Uploading only the front cover', 'Forgetting the spine', 'Building the wrap without bleed'],
    faqs: [{ question: 'What is included in a full wrap?', answer: 'Back cover, spine, front cover, and outside bleed.' }],
  },
  {
    slug: 'barcode-area',
    term: 'Barcode Area',
    topic: 'cover',
    definition: 'Barcode area is the reserved back cover space where KDP can place an ISBN barcode.',
    whyItMatters: 'Text or artwork in the barcode area can trigger warnings or be covered by the printed barcode.',
    commonMistakes: ['Placing important back cover copy too low', 'Adding a logo where the barcode will go', 'Using a decorative frame through the barcode zone'],
    faqs: [{ question: 'Should I leave barcode space blank?', answer: 'Yes, unless you are placing your own approved barcode.' }],
  },
  {
    slug: 'pdf-export',
    term: 'PDF Export',
    topic: 'export',
    definition: 'PDF export is the process of saving the final cover or manuscript file in the format KDP reviews and prints.',
    whyItMatters: 'A correct design can fail if the exported PDF crops bleed, compresses images, or omits fonts.',
    commonMistakes: ['Using web-quality export', 'Not embedding fonts', 'Cropping bleed during export'],
    faqs: [{ question: 'Should I check the source file or PDF?', answer: 'Check the exported PDF because that is what KDP processes.' }],
  },
  {
    slug: 'cover-template',
    term: 'Cover Template',
    topic: 'cover',
    definition: 'A cover template is a guide showing trim, spine, bleed, safe area, and barcode placement for a specific KDP book setup.',
    whyItMatters: 'Templates help position content, but they must match the final page count, trim size, and paper type.',
    commonMistakes: ['Using an old template', 'Leaving guide lines visible', 'Using a paperback template for hardcover'],
    faqs: [{ question: 'Can a template become outdated?', answer: 'Yes. Page count and format changes can require a new template.' }],
  },
  {
    slug: 'hardcover-cover',
    term: 'Hardcover Cover',
    topic: 'hardcover',
    definition: 'A hardcover cover is a case cover layout with front board, back board, spine, hinge areas, wrap, bleed, and safe zones.',
    whyItMatters: 'Hardcover covers have additional production zones compared with paperback covers, especially hinge and wrap areas.',
    commonMistakes: ['Reusing paperback dimensions', 'Ignoring hinge zones', 'Putting text too close to the spine'],
    faqs: [{ question: 'Is hardcover setup the same as paperback?', answer: 'No. Hardcover cover layouts need format-specific dimensions and hinge planning.' }],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((term) => term.slug === slug);
}
