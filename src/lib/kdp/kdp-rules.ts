/**
 * KDP Rules — Single Source of Truth
 *
 * All official Amazon KDP print rules, constants, and validation logic.
 * Used by:
 *   - Setup screen (src/components/setup/SetupFeature.tsx)
 *   - Engine (src/engine/kdp-constants.ts, src/engine/validator.ts)
 *   - Preflight helpers (src/components/preflight/page-size-validation.ts)
 *
 * Worker note: public/workers/kdp-analysis-worker.js is self-contained (no imports).
 * Its rule tables mirror this file. When updating rules here, sync the worker too.
 * Worker sync marker: RULE_VERSION must match KDP_RULE_VERSION below.
 *
 * Official KDP sources:
 *   Trim, bleed, margins:        https://kdp.amazon.com/help/topic/GVBQ3CMEQW3W2VL6
 *   Fix formatting issues:       https://kdp.amazon.com/help/topic/G201834260
 *   Print options:               https://kdp.amazon.com/help/topic/G201834180
 *   Paperback submission:        https://kdp.amazon.com/help/topic/G201857950
 *   Save manuscript:             https://kdp.amazon.com/en_US/help/topic/G202145060
 *   Create paperback cover:      https://kdp.amazon.com/en_US/help/topic/G201953020
 *   Barcodes:                    https://kdp.amazon.com/help/topic/G5HDYGP4BXLX4RUW
 *   Color ink options:           https://kdp.amazon.com/help/topic/GX56BFPW4BKNPGFW
 *   Hardcover:                   https://kdp.amazon.com/help/topic/GAVW3FZZAKA2KY3B
 */

// ---------------------------------------------------------------------------
// Version & Sources
// ---------------------------------------------------------------------------

/**
 * Rule version string. Must be bumped whenever official KDP rules change.
 * Worker sync: must match RULE_VERSION in kdp-analysis-worker.js
 */
export const KDP_RULE_VERSION = 'kdp-print-rules-2026-05-27';

/** Official KDP documentation URLs for all rule categories. */
export const KDP_OFFICIAL_SOURCES = {
  trimBleedMargins:       'https://kdp.amazon.com/help/topic/GVBQ3CMEQW3W2VL6',
  formattingIssues:       'https://kdp.amazon.com/help/topic/G201834260',
  printOptions:           'https://kdp.amazon.com/help/topic/G201834180',
  paperbackGuidelines:    'https://kdp.amazon.com/help/topic/G201857950',
  saveManuscript:         'https://kdp.amazon.com/en_US/help/topic/G202145060',
  paperbackCover:         'https://kdp.amazon.com/en_US/help/topic/G201953020',
  barcodes:               'https://kdp.amazon.com/help/topic/G5HDYGP4BXLX4RUW',
  colorInkOptions:        'https://kdp.amazon.com/help/topic/GX56BFPW4BKNPGFW',
  hardcover:              'https://kdp.amazon.com/help/topic/GAVW3FZZAKA2KY3B',
  hardcoverCover:         'https://kdp.amazon.com/help/topic/GDTKFJPNQCBTMRV6',
  expandedDistribution:   'https://kdp.amazon.com/en_US/help/topic/GQTT4W3T5AYK7L45',
  images:                 'https://kdp.amazon.com/en_US/help/topic/G202169030',
} as const;

// ---------------------------------------------------------------------------
// Supported Values
// ---------------------------------------------------------------------------

export const KDP_SUPPORTED_BOOK_TYPES = ['paperback', 'hardcover'] as const;
export type KdpBookType = typeof KDP_SUPPORTED_BOOK_TYPES[number];

export const KDP_SUPPORTED_INTERIORS = ['black-white', 'standard-color', 'premium-color'] as const;
export type KdpInteriorType = typeof KDP_SUPPORTED_INTERIORS[number];

// Official KDP paper types for print:
// Source: https://kdp.amazon.com/help/topic/G201834180
export const KDP_SUPPORTED_PAPER_TYPES = ['white', 'cream'] as const;
export type KdpPaperType = typeof KDP_SUPPORTED_PAPER_TYPES[number];

export const KDP_SUPPORTED_BLEED_TYPES = ['bleed', 'no-bleed'] as const;
export type KdpBleedType = typeof KDP_SUPPORTED_BLEED_TYPES[number];

// ---------------------------------------------------------------------------
// Trim Sizes
// ---------------------------------------------------------------------------

export interface KdpTrimSize {
  key: string;
  label: string;
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  supportsPaperback: boolean;
  supportsHardcover: boolean;
}

/**
 * Official KDP supported trim sizes.
 * Source: https://kdp.amazon.com/help/topic/G201834180
 * Source: https://kdp.amazon.com/help/topic/GAVW3FZZAKA2KY3B (hardcover)
 */
