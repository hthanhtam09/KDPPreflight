import {
  AlertTriangle,
  BookOpenCheck,
  Box,
  FileCheck2,
  Layers3,
  Ruler,
  ScanLine,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export type BlogCategorySlug =
  | 'cover-rejections'
  | 'bleed-issues'
  | 'spine-width'
  | 'safe-area'
  | 'export-settings'
  | 'print-quality'
  | 'canva-photoshop'
  | 'trim-size'
  | 'beginner-guides'
  | 'hardcover';

export type BlogCategory = {
  slug: BlogCategorySlug;
  label: string;
  description: string;
  seoIntro: string;
  icon: LucideIcon;
};

export const blogCategories: BlogCategory[] = [
  {
    slug: 'cover-rejections',
    label: 'Cover Rejections',
    description: 'Fix Amazon KDP cover upload errors, rejected cover files, barcode conflicts, and printable area warnings.',
    seoIntro:
      'Troubleshooting guides for authors whose Amazon KDP cover was rejected because of bleed, safe area, wrong dimensions, spine text, barcode placement, or PDF export problems.',
    icon: AlertTriangle,
  },
  {
    slug: 'bleed-issues',
    label: 'Bleed Issues',
    description: 'Understand the 0.125 inch bleed requirement and fix missing bleed before upload.',
    seoIntro:
      'Beginner-friendly KDP bleed guides that explain what bleed is, when Amazon requires it, and how to repair missing bleed in print-ready cover PDFs.',
    icon: Layers3,
  },
  {
    slug: 'spine-width',
    label: 'Spine Width',
    description: 'Calculate spine width from page count and paper type, then keep spine text centered.',
    seoIntro:
      'Practical Amazon KDP spine width guidance for paperback authors, including page count changes, paper type differences, full wrap math, and spine text alignment.',
    icon: Ruler,
  },
  {
    slug: 'safe-area',
    label: 'Safe Area',
    description: 'Keep titles, logos, subtitles, and barcode-adjacent content away from trim risk zones.',
    seoIntro:
      'KDP safe area guides for avoiding cut-off text, edge collisions, and design elements that sit too close to the trim line on paperback covers.',
    icon: ShieldCheck,
  },
  {
    slug: 'export-settings',
    label: 'Export Settings',
    description: 'Create print-ready PDF covers with embedded fonts, strong image quality, and reliable output settings.',
    seoIntro:
      'PDF export settings for Amazon KDP covers, including resolution, compression, transparency, fonts, color expectations, and final preflight checks.',
    icon: FileCheck2,
  },
  {
    slug: 'print-quality',
    label: 'Print Quality',
    description: 'Troubleshoot proof copies, dull colors, blurry print, trim shifts, and amateur-looking KDP books.',
    seoIntro:
      'Print-quality troubleshooting guides for Amazon KDP proof copies, including dull color, blurry exports, uneven borders, trim movement, paper feel, cover finish, and professional proofing workflows.',
    icon: ScanLine,
  },
  {
    slug: 'canva-photoshop',
    label: 'Canva & Photoshop',
    description: 'Set up KDP cover files correctly in Canva and Photoshop before exporting.',
    seoIntro:
      'Step-by-step Canva and Photoshop workflows for Amazon KDP cover dimensions, bleed setup, guide placement, PDF export, and final validation.',
    icon: Settings2,
  },
  {
    slug: 'trim-size',
    label: 'Trim Size',
    description: 'Choose paperback trim size and understand how it changes cover dimensions.',
    seoIntro:
      'KDP trim size guides that explain paperback dimensions, bleed relationships, full cover wrap sizing, and common setup mistakes for new authors.',
    icon: ScanLine,
  },
  {
    slug: 'beginner-guides',
    label: 'Beginner Guides',
    description: 'Start with the basics: trim, bleed, spine, safe area, PDF export, and upload checks.',
    seoIntro:
      'Beginner Amazon KDP cover formatting guides written for first-time self-publishers who need a clear path from cover setup to upload.',
    icon: BookOpenCheck,
  },
  {
    slug: 'hardcover',
    label: 'Hardcover',
    description: 'Plan ahead for hardcover-specific cover wrap, hinge, case laminate, and dust jacket requirements.',
    seoIntro:
      'Hardcover KDP cover formatting resources for authors preparing case laminate and dust jacket files with the right wrap, hinge, spine, and bleed setup.',
    icon: Box,
  },
];

export const blogCategoryFilters = ['all', ...blogCategories.map((category) => category.slug)] as const;

export type BlogCategoryFilter = (typeof blogCategoryFilters)[number];

export function getBlogCategory(slug: BlogCategorySlug): BlogCategory {
  const category = blogCategories.find((item) => item.slug === slug);
  if (!category) throw new Error(`Unknown blog category: ${slug}`);
  return category;
}

export function getBlogCategoryByLabel(label: string): BlogCategory | undefined {
  return blogCategories.find((category) => category.label === label);
}
