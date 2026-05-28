import type { KRFixability, KRIssue, KRIssueType } from './types'

export type KRFixOperationType =
  | 'optimize-pdf'
  | 'grayscale-pdf'
  | 'add-blank-page'
  | 'add-bleed'
  | 'normalize-page-size'
  | 'cleanup-crop-marks'
  | 'print-color-adjust'

export interface KRFixCapability {
  label: string
  description: string
  method: string
  riskLevel: 'low' | 'medium'
  estimatedImprovement: string
  operationType: KRFixOperationType
}

export const FIX_CAPABILITIES: Partial<Record<KRIssueType, KRFixCapability>> = {
  'bleed-missing': {
    label: 'Extend Background To Bleed',
    description: 'Adds a print bleed area and extends the page edge so KDP has trim allowance.',
    method: 'Creates a corrected copy with 0.125" bleed on each side. The visual editor lets you preview the trim and bleed before export.',
    riskLevel: 'medium',
    estimatedImprovement: 'Bleed-safe page box',
    operationType: 'add-bleed',
  },
  'size-mismatch': {
    label: 'Resize To Correct Trim',
    description: 'Rebuilds pages to the confirmed KDP trim size and keeps content centered safely.',
    method: 'Exports a corrected copy with consistent page boxes based on the confirmed KDP trim settings.',
    riskLevel: 'medium',
    estimatedImprovement: 'KDP-matched dimensions',
    operationType: 'normalize-page-size',
  },
  'inconsistent-pages': {
    label: 'Resize To Correct Trim',
    description: 'Makes all manuscript pages use one consistent size.',
    method: 'Re-renders pages into a consistent MediaBox so odd-sized pages do not shift during KDP processing.',
    riskLevel: 'medium',
    estimatedImprovement: 'Consistent page dimensions',
    operationType: 'normalize-page-size',
  },
  'pdf-too-large': {
    label: 'Optimize PDF size',
    description: 'Re-compress all images to reduce file size while keeping content readable for print.',
    method: 'Re-renders each page at 150 DPI with JPEG compression. All text and layout is preserved. Original file is untouched.',
    riskLevel: 'low',
    estimatedImprovement: '60–80% smaller file',
    operationType: 'optimize-pdf',
  },
  'oversized-file-risk': {
    label: 'Optimize PDF size',
    description: 'Compress images to speed up uploads and reduce KDP processing time.',
    method: 'Re-renders each page at 200 DPI with JPEG compression. Content is fully preserved. Original file is untouched.',
    riskLevel: 'low',
    estimatedImprovement: '40–60% smaller file',
    operationType: 'optimize-pdf',
  },
  'color-in-bw-book': {
    label: 'Convert to Black & White',
    description: 'Convert detected color content to grayscale for a Black & White interior setup.',
    method: 'Exports a grayscale copy using the ITU-R BT.601 luma formula while keeping page order and page dimensions. Review converted pages because grayscale conversion can change contrast.',
    riskLevel: 'low',
    estimatedImprovement: 'Black & White interior match',
    operationType: 'grayscale-pdf',
  },
  'cover-low-quality': {
    label: 'Replace With Sharpened Version',
    description: 'Re-renders the cover at high resolution and re-encodes at print-quality JPEG compression.',
    method: 'Exports a fresh JPEG-encoded PDF of the cover at 300 DPI. Does not upscale low-resolution source images — those must be replaced in your design app.',
    riskLevel: 'low',
    estimatedImprovement: 'Clean print-ready cover',
    operationType: 'optimize-pdf',
  },
  'cover-bleed-missing': {
    label: 'Extend Background To Bleed',
    description: 'Extends all four edges of the cover by 0.125" using mirrored or solid-fill extension.',
    method: 'Wraps the cover in a new canvas with 0.125" bleed. Review the result carefully — background art may need manual adjustment in your design app for a clean bleed.',
    riskLevel: 'medium',
    estimatedImprovement: 'Bleed-safe cover edges',
    operationType: 'add-bleed',
  },
}

// ── Fixability classification ─────────────────────────────────────────────────
// auto-fix    → can be applied in-app with one click
// manual-review → must be fixed in source software but has clear guidance
// info-only   → purely advisory, no corrective action possible

export function getFixability(issueType: KRIssueType): KRFixability {
  if (FIX_CAPABILITIES[issueType]) return 'auto-fix'
  switch (issueType) {
    case 'bw-in-color-book':
    case 'blurry-page-risk':
    case 'blank-pages':
    case 'cover-size-mismatch':
      return 'manual-review'
    default:
      return 'info-only'
  }
}

export function issueFixability(issue: Pick<KRIssue, 'issueType' | 'fixability'>): KRFixability {
  return issue.fixability ?? getFixability(issue.issueType)
}