export const KDP_TRIM_SIZES: Record<string, KdpTrimSize> = {
  '5x8':       { key: '5x8',       label: '5" × 8"',        widthIn: 5,     heightIn: 8,     widthCm: 12.70, heightCm: 20.32, supportsPaperback: true,  supportsHardcover: false },
  '5.06x7.81': { key: '5.06x7.81', label: '5.06" × 7.81"',  widthIn: 5.06,  heightIn: 7.81,  widthCm: 12.85, heightCm: 19.84, supportsPaperback: true,  supportsHardcover: false },
  '5.25x8':    { key: '5.25x8',    label: '5.25" × 8"',     widthIn: 5.25,  heightIn: 8,     widthCm: 13.34, heightCm: 20.32, supportsPaperback: true,  supportsHardcover: false },
  '5.5x8.5':   { key: '5.5x8.5',   label: '5.5" × 8.5"',   widthIn: 5.5,   heightIn: 8.5,   widthCm: 13.97, heightCm: 21.59, supportsPaperback: true,  supportsHardcover: true  },
  '6x9':       { key: '6x9',       label: '6" × 9"',        widthIn: 6,     heightIn: 9,     widthCm: 15.24, heightCm: 22.86, supportsPaperback: true,  supportsHardcover: true  },
  '6.14x9.21': { key: '6.14x9.21', label: '6.14" × 9.21"',  widthIn: 6.14,  heightIn: 9.21,  widthCm: 15.60, heightCm: 23.39, supportsPaperback: true,  supportsHardcover: true  },
  '6.69x9.61': { key: '6.69x9.61', label: '6.69" × 9.61"',  widthIn: 6.69,  heightIn: 9.61,  widthCm: 16.99, heightCm: 24.41, supportsPaperback: true,  supportsHardcover: false },
  '7x10':      { key: '7x10',      label: '7" × 10"',       widthIn: 7,     heightIn: 10,    widthCm: 17.78, heightCm: 25.40, supportsPaperback: true,  supportsHardcover: true  },
  '7.44x9.69': { key: '7.44x9.69', label: '7.44" × 9.69"',  widthIn: 7.44,  heightIn: 9.69,  widthCm: 18.90, heightCm: 24.61, supportsPaperback: true,  supportsHardcover: false },
  '7.5x9.25':  { key: '7.5x9.25',  label: '7.5" × 9.25"',   widthIn: 7.5,   heightIn: 9.25,  widthCm: 19.05, heightCm: 23.50, supportsPaperback: true,  supportsHardcover: false },
  '8x10':      { key: '8x10',      label: '8" × 10"',       widthIn: 8,     heightIn: 10,    widthCm: 20.32, heightCm: 25.40, supportsPaperback: true,  supportsHardcover: false },
  '8.25x6':    { key: '8.25x6',    label: '8.25" × 6"',     widthIn: 8.25,  heightIn: 6,     widthCm: 20.96, heightCm: 15.24, supportsPaperback: true,  supportsHardcover: false },
  '8.25x8.25': { key: '8.25x8.25', label: '8.25" × 8.25"',  widthIn: 8.25,  heightIn: 8.25,  widthCm: 20.96, heightCm: 20.96, supportsPaperback: true,  supportsHardcover: false },
  '8.25x11':   { key: '8.25x11',   label: '8.25" × 11"',    widthIn: 8.25,  heightIn: 11,    widthCm: 20.96, heightCm: 27.94, supportsPaperback: false, supportsHardcover: true  },
  '8.27x11.69':{ key: '8.27x11.69',label: '8.27" × 11.69"', widthIn: 8.27,  heightIn: 11.69, widthCm: 21.01, heightCm: 29.69, supportsPaperback: true,  supportsHardcover: false },
  '8.5x8.5':   { key: '8.5x8.5',   label: '8.5" × 8.5"',   widthIn: 8.5,   heightIn: 8.5,   widthCm: 21.59, heightCm: 21.59, supportsPaperback: true,  supportsHardcover: false },
  '8.5x11':    { key: '8.5x11',    label: '8.5" × 11"',     widthIn: 8.5,   heightIn: 11,    widthCm: 21.59, heightCm: 27.94, supportsPaperback: true,  supportsHardcover: false },
};

// ---------------------------------------------------------------------------
// Bleed Rules
// ---------------------------------------------------------------------------

/**
 * Official KDP bleed dimensions.
 * Source: https://kdp.amazon.com/help/topic/GVBQ3CMEQW3W2VL6
 *
 * "If you're uploading a file with bleed, add 0.125" to the width and
 *  0.25" to the height of the document size."
 * Example: 6" × 9" with bleed = 6.125" × 9.25"
 *
 * IMPORTANT: Width adds 0.125" (NOT 0.25"). Height adds 0.25".
 */
export const KDP_BLEED_RULES = {
  /** Add to trim WIDTH when bleed is selected (0.125 in = 1/8 inch) */
  BLEED_WIDTH_ADD_IN: 0.125,
  /** Add to trim HEIGHT when bleed is selected (0.25 in = 1/4 inch) */
  BLEED_HEIGHT_ADD_IN: 0.25,
  /** Cover bleed on each outside edge */
  COVER_BLEED_IN: 0.125,
  /** Dimension tolerance for validation (exact match) */
  TOLERANCE_IN: 0.02,
  /** Dimension tolerance for warning (slight variance) */
  TOLERANCE_WARN_IN: 0.03,
} as const;

// ---------------------------------------------------------------------------
// Margin Rules
// ---------------------------------------------------------------------------

