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
    guides: [],
    glossary: [
      { label: 'Full wrap cover definition', href: '/glossary/full-wrap-cover' },
      { label: 'Cover template definition', href: '/glossary/cover-template' },
    ],
  },
  bleed: {
    tools: [{ label: 'KDP bleed checker', href: '/tools/kdp-bleed-checker', description: 'Verify 0.125 inch bleed in exported PDFs.' }],
    guides: [],
    glossary: [{ label: 'Bleed definition', href: '/glossary/bleed' }],
  },
  spine: {
    tools: [{ label: 'KDP spine width calculator', href: '/tools/kdp-spine-width-calculator', description: 'Calculate spine width from page count and paper type.' }],
    guides: [],
    glossary: [{ label: 'Spine width definition', href: '/glossary/spine-width' }],
  },
  trim: {
    tools: [{ label: 'KDP trim size calculator', href: '/tools/kdp-trim-size-calculator', description: 'Calculate trim, bleed, and cover dimensions.' }],
    guides: [],
    glossary: [{ label: 'Trim size definition', href: '/glossary/trim-size' }],
  },
  'safe-area': {
    tools: [{ label: 'KDP cover checker', href: '/tools/kdp-cover-checker', description: 'Find risky text and cover zones before upload.' }],
    guides: [],
    glossary: [
      { label: 'Safe area definition', href: '/glossary/safe-area' },
      { label: 'Printable area definition', href: '/glossary/printable-area' },
    ],
  },
  export: {
    tools: [{ label: 'KDP cover validator', href: '/tools/kdp-cover-validator', description: 'Validate exported PDF structure and dimensions.' }],
    guides: [],
    glossary: [{ label: 'PDF export definition', href: '/glossary/pdf-export' }],
  },
  canva: {
    tools: [{ label: 'KDP cover checker', href: '/tools/kdp-cover-checker' }],
    guides: [],
    glossary: [{ label: 'Cover template definition', href: '/glossary/cover-template' }],
  },
  photoshop: {
    tools: [{ label: 'KDP cover validator', href: '/tools/kdp-cover-validator' }],
    guides: [],
    glossary: [{ label: 'Full wrap cover definition', href: '/glossary/full-wrap-cover' }],
  },
  hardcover: {
    tools: [{ label: 'KDP cover validator', href: '/tools/kdp-cover-validator' }],
    guides: [],
    glossary: [{ label: 'Hardcover cover definition', href: '/glossary/hardcover-cover' }],
  },
};

export function getInternalLinks(topic: InternalTopic): InternalLinkSet {
  return internalLinks[topic];
}
