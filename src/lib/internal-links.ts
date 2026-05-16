export type InternalLink = {
  label: string;
  href: string;
  description?: string;
};

export type InternalTopic =
  | 'cover'
  | 'bleed'
  | 'spine'
  | 'trim'
  | 'safe-area'
  | 'export'
  | 'canva'
  | 'photoshop'
  | 'hardcover';

export type InternalLinkSet = {
  tools: InternalLink[];
  guides: InternalLink[];
  glossary: InternalLink[];
};

export const internalLinks: Record<InternalTopic, InternalLinkSet> = {
  cover: {
    tools: [
      { label: 'KDP cover checker', href: '/tools/kdp-cover-checker', description: 'Check cover PDF dimensions, bleed, spine, and safe area.' },
      { label: 'KDP cover validator', href: '/tools/kdp-cover-validator', description: 'Validate the full wrap before upload.' },
    ],
    guides: [
      { label: 'Why Amazon rejected your KDP cover', href: '/blog/why-amazon-rejected-your-kdp-cover' },
      { label: 'Beginner guide to KDP cover formatting', href: '/blog/beginners-guide-kdp-cover-formatting' },
      { label: 'KDP cover dimensions explained', href: '/blog/kdp-cover-dimensions-explained' },
    ],
    glossary: [
      { label: 'Full wrap cover definition', href: '/glossary/full-wrap-cover' },
      { label: 'Cover template definition', href: '/glossary/cover-template' },
    ],
  },
  bleed: {
    tools: [{ label: 'KDP bleed checker', href: '/tools/kdp-bleed-checker', description: 'Verify 0.125 inch bleed in exported PDFs.' }],
    guides: [
      { label: 'KDP bleed explained', href: '/blog/kdp-bleed-explained' },
      { label: 'How to fix KDP bleed issues', href: '/blog/fix-kdp-bleed-issues' },
    ],
    glossary: [{ label: 'Bleed definition', href: '/glossary/bleed' }],
  },
  spine: {
    tools: [{ label: 'KDP spine width calculator', href: '/tools/kdp-spine-width-calculator', description: 'Calculate spine width from page count and paper type.' }],
    guides: [
      { label: 'Calculate KDP spine width correctly', href: '/blog/calculate-kdp-spine-width' },
      { label: 'Why KDP spine text is misaligned', href: '/blog/kdp-spine-text-misaligned' },
    ],
    glossary: [{ label: 'Spine width definition', href: '/glossary/spine-width' }],
  },
  trim: {
    tools: [{ label: 'KDP trim size calculator', href: '/tools/kdp-trim-size-calculator', description: 'Calculate trim, bleed, and cover dimensions.' }],
    guides: [
      { label: 'KDP trim size guide', href: '/blog/kdp-trim-size-guide' },
      { label: 'KDP cover dimensions explained', href: '/blog/kdp-cover-dimensions-explained' },
    ],
    glossary: [{ label: 'Trim size definition', href: '/glossary/trim-size' }],
  },
  'safe-area': {
    tools: [{ label: 'KDP cover checker', href: '/tools/kdp-cover-checker', description: 'Find risky text and cover zones before upload.' }],
    guides: [
      { label: 'KDP safe area guide', href: '/blog/kdp-safe-area-guide' },
      { label: 'Fix printable area errors', href: '/blog/fix-elements-outside-printable-area-kdp' },
    ],
    glossary: [
      { label: 'Safe area definition', href: '/glossary/safe-area' },
      { label: 'Printable area definition', href: '/glossary/printable-area' },
    ],
  },
  export: {
    tools: [{ label: 'KDP cover validator', href: '/tools/kdp-cover-validator', description: 'Validate exported PDF structure and dimensions.' }],
    guides: [
      { label: 'Best PDF export settings for KDP', href: '/blog/best-pdf-export-settings-kdp' },
      { label: 'Export KDP covers from Canva', href: '/blog/export-kdp-cover-from-canva' },
    ],
    glossary: [{ label: 'PDF export definition', href: '/glossary/pdf-export' }],
  },
  canva: {
    tools: [{ label: 'KDP cover checker', href: '/tools/kdp-cover-checker' }],
    guides: [{ label: 'Export print-ready KDP covers from Canva', href: '/blog/export-kdp-cover-from-canva' }],
    glossary: [{ label: 'Cover template definition', href: '/glossary/cover-template' }],
  },
  photoshop: {
    tools: [{ label: 'KDP cover validator', href: '/tools/kdp-cover-validator' }],
    guides: [{ label: 'Set up a KDP cover in Photoshop', href: '/blog/setup-kdp-cover-photoshop' }],
    glossary: [{ label: 'Full wrap cover definition', href: '/glossary/full-wrap-cover' }],
  },
  hardcover: {
    tools: [{ label: 'KDP cover validator', href: '/tools/kdp-cover-validator' }],
    guides: [{ label: 'KDP hardcover cover requirements', href: '/blog/kdp-hardcover-cover-requirements' }],
    glossary: [{ label: 'Hardcover cover definition', href: '/glossary/hardcover-cover' }],
  },
};

export function getInternalLinks(topic: InternalTopic): InternalLinkSet {
  return internalLinks[topic];
}
