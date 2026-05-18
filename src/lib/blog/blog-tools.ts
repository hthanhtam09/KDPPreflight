import type { BlogGuideLink, BlogToolLink } from '@/types/blog';

export const blogTools = {
  checker: {
    label: 'Free KDP Cover Checker',
    href: '/tools/kdp-cover-checker',
    description: 'Scan your exported cover PDF for bleed, trim size, spine width, safe area, and print-readiness before upload.',
  },
  bleedChecker: {
    label: 'KDP Bleed Checker',
    href: '/tools/kdp-bleed-checker',
    description: 'Check whether your final PDF includes the required 0.125 inch bleed and correct page box dimensions.',
  },
  trimCalculator: {
    label: 'KDP Trim Size Calculator',
    href: '/tools/kdp-trim-size-calculator',
    description: 'Calculate print-ready dimensions for common paperback trim sizes, with and without bleed.',
  },
  spineCalculator: {
    label: 'KDP Spine Width Calculator',
    href: '/tools/kdp-spine-width-calculator',
    description: 'Calculate paperback spine width from page count, trim size, and paper type.',
  },
  validator: {
    label: 'KDP Cover Validator',
    href: '/tools/kdp-cover-validator',
    description: 'Validate cover dimensions and export setup against common Amazon KDP upload failure patterns.',
  },
} satisfies Record<string, BlogToolLink>;

export type BlogToolKey = keyof typeof blogTools;

export const commonGuides: BlogGuideLink[] = [
  { label: 'KDP Cover Checker', href: '/tools/kdp-cover-checker' },
  { label: 'KDP Trim Size Calculator', href: '/tools/kdp-trim-size-calculator' },
  { label: 'KDP Spine Width Calculator', href: '/tools/kdp-spine-width-calculator' },
  { label: 'KDP Bleed Checker', href: '/tools/kdp-bleed-checker' },
  { label: 'KDP safe area glossary', href: '/glossary/safe-area' },
];