export interface KdpMarginRule {
  minPages: number;
  maxPages: number;
  /** Minimum inside/gutter margin in inches */
  insideIn: number;
  /** Minimum outside margin when no bleed selected */
  outsideNoBleedIn: number;
  /** Minimum outside margin when bleed selected */
  outsideBleedIn: number;
  /** Top and bottom margin equals outside minimum */
  topBottomIn?: number;
}

/**
 * Official KDP minimum margin requirements by page count.
 * Source: https://kdp.amazon.com/help/topic/GVBQ3CMEQW3W2VL6
 *
 * Inside/gutter margin increases with page count to account for binding.
 * Outside, top, and bottom minimums are 0.25" (no bleed) or 0.375" (bleed).
 */
export const KDP_MARGIN_RULES: KdpMarginRule[] = [
  { minPages: 24,  maxPages: 150, insideIn: 0.375, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 151, maxPages: 300, insideIn: 0.5,   outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 301, maxPages: 500, insideIn: 0.625, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 501, maxPages: 700, insideIn: 0.75,  outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 701, maxPages: 828, insideIn: 0.875, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
];

// ---------------------------------------------------------------------------
// Spine Rules
// ---------------------------------------------------------------------------

/**
 * Official KDP spine width calculation factors (inches per page).
 * Source: https://kdp.amazon.com/en_US/help/topic/G201953020
 *
 * For standard-color and premium-color, the paper used is color paper (0.002347 in/page).
 */
export const KDP_SPINE_RULES = {
  SPINE_FACTORS_IN: {
    'white':           0.002252,
    'cream':           0.0025,
    'standard-color':  0.002347,
    'premium-color':   0.002347,
  } as Record<string, number>,
  /** Minimum pages before spine text is safe to add */
  SPINE_TEXT_MIN_PAGES: 80,
  /** Minimum clearance from spine edge for spine text */
  SPINE_TEXT_CLEARANCE_IN: 0.0625,
} as const;

// ---------------------------------------------------------------------------
// Cover Rules
// ---------------------------------------------------------------------------

/**
 * Official KDP cover requirements.
 * Paperback: https://kdp.amazon.com/en_US/help/topic/G201953020
 * Hardcover: https://kdp.amazon.com/help/topic/GAVW3FZZAKA2KY3B
 */
export const KDP_COVER_RULES = {
  /** Cover must be a single PDF page */
  MAX_COVER_PAGES: 1,
  /** Wrap-around for full cover (each side) */
  WRAP_AROUND_IN: 0.0625,
  /** Hardcover hinge width */
  HARDCOVER_HINGE_IN: 0.375,
  /** Hardcover wrap width */
  HARDCOVER_WRAP_IN: 0.625,
} as const;

// ---------------------------------------------------------------------------
// Barcode Rules
// ---------------------------------------------------------------------------

/**
 * Official KDP barcode requirements.
 * Source: https://kdp.amazon.com/help/topic/G5HDYGP4BXLX4RUW
 */
export const KDP_BARCODE_RULES = {
  MIN_WIDTH_IN: 1.4,
  MIN_HEIGHT_IN: 0.8,
  RECOMMENDED_WIDTH_IN: 2.0,
  RECOMMENDED_HEIGHT_IN: 1.2,
  MIN_DPI: 300,
  CLEARANCE_IN: 0.25,
  /** Barcode area position on back cover (inches from bottom-right) */
  AREA: { width: 2, height: 1.2 } as const,
} as const;

// ---------------------------------------------------------------------------
// Technical Rules
// ---------------------------------------------------------------------------

/**
 * Technical KDP file requirements.
 * Source: https://kdp.amazon.com/en_US/help/topic/G202145060
 */
export const KDP_TECHNICAL_RULES = {
  /** Official KDP maximum file size in MB */
  MAX_FILE_SIZE_MB: 650,
  /** Advisory threshold for large files */
  LARGE_FILE_ADVISORY_MB: 300,
  /** Minimum recommended image DPI for interior */
  MIN_IMAGE_DPI: 300,
  /** Minimum recommended DPI for covers */
  MIN_COVER_DPI: 300,
  /** DPI below which images are severely degraded */
  SEVERE_IMAGE_DPI: 150,
  /** Safe area inside trim */
  SAFE_AREA_IN: 0.25,
} as const;

// ---------------------------------------------------------------------------
// Print Combination Matrix
// ---------------------------------------------------------------------------

export interface KdpPrintMatrixEntry {
  bookType: 'paperback' | 'hardcover';
  trimKey: string;
  trimWidthIn: number;
  trimHeightIn: number;
  interior: 'black-white' | 'standard-color' | 'premium-color';
  paper: 'white' | 'cream';
  minPages: number;
  maxPages: number;
  expandedDistributionSupported: boolean;
  source: 'official-kdp';
  sourceUrl: string;
}

/**
 * Official KDP Expanded Distribution eligibility by trim and interior+paper.
 * Source: https://kdp.amazon.com/en_US/help/topic/GQTT4W3T5AYK7L45
 */
const EXPANDED_DISTRIBUTION: Record<string, Record<string, boolean>> = {
  '5x8':       { 'black-white:white': true,  'black-white:cream': true,  'premium-color:white': false, 'standard-color:white': true  },
  '5.06x7.81': { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true  },
  '5.25x8':    { 'black-white:white': true,  'black-white:cream': true,  'premium-color:white': false, 'standard-color:white': true  },
  '5.5x8.5':   { 'black-white:white': true,  'black-white:cream': true,  'premium-color:white': true,  'standard-color:white': true  },
  '6x9':       { 'black-white:white': true,  'black-white:cream': true,  'premium-color:white': true,  'standard-color:white': true  },
  '6.14x9.21': { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': true,  'standard-color:white': true  },
  '6.69x9.61': { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true  },
  '7x10':      { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': true,  'standard-color:white': true  },
  '7.44x9.69': { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true  },
  '7.5x9.25':  { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true  },
  '8x10':      { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': true,  'standard-color:white': true  },
  '8.25x6':    { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': false },
  '8.25x11':   { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': false },
  '8.25x8.25': { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': false },
  '8.5x8.5':   { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': true,  'standard-color:white': true  },
  '8.5x11':    { 'black-white:white': true,  'black-white:cream': false, 'premium-color:white': true,  'standard-color:white': true  },
};

/**
 * Raw paperback trim data rows.
 * Format: [trimKey, widthIn, heightIn, bwWhiteRange, bwCreamRange, standardColorRange, premiumColorRange]
 * Range: [minPages, maxPages] or null if not supported.
 *
 * Source: https://kdp.amazon.com/help/topic/G201834180 (Print Options table)
 * Source: https://kdp.amazon.com/help/topic/G201857950 (Paperback Submission Guidelines)
 *
 * Notes:
 * - Standard color minimum is 72 pages (KDP Print Options table).
 * - Premium color minimum is 24 pages (KDP Print Options table).
 * - Cream paper is only available for black-white interior.
 * - Color paper types (standard-color, premium-color) use white paper only.
 */
const PAPERBACK_TRIM_DATA: [string, number, number, [number,number]|null, [number,number]|null, [number,number]|null, [number,number]|null][] = [
  ['5x8',        5,    8,     [24, 828], [24, 776], [72, 600], [24, 828]],
  ['5.06x7.81',  5.06, 7.81,  [24, 828], [24, 776], [72, 600], [24, 828]],
  ['5.25x8',     5.25, 8,     [24, 828], [24, 776], [72, 600], [24, 828]],
  ['5.5x8.5',    5.5,  8.5,   [24, 828], [24, 776], [72, 600], [24, 828]],
  ['6x9',        6,    9,     [24, 828], [24, 776], [72, 600], [24, 828]],
  ['6.14x9.21',  6.14, 9.21,  [24, 828], [24, 776], [72, 600], [24, 828]],
  ['6.69x9.61',  6.69, 9.61,  [24, 828], [24, 776], [72, 600], [24, 828]],
  ['7x10',       7,    10,    [24, 828], [24, 776], [72, 600], [24, 828]],
  ['7.44x9.69',  7.44, 9.69,  [24, 828], [24, 776], [72, 600], [24, 828]],
  ['7.5x9.25',   7.5,  9.25,  [24, 828], [24, 776], [72, 600], [24, 828]],
  ['8x10',       8,    10,    [24, 828], [24, 776], [72, 600], [24, 828]],
  ['8.25x6',     8.25, 6,     [24, 800], [24, 750], [72, 600], [24, 800]],
  ['8.25x8.25',  8.25, 8.25,  [24, 800], [24, 750], [72, 600], [24, 800]],
  ['8.5x8.5',    8.5,  8.5,   [24, 590], [24, 550], [72, 600], [24, 590]],
  ['8.5x11',     8.5,  11,    [24, 590], [24, 550], [72, 600], [24, 590]],
  ['8.27x11.69', 8.27, 11.69, [24, 780], [24, 730], null,      [24, 590]],
];

/**
 * Raw hardcover trim data rows.
 * Format: [trimKey, widthIn, heightIn, bwWhiteRange, bwCreamRange, standardColorRange, premiumColorRange]
 *
 * Source: https://kdp.amazon.com/help/topic/GAVW3FZZAKA2KY3B
 * Source: https://kdp.amazon.com/help/topic/G201834180
 *
 * Notes:
 * - Hardcover page count range: 75–550 pages (official KDP rule).
 * - Standard color and premium color not available for hardcover (null).
 * - Cream paper not available for hardcover (null).
 */
const HARDCOVER_TRIM_DATA: [string, number, number, [number,number]|null, [number,number]|null, [number,number]|null, [number,number]|null][] = [
  ['5.5x8.5',   5.5,  8.5,  [75, 550], null, null, null],
  ['6x9',       6,    9,    [75, 550], null, null, null],
  ['6.14x9.21', 6.14, 9.21, [75, 550], null, null, null],
  ['7x10',      7,    10,   [75, 550], null, null, null],
  ['8.25x11',   8.25, 11,   [75, 550], null, null, null],
];

function buildPrintMatrix(): KdpPrintMatrixEntry[] {
  const rows: KdpPrintMatrixEntry[] = [];
  const interiorPaperCombos: Array<['black-white' | 'standard-color' | 'premium-color', 'white' | 'cream', number]> = [
    ['black-white',    'white', 0],
    ['black-white',    'cream', 1],
    ['standard-color', 'white', 2],
    ['premium-color',  'white', 3],
  ];

  for (const trimRow of PAPERBACK_TRIM_DATA) {
    const [trimKey, trimWidthIn, trimHeightIn, bwWhite, bwCream, stdColor, premColor] = trimRow;
    const ranges = [bwWhite, bwCream, stdColor, premColor];
    for (let i = 0; i < interiorPaperCombos.length; i++) {
      const [interior, paper] = interiorPaperCombos[i];
      const range = ranges[i];
      if (!range) continue;
      const edKey = `${interior}:${paper}`;
      rows.push({
        bookType: 'paperback',
        trimKey,
        trimWidthIn,
        trimHeightIn,
        interior,
        paper,
        minPages: range[0],
        maxPages: range[1],
        expandedDistributionSupported: !!(EXPANDED_DISTRIBUTION[trimKey]?.[edKey]),
        source: 'official-kdp',
        sourceUrl: KDP_OFFICIAL_SOURCES.printOptions,
      });
    }
  }

  for (const trimRow of HARDCOVER_TRIM_DATA) {
    const [trimKey, trimWidthIn, trimHeightIn, bwWhite] = trimRow;
    if (bwWhite) {
      rows.push({
        bookType: 'hardcover',
        trimKey,
        trimWidthIn,
        trimHeightIn,
        interior: 'black-white',
        paper: 'white',
        minPages: bwWhite[0],
        maxPages: bwWhite[1],
        expandedDistributionSupported: false,
        source: 'official-kdp',
        sourceUrl: KDP_OFFICIAL_SOURCES.hardcover,
      });
    }
  }

  return rows;
}

/**
 * Complete KDP print combination matrix.
 * All valid combinations of bookType, trimKey, interior, paper with page count limits.
 * If a combination is not in this matrix, it is not supported by KDP.
 */
export const KDP_PRINT_MATRIX: KdpPrintMatrixEntry[] = buildPrintMatrix();

// ---------------------------------------------------------------------------
// Shared Issue Types (mirrors worker + types.ts)
// ---------------------------------------------------------------------------

export type KdpIssueCategory = 'must-fix' | 'should-fix' | 'info';
export type KdpIssueSeverity = 'critical' | 'warning' | 'info';
export type KdpIssueStatus = 'blocking' | 'warning' | 'print_advisory' | 'cost_advisory' | 'info' | 'skipped';
export type KdpIssueSource = 'official-kdp' | 'derived-from-kdp-formula' | 'best-effort' | 'missing-metadata' | 'missing-rule-matrix';
export type KdpFixability = 'auto-fix' | 'manual-review' | 'info-only';
export type KdpConfidence = 'high' | 'medium' | 'low';
export type KdpIssueScope = 'setup' | 'page' | 'cover' | 'spine' | 'technical';
export type KdpIssueClassification = 'blockingIssue' | 'warningIssue' | 'advisoryIssue' | 'costAdvisory' | 'skippedCheck' | 'passedCheck';

export interface KdpIssueEvidence {
  actual?: unknown;
  expected?: unknown;
  rule?: string;
  sourceUrl?: string;
  payloadFieldsUsed?: string[];
  notes?: string;
}

export interface KdpIssue {
  id: string;
  category: KdpIssueCategory;
  severity: KdpIssueSeverity;
  status: KdpIssueStatus;
  issueType: string;
  scope: KdpIssueScope;
  title: string;
  whyMatters: string;
  where: string;
  howToFix: string;
  pageRefs: number[];
  fixability: KdpFixability;
  confidence: KdpConfidence;
  source: KdpIssueSource;
  evidence?: KdpIssueEvidence;
}

// ---------------------------------------------------------------------------
// Core Helper Functions
// ---------------------------------------------------------------------------

/**
 * Calculate the required manuscript PDF page size given a trim and bleed selection.
 *
 * Official KDP rule (https://kdp.amazon.com/help/topic/GVBQ3CMEQW3W2VL6):
 *   "If you're uploading a file with bleed, add 0.125" to the width and
 *    0.25" to the height."
 * Example: 6" × 9" with bleed = 6.125" × 9.25"
 * Example: 8.5" × 11" with bleed = 8.625" × 11.25"
 * Example: 8.25" × 8.25" with bleed = 8.375" × 8.5"
 *
 * IMPORTANT: Width adds 0.125" ONLY. Height adds 0.25". Do not add 0.25" to both.
 */
export function getExpectedManuscriptSize(
  trimWidthIn: number,
  trimHeightIn: number,
  bleed: 'bleed' | 'no-bleed',
): { widthIn: number; heightIn: number; includesBleed: boolean } {
  const hasBleed = bleed === 'bleed';
  return {
    widthIn:  trimWidthIn  + (hasBleed ? KDP_BLEED_RULES.BLEED_WIDTH_ADD_IN  : 0),
    heightIn: trimHeightIn + (hasBleed ? KDP_BLEED_RULES.BLEED_HEIGHT_ADD_IN : 0),
    includesBleed: hasBleed,
  };
}

/**
 * Get the applicable KDP margin rule for a given page count.
 * Returns null if page count is outside all defined ranges.
 */
export function getMarginRequirements(pageCount: number): KdpMarginRule | null {
  return KDP_MARGIN_RULES.find(r => pageCount >= r.minPages && pageCount <= r.maxPages) ?? null;
}

/**
 * Look up a KDP print matrix entry for the given configuration.
 * Matches by bookType, interior, paper, and either trimKey or approximate dimensions.
 * Returns null if the combination is not supported.
 */
export function getPrintCombinationRule(
  bookType: string,
  trimKey: string,
  trimWidthIn: number,
  trimHeightIn: number,
  interior: string,
  paper: string,
): KdpPrintMatrixEntry | null {
  const tol = KDP_BLEED_RULES.TOLERANCE_IN;

  // Primary match: by key + interior + paper + bookType
  let match = KDP_PRINT_MATRIX.find(r =>
    r.bookType === bookType &&
    r.interior === interior &&
    r.paper === paper &&
    (r.trimKey === trimKey ||
      (Math.abs(r.trimWidthIn - trimWidthIn) <= tol &&
       Math.abs(r.trimHeightIn - trimHeightIn) <= tol))
  );

  // Fallback: trimKey only (in case dimensions are slightly off)
  if (!match && trimKey) {
    match = KDP_PRINT_MATRIX.find(r =>
      r.bookType === bookType &&
      r.interior === interior &&
      r.paper === paper &&
      r.trimKey === trimKey
    );
  }

  return match ?? null;
}

// ---------------------------------------------------------------------------
// Issue Helpers
// ---------------------------------------------------------------------------

/**
 * Create a standardized KDP issue object.
 * Mirrors the createIssue() function in the worker for consistent output shape.
 */
export function createKdpIssue(fields: Partial<KdpIssue> & { id: string; title: string; whyMatters: string; howToFix: string }): KdpIssue {
  const category = fields.category ?? 'info';
  const severity = fields.severity ?? (
    category === 'must-fix' ? 'critical' :
    category === 'should-fix' ? 'warning' : 'info'
  );
  const status = fields.status ?? (
    category === 'must-fix' ? 'blocking' :
    category === 'should-fix' ? 'warning' : 'info'
  );
  return {
    id: fields.id,
    category,
    severity,
    status,
    issueType: fields.issueType ?? fields.id,
    scope: fields.scope ?? 'setup',
    title: fields.title,
    whyMatters: fields.whyMatters,
    where: fields.where ?? 'Book setup.',
    howToFix: fields.howToFix,
    pageRefs: fields.pageRefs ?? [],
    fixability: fields.fixability ?? (category === 'info' ? 'info-only' : 'manual-review'),
    confidence: fields.confidence ?? (fields.source === 'missing-metadata' ? 'low' : 'high'),
    source: fields.source ?? 'official-kdp',
    evidence: fields.evidence,
  };
}

/**
 * Classify a KDP issue into display categories.
 * Mirrors classifyIssue() in the worker.
 */
export function classifyKdpIssue(issue: KdpIssue): KdpIssueClassification {
  if (issue.status === 'skipped') return 'skippedCheck';
  if (issue.status === 'cost_advisory') return 'costAdvisory';
  if (issue.category === 'must-fix' || issue.status === 'blocking') return 'blockingIssue';
  if (issue.category === 'should-fix' || issue.status === 'warning') return 'warningIssue';
  if (issue.category === 'info') return 'advisoryIssue';
  return 'advisoryIssue';
}

// ---------------------------------------------------------------------------
// Setup Validation
// ---------------------------------------------------------------------------

export interface SetupValidationConfig {
  bookType: string;
  trimKey: string;
  trimWidthIn: number;
  trimHeightIn: number;
  interior: string;
  paper: string;
  bleed: 'bleed' | 'no-bleed';
  pageCount?: number | null;
  expandedDistributionEnabled?: boolean;
}

export interface SetupValidationResult {
  /** True if no blocking issues found */
  ok: boolean;
  /** Issues detected (blocking, warning, or info) */
  issues: KdpIssue[];
  /** Required manuscript PDF export size */
  expectedManuscriptSize: { widthIn: number; heightIn: number; includesBleed: boolean };
  /** Margin requirements if page count is known */
  marginRequirements: KdpMarginRule | null;
  /** The matched print matrix row, if found */
  selectedPrintRule: KdpPrintMatrixEntry | null;
  /** Checks that were performed */
  checksPerformed: string[];
  /** Checks that were skipped and why */
  checksSkipped: string[];
  /** Official KDP source URLs used for this validation */
  officialSourcesUsed: string[];
}

/**
 * Validate a Setup screen configuration against official KDP rules.
 *
 * Returns issues (must-fix / should-fix / info), the expected manuscript size,
 * and margin requirements.
 *
 * - Does NOT invent rules. If a combination cannot be verified, returns
 *   source: 'missing-rule-matrix' with status: 'skipped'.
 * - Does NOT show fake errors when page count is missing.
 * - Does NOT block on info-level checks.
 */
export function validateSetupConfig(config: SetupValidationConfig): SetupValidationResult {
  const issues: KdpIssue[] = [];
  const checksPerformed: string[] = [];
  const checksSkipped: string[] = [];
  const officialSourcesUsed: string[] = [];

  // --- 1. Book type ---
  checksPerformed.push('book-type');
  if (!KDP_SUPPORTED_BOOK_TYPES.includes(config.bookType as KdpBookType)) {
    issues.push(createKdpIssue({
      id: 'unsupported-book-type',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: 'Unsupported book type',
      whyMatters: `KDP print only supports paperback and hardcover. "${config.bookType}" is not a valid print format.`,
      where: 'Book type selection.',
      howToFix: 'Choose Paperback or Hardcover.',
      source: 'official-kdp',
      evidence: {
        actual: { bookType: config.bookType },
        expected: { bookType: KDP_SUPPORTED_BOOK_TYPES },
        rule: 'KDP print supports paperback and hardcover only.',
        sourceUrl: KDP_OFFICIAL_SOURCES.printOptions,
      },
    }));
    // Can't continue without valid book type
    return {
      ok: false, issues,
      expectedManuscriptSize: getExpectedManuscriptSize(config.trimWidthIn, config.trimHeightIn, config.bleed),
      marginRequirements: null,
      selectedPrintRule: null,
      checksPerformed, checksSkipped,
      officialSourcesUsed: [KDP_OFFICIAL_SOURCES.printOptions],
    };
  }

  // --- 2. Interior type ---
  checksPerformed.push('interior-type');
  if (!KDP_SUPPORTED_INTERIORS.includes(config.interior as KdpInteriorType)) {
    issues.push(createKdpIssue({
      id: 'unsupported-interior',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: 'Unsupported interior type',
      whyMatters: `"${config.interior}" is not a supported KDP print interior type.`,
      where: 'Interior selection.',
      howToFix: 'Choose Black & White, Standard Color, or Premium Color.',
      source: 'official-kdp',
      evidence: {
        actual: { interior: config.interior },
        expected: { interior: KDP_SUPPORTED_INTERIORS },
        sourceUrl: KDP_OFFICIAL_SOURCES.colorInkOptions,
      },
    }));
  }

  // --- 3. Paper type ---
  checksPerformed.push('paper-type');
  if (!KDP_SUPPORTED_PAPER_TYPES.includes(config.paper as KdpPaperType)) {
    issues.push(createKdpIssue({
      id: 'unsupported-paper',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: 'Unsupported paper type',
      whyMatters: `"${config.paper}" is not a supported KDP paper type. KDP offers white and cream paper.`,
      where: 'Paper type selection.',
      howToFix: 'Choose White or Cream paper.',
      source: 'official-kdp',
      evidence: {
        actual: { paper: config.paper },
        expected: { paper: KDP_SUPPORTED_PAPER_TYPES },
        sourceUrl: KDP_OFFICIAL_SOURCES.printOptions,
      },
    }));
  }

  // --- 4. Interior + paper combination ---
  // Official KDP: cream paper is only available for black-white interior.
  // Standard-color and premium-color require white paper (color paper type).
  // Source: https://kdp.amazon.com/help/topic/GX56BFPW4BKNPGFW
  checksPerformed.push('interior-paper-compatibility');
  officialSourcesUsed.push(KDP_OFFICIAL_SOURCES.colorInkOptions);
  if (config.paper === 'cream' && config.interior !== 'black-white') {
    issues.push(createKdpIssue({
      id: 'interior-paper-incompatible',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: `${config.interior === 'standard-color' ? 'Standard Color' : 'Premium Color'} interior is not available with Cream paper`,
      whyMatters: 'KDP only offers cream paper for black & white interiors. Color printing requires white (color) paper.',
      where: 'Interior and paper type selection.',
      howToFix: 'Change paper to White, or change interior to Black & White.',
      source: 'official-kdp',
      evidence: {
        actual: { interior: config.interior, paper: config.paper },
        expected: { paper: 'white' },
        rule: 'Cream paper is only available for black-white interiors.',
        sourceUrl: KDP_OFFICIAL_SOURCES.colorInkOptions,
      },
    }));
  }

  // --- 5. Print matrix lookup (trim + interior + paper + book type) ---
  checksPerformed.push('trim-interior-paper-matrix');
  officialSourcesUsed.push(KDP_OFFICIAL_SOURCES.printOptions);

  const printRule = getPrintCombinationRule(
    config.bookType,
    config.trimKey,
    config.trimWidthIn,
    config.trimHeightIn,
    config.interior,
    config.paper,
  );

  if (!printRule) {
    issues.push(createKdpIssue({
      id: 'unsupported-combination',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: 'This print setup is not in KDP\'s official print options table',
      whyMatters: 'KDP page-count limits depend on book type, trim size, interior, and paper. This combination was not found in the official KDP print matrix.',
      where: 'Book setup.',
      howToFix: 'Choose a trim, interior, and paper combination listed in KDP Print Options.',
      source: 'official-kdp',
      evidence: {
        actual: { bookType: config.bookType, trimKey: config.trimKey, interior: config.interior, paper: config.paper },
        expected: { matrix: 'A matching official KDP print option row' },
        rule: 'Print options must match an available KDP combination.',
        sourceUrl: KDP_OFFICIAL_SOURCES.printOptions,
      },
    }));
  }

  // --- 6. Page count validation (only if page count is known) ---
  if (config.pageCount != null && Number.isFinite(config.pageCount) && config.pageCount > 0) {
    checksPerformed.push('page-count');
    officialSourcesUsed.push(KDP_OFFICIAL_SOURCES.printOptions);

    if (printRule) {
      const pc = config.pageCount;
      if (pc < printRule.minPages || pc > printRule.maxPages) {
        const low = pc < printRule.minPages;
        issues.push(createKdpIssue({
          id: low ? 'page-count-low' : 'page-count-high',
          category: 'must-fix',
          issueType: low ? 'page-count-low' : 'page-count-high',
          scope: 'setup',
          title: low ? 'Not enough pages for this KDP print setup' : 'Too many pages for this KDP print setup',
          whyMatters: 'KDP minimum and maximum page counts vary by format, trim size, interior, and paper type.',
          where: `Book has ${pc} pages; official range for this setup is ${printRule.minPages}–${printRule.maxPages}.`,
          howToFix: low
            ? `Add pages or choose a setup with a lower minimum (minimum is ${printRule.minPages}).`
            : `Reduce page count, split into volumes, or choose a setup with a higher maximum (maximum is ${printRule.maxPages}).`,
          source: 'official-kdp',
          evidence: {
            actual: { pageCount: pc },
            expected: { minPages: printRule.minPages, maxPages: printRule.maxPages },
            rule: 'KDP page-count range for selected book type, trim, interior, and paper.',
            sourceUrl: KDP_OFFICIAL_SOURCES.printOptions,
          },
        }));
      }
    }
  } else {
    // Page count unknown — skip page count and margin checks, note as info
    checksSkipped.push('page-count');
    checksSkipped.push('margin-requirements');
    issues.push(createKdpIssue({
      id: 'page-count-unknown',
      category: 'info',
      severity: 'info',
      status: 'info',
      issueType: 'metadata-skipped',
      scope: 'setup',
      title: 'Enter page count for full margin and page count validation',
      whyMatters: 'KDP margin/gutter minimums and page count limits depend on the total page count.',
      where: 'Page count input.',
      howToFix: 'Enter your book\'s page count to see required margins and validate page count limits.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
    }));
  }

  // --- 7. Expanded Distribution ---
  if (config.expandedDistributionEnabled) {
    checksPerformed.push('expanded-distribution');
    officialSourcesUsed.push(KDP_OFFICIAL_SOURCES.expandedDistribution);

    if (config.bookType === 'hardcover') {
      issues.push(createKdpIssue({
        id: 'expanded-distribution-hardcover',
        category: 'must-fix',
        issueType: 'unsupported-combination',
        scope: 'setup',
        title: 'Hardcover is not eligible for Expanded Distribution',
        whyMatters: 'KDP Expanded Distribution is only available for paperback books.',
        where: 'Expanded Distribution setting.',
        howToFix: 'Disable Expanded Distribution for this hardcover, or publish a paperback edition.',
        source: 'official-kdp',
        evidence: {
          actual: { bookType: 'hardcover', expandedDistributionEnabled: true },
          expected: { bookType: 'paperback' },
          rule: 'Hardcover books are not eligible for Expanded Distribution.',
          sourceUrl: KDP_OFFICIAL_SOURCES.expandedDistribution,
        },
      }));
    } else if (printRule && !printRule.expandedDistributionSupported) {
      issues.push(createKdpIssue({
        id: 'expanded-distribution-unsupported',
        category: 'must-fix',
        issueType: 'unsupported-combination',
        scope: 'setup',
        title: 'This setup is not eligible for Expanded Distribution',
        whyMatters: 'KDP Expanded Distribution eligibility depends on trim size, interior, and paper type.',
        where: 'Expanded Distribution setting.',
        howToFix: 'Disable Expanded Distribution or choose an eligible combination.',
        source: 'official-kdp',
        evidence: {
          actual: { trimKey: config.trimKey, interior: config.interior, paper: config.paper },
          expected: { expandedDistributionSupported: true },
          rule: 'KDP Expanded Distribution eligibility chart.',
          sourceUrl: KDP_OFFICIAL_SOURCES.expandedDistribution,
        },
      }));
    }
  }

  // --- Compute outputs ---
  const expectedManuscriptSize = getExpectedManuscriptSize(config.trimWidthIn, config.trimHeightIn, config.bleed);
  const marginRequirements = (config.pageCount != null && Number.isFinite(config.pageCount))
    ? getMarginRequirements(config.pageCount)
    : null;

  const blockingIssues = issues.filter(i => i.category === 'must-fix');

  return {
    ok: blockingIssues.length === 0,
    issues,
    expectedManuscriptSize,
    marginRequirements,
    selectedPrintRule: printRule,
    checksPerformed,
    checksSkipped,
    officialSourcesUsed,
  };
}
