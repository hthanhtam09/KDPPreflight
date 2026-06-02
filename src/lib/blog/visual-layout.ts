import type { ArticleDiagramType } from '@/components/blog/ArticleDiagram';
import type { BlogPost } from '@/types/blog';

export type BlogVisualLayoutType = 'narrative' | 'magazine' | 'documentation' | 'case-study' | 'visual-storytelling';

export type BlogVisualWorld =
  | 'aircraft-preflight'
  | 'book-factory'
  | 'print-laboratory'
  | 'airport-security'
  | 'construction-site'
  | 'structural-engineering'
  | 'bookshelf-comparison'
  | 'logistics-center'
  | 'color-proofing-studio'
  | 'quality-control-desk';

export type BlogVisualLayout = {
  type: BlogVisualLayoutType;
  visualWorld: BlogVisualWorld;
  diagramsBySlot: {
    afterQuickAnswer: ArticleDiagramType[];
    afterIntro: ArticleDiagramType[];
    afterSection: Record<number, ArticleDiagramType[]>;
  };
};

type LayoutPattern = {
  type: BlogVisualLayoutType;
  quickAnswer: boolean;
  intro: boolean;
  sectionSlots: number[];
};

const layoutPatterns: LayoutPattern[] = [
  {
    type: 'narrative',
    quickAnswer: false,
    intro: false,
    sectionSlots: [2, 4, 5, 7, 9, 11],
  },
  {
    type: 'magazine',
    quickAnswer: false,
    intro: true,
    sectionSlots: [3, 5, 7, 9, 11],
  },
  {
    type: 'documentation',
    quickAnswer: true,
    intro: false,
    sectionSlots: [2, 4, 6, 8, 10, 12],
  },
  {
    type: 'case-study',
    quickAnswer: false,
    intro: true,
    sectionSlots: [2, 4, 6, 8, 10],
  },
  {
    type: 'visual-storytelling',
    quickAnswer: false,
    intro: true,
    sectionSlots: [1, 2, 3, 5, 7, 9],
  },
];

const visualWorldBySlug: Record<string, BlogVisualWorld> = {
  'kdp-pdf-requirements': 'aircraft-preflight',
  'kdp-cover-template': 'book-factory',
  'kdp-cover-calculator': 'structural-engineering',
  'kdp-print-previewer': 'print-laboratory',
  'kdp-file-upload-failed': 'logistics-center',
  'kdp-safe-area-explained': 'construction-site',
  'how-far-should-text-be-from-edge-kdp-cover': 'construction-site',
  'how-to-check-safe-area-before-exporting-kdp-cover': 'construction-site',
  'fix-text-outside-safe-area-kdp': 'construction-site',
  'kdp-spine-width-wrong': 'structural-engineering',
  'fix-kdp-spine-text-off-center': 'structural-engineering',
  'what-is-a-low-content-book-on-kdp': 'bookshelf-comparison',
  'kdp-cover-colors-look-different-after-printing': 'color-proofing-studio',
  'kdp-coloring-book-prints-too-dark': 'color-proofing-studio',
};

export function getArticleVisualLayout(post: BlogPost): BlogVisualLayout {
  const pattern = pickLayoutPattern(post);
  const h2Count = countH2Sections(post.content);
  const diagrams = post.diagrams;
  const diagramsBySlot: BlogVisualLayout['diagramsBySlot'] = {
    afterQuickAnswer: [],
    afterIntro: [],
    afterSection: {},
  };

  const anchors = buildAnchors(pattern, h2Count);

  diagrams.forEach((diagram, index) => {
    const anchor = anchors[index % anchors.length];

    if (anchor === 'afterQuickAnswer') {
      diagramsBySlot.afterQuickAnswer.push(diagram);
      return;
    }

    if (anchor === 'afterIntro') {
      diagramsBySlot.afterIntro.push(diagram);
      return;
    }

    const sectionIndex = Number(anchor.replace('afterSection:', ''));
    diagramsBySlot.afterSection[sectionIndex] = [...(diagramsBySlot.afterSection[sectionIndex] ?? []), diagram];
  });

  return {
    type: pattern.type,
    visualWorld: visualWorldBySlug[post.slug] ?? fallbackVisualWorld(post),
    diagramsBySlot,
  };
}

function pickLayoutPattern(post: BlogPost): LayoutPattern {
  const offset = layoutPreferenceOffset(post);
  return layoutPatterns[(stableHash(post.slug) + offset) % layoutPatterns.length];
}

function layoutPreferenceOffset(post: BlogPost): number {
  const text = `${post.title} ${post.category} ${post.tags.join(' ')}`.toLowerCase();

  if (/(failed|rejected|error|warning|fix|troubleshoot)/.test(text)) return 0;
  if (/(beginner|publishing|checklist|guide)/.test(text)) return 1;
  if (/(requirements|explained|calculator|reference)/.test(text)) return 2;
  if (/(mistake|before|after|cheap|cropped|blurry)/.test(text)) return 3;
  return 4;
}

function buildAnchors(pattern: LayoutPattern, h2Count: number): string[] {
  const anchors: string[] = [];
  if (pattern.quickAnswer) anchors.push('afterQuickAnswer');
  if (pattern.intro) anchors.push('afterIntro');

  const sectionSlots = pattern.sectionSlots
    .map((slot) => Math.min(slot, Math.max(1, h2Count)))
    .filter((slot, index, slots) => slot > 0 && slots.indexOf(slot) === index);

  anchors.push(...sectionSlots.map((slot) => `afterSection:${slot}`));

  if (!anchors.length) anchors.push('afterIntro');
  return anchors;
}

function countH2Sections(content: string): number {
  return [...content.matchAll(/^##\s+.+$/gm)].length;
}

function fallbackVisualWorld(post: BlogPost): BlogVisualWorld {
  const worlds: BlogVisualWorld[] = [
    'aircraft-preflight',
    'book-factory',
    'print-laboratory',
    'airport-security',
    'construction-site',
    'structural-engineering',
    'bookshelf-comparison',
    'logistics-center',
    'color-proofing-studio',
    'quality-control-desk',
  ];

  return worlds[stableHash(`${post.category}:${post.slug}`) % worlds.length];
}

function stableHash(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
