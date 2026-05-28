/**
 * KDP Analysis Web Worker — print-only validator.
 * Self-contained: no imports. Source of truth is official Amazon KDP help.
 *
 * SYNC MARKER: Rule constants and matrices in this file must stay in sync with
 * the shared TypeScript rules file at src/lib/kdp/kdp-rules.ts.
 * RULE_VERSION must match KDP_RULE_VERSION in kdp-rules.ts.
 * When updating KDP rules:
 *   1. Update rule tables in this file (worker — authoritative for Preflight)
 *   2. Update matching constants in src/lib/kdp/kdp-rules.ts (Setup + Engine)
 */

const RULE_VERSION = 'kdp-print-rules-2026-05-27'; // Sync: KDP_RULE_VERSION in src/lib/kdp/kdp-rules.ts

const OFFICIAL_SOURCES = {
  trimBleedMargins: 'https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6/',
  paperbackGuidelines: 'https://kdp.amazon.com/en_US/help/topic/G201857950',
  printOptions: 'https://kdp.amazon.com/en_US/help/topic/G201834180',
  hardcover: 'https://kdp.amazon.com/en_US/help/topic/GAVW3FZZAKA2KY3B',
  hardcoverCover: 'https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6',
  saveManuscript: 'https://kdp.amazon.com/en_US/help/topic/G202145060',
  paperbackCover: 'https://kdp.amazon.com/en_US/help/topic/G201953020',
  barcodes: 'https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW',
  colorInkOptions: 'https://kdp.amazon.com/en_US/help/topic/GX56BFPW4BKNPGFW',
  images: 'https://kdp.amazon.com/en_US/help/topic/G202169030',
  formattingIssues: 'https://kdp.amazon.com/en_US/help/topic/G201834260',
  expandedDistribution: 'https://kdp.amazon.com/en_US/help/topic/GQTT4W3T5AYK7L45',
};

const TOLERANCE_IN = 0.02;
const TOLERANCE_WARN_IN = 0.03;
const BLEED_WIDTH_ADD_IN = 0.125;
const BLEED_HEIGHT_ADD_IN = 0.25;
const COVER_BLEED_IN = 0.125;
const SPINE_TEXT_MIN_PAGES = 80;
const SPINE_TEXT_CLEARANCE_IN = 0.0625;
const BARCODE_MIN_WIDTH_IN = 1.4;
const BARCODE_MIN_HEIGHT_IN = 0.8;
const BARCODE_RECOMMENDED_WIDTH_IN = 2;
const BARCODE_RECOMMENDED_HEIGHT_IN = 1.2;
const BARCODE_MIN_DPI = 300;
const BARCODE_CLEARANCE_IN = 0.25;
const MIN_IMAGE_DPI = 300;
const SEVERE_IMAGE_DPI = 150;
const KDP_OFFICIAL_FILE_SIZE_LIMIT_MB = 650;
const LARGE_FILE_ADVISORY_MB = 300;
const OFFICIAL_EXPANDED_DISTRIBUTION_MATRIX_IMPLEMENTED = true;
const COLOR_HAS_RATIO_THRESHOLD = 0.001;
const COLOR_MEANINGFUL_RATIO_THRESHOLD = 0.003;
const COLOR_MANY_PAGE_RATIO_THRESHOLD = 0.1;
const COLOR_MAJORITY_PAGE_RATIO_THRESHOLD = 0.5;

const FIX_ACTIONS = {
  convertToBlackWhite: {
    actionId: 'convert-to-black-white',
    label: 'Convert to Black & White',
    description: 'Convert color content to grayscale. Preserves page size, bleed, cropBox, trimBox, mediaBox, page order, and page count. Does not reduce image resolution below 300 DPI. Re-runs full KDP analysis after conversion. Converted pages may lose contrast — review the KDP Previewer before publishing.',
    riskLevel: 'medium',
    requiresUserConfirmation: true,
    rerunAnalysisAfterFix: true,
  },
  changeSetupToColor: {
    actionId: 'change-setup-to-color',
    label: 'Change setup to Color',
    description: 'Change the selected KDP interior type to Standard Color or Premium Color, then re-run trim/interior/paper/page-count compatibility checks.',
    riskLevel: 'low',
    requiresUserConfirmation: true,
    rerunAnalysisAfterFix: true,
  },
  switchSetupToBlackWhite: {
    actionId: 'switch-setup-to-black-white',
    label: 'Switch to Black & White',
    description: 'Change the selected KDP interior type to Black & White if color printing was accidental, then re-run compatibility checks.',
    riskLevel: 'low',
    requiresUserConfirmation: true,
    rerunAnalysisAfterFix: true,
  },
  keepColor: {
    actionId: 'keep-color',
    label: 'Keep Color',
    description: 'Keep the current color interior setup if the color pages are intentional. No changes are made.',
    riskLevel: 'none',
    requiresUserConfirmation: false,
    rerunAnalysisAfterFix: false,
  },
  resizeManuscriptPageSize: {
    actionId: 'resize-manuscript-page-size',
    label: 'Resize manuscript pages',
    description: 'Resize manuscript page boxes to the selected trim and bleed setup while preserving content as much as possible. Review the KDP Previewer after export.',
    riskLevel: 'medium',
    requiresUserConfirmation: true,
    rerunAnalysisAfterFix: true,
  },
  addBleedCanvas: {
    actionId: 'add-bleed-canvas',
    label: 'Add bleed canvas',
    description: 'Add the KDP bleed page area. This is only safe when edge artwork can be extended cleanly.',
    riskLevel: 'medium',
    requiresUserConfirmation: true,
    rerunAnalysisAfterFix: true,
  },
  flattenTransparencyLayers: {
    actionId: 'flatten-transparency-layers',
    label: 'Flatten transparency/layers',
    description: 'Flatten transparency or layers if the parser/fixer supports it, then re-run validation.',
    riskLevel: 'medium',
    requiresUserConfirmation: true,
    rerunAnalysisAfterFix: true,
  },
  removeAnnotationsForms: {
    actionId: 'remove-annotations-form-fields',
    label: 'Remove annotations/forms',
    description: 'Flatten or remove annotations and form fields when safe, then re-run validation.',
    riskLevel: 'medium',
    requiresUserConfirmation: true,
    rerunAnalysisAfterFix: true,
  },
};

// Official KDP source: Paperback Submission Guidelines, cover specifications.
const PAPERBACK_SPINE_FACTORS_IN = {
  'white': 0.002252,
  'cream': 0.0025,
  'standard-color': 0.002347,
  'premium-color': 0.002347,
};

// Official KDP source: Set Trim Size, Bleed, and Margins.
const KDP_MARGIN_RULES = [
  { minPages: 24, maxPages: 150, insideIn: 0.375, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 151, maxPages: 300, insideIn: 0.5, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 301, maxPages: 500, insideIn: 0.625, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 501, maxPages: 700, insideIn: 0.75, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
  { minPages: 701, maxPages: 828, insideIn: 0.875, outsideNoBleedIn: 0.25, outsideBleedIn: 0.375 },
];

// Official KDP source: Print Options and Paperback Submission Guidelines tables.
const PAPERBACK_TRIMS = [
  ['5x8', 5, 8, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['5.06x7.81', 5.06, 7.81, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['5.25x8', 5.25, 8, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['5.5x8.5', 5.5, 8.5, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['6x9', 6, 9, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['6.14x9.21', 6.14, 9.21, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['6.69x9.61', 6.69, 9.61, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['7x10', 7, 10, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['7.44x9.69', 7.44, 9.69, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['7.5x9.25', 7.5, 9.25, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['8x10', 8, 10, [24, 828], [24, 776], [72, 600], [24, 828]],
  ['8.25x6', 8.25, 6, [24, 800], [24, 750], [72, 600], [24, 800]],
  ['8.25x8.25', 8.25, 8.25, [24, 800], [24, 750], [72, 600], [24, 800]],
  ['8.5x8.5', 8.5, 8.5, [24, 590], [24, 550], [72, 600], [24, 590]],
  ['8.5x11', 8.5, 11, [24, 590], [24, 550], [72, 600], [24, 590]],
  ['8.27x11.69', 8.27, 11.69, [24, 780], [24, 730], null, [24, 590]],
];

// Official KDP source: Print Options hardcover table.
const HARDCOVER_TRIMS = [
  ['5.5x8.5', 5.5, 8.5, [75, 550], [75, 550], null, [75, 550]],
  ['6x9', 6, 9, [75, 550], [75, 550], null, [75, 550]],
  ['6.14x9.21', 6.14, 9.21, [75, 550], [75, 550], null, [75, 550]],
  ['7x10', 7, 10, [75, 550], [75, 550], null, [75, 550]],
  ['8.25x11', 8.25, 11, [75, 550], [75, 550], null, [75, 550]],
];

// Official KDP source: Expanded Distribution eligibility chart.
const EXPANDED_DISTRIBUTION = {
  '5x8': { 'black-white:white': true, 'black-white:cream': true, 'premium-color:white': false, 'standard-color:white': true },
  '5.06x7.81': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true },
  '5.25x8': { 'black-white:white': true, 'black-white:cream': true, 'premium-color:white': false, 'standard-color:white': true },
  '5.5x8.5': { 'black-white:white': true, 'black-white:cream': true, 'premium-color:white': true, 'standard-color:white': true },
  '6x9': { 'black-white:white': true, 'black-white:cream': true, 'premium-color:white': true, 'standard-color:white': true },
  '6.14x9.21': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': true, 'standard-color:white': true },
  '6.69x9.61': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true },
  '7x10': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': true, 'standard-color:white': true },
  '7.44x9.69': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true },
  '7.5x9.25': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': true },
  '8x10': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': true, 'standard-color:white': true },
  '8.25x6': { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': false },
  '8.25x11': { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': false },
  '8.25x8.25': { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': false, 'standard-color:white': false },
  '8.5x8.5': { 'black-white:white': false, 'black-white:cream': false, 'premium-color:white': true, 'standard-color:white': true },
  '8.5x11': { 'black-white:white': true, 'black-white:cream': false, 'premium-color:white': true, 'standard-color:white': true },
};

const KDP_PRINT_MATRIX = buildPrintMatrix();

function buildPrintMatrix() {
  const rows = [];
  for (const trim of PAPERBACK_TRIMS) addRows(rows, 'paperback', trim);
  for (const trim of HARDCOVER_TRIMS) addRows(rows, 'hardcover', trim);
  return rows;
}

function addRows(rows, bookType, trim) {
  const [trimKey, trimWidthIn, trimHeightIn, bwWhite, bwCream, standardWhite, premiumWhite] = trim;
  const candidates = [
    ['black-white', 'white', bwWhite],
    ['black-white', 'cream', bwCream],
    ['standard-color', 'white', standardWhite],
    ['premium-color', 'white', premiumWhite],
  ];
  for (const [interior, paper, range] of candidates) {
    if (!range) continue;
    const edKey = `${interior}:${paper}`;
    rows.push({
      bookType,
      trimKey,
      trimWidthIn,
      trimHeightIn,
      interior,
      paper,
      minPages: range[0],
      maxPages: range[1],
      expandedDistributionSupported: bookType === 'paperback'
        ? !!(EXPANDED_DISTRIBUTION[trimKey] && EXPANDED_DISTRIBUTION[trimKey][edKey])
        : false,
      source: 'official-kdp',
    });
  }
}

function asNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function round3(value) {
  return Math.round(asNumber(value) * 1000) / 1000;
}

function isPresent(value) {
  return value !== undefined && value !== null;
}

function hasSize(size) {
  return size && Number.isFinite(size.widthIn) && Number.isFinite(size.heightIn) && size.widthIn > 0 && size.heightIn > 0;
}

function sizeMatches(actual, expected, tolerance = TOLERANCE_IN) {
  if (!hasSize(actual) || !hasSize(expected)) return false;
  return Math.abs(actual.widthIn - expected.widthIn) <= tolerance &&
    Math.abs(actual.heightIn - expected.heightIn) <= tolerance;
}

function formatSize(size) {
  if (!hasSize(size)) return 'unknown size';
  return `${round3(size.widthIn).toFixed(3)}" x ${round3(size.heightIn).toFixed(3)}"`;
}

function formatPageList(refs) {
  const pages = Array.isArray(refs) ? refs.filter(Number.isFinite) : [];
  if (pages.length === 0) return 'All pages';
  if (pages.length === 1) return `Page ${pages[0]}`;
  if (pages.length <= 6) return `Pages ${pages.join(', ')}`;
  return `Pages ${pages.slice(0, 6).join(', ')} and ${pages.length - 6} more`;
}

function sourceName(source) {
  return source === 'missing-metadata' ? 'missing-metadata' : source;
}

function createIssue(fields) {
  const category = fields.category || 'info';
  const severity = fields.severity || (category === 'must-fix' ? 'critical' : category === 'should-fix' ? 'warning' : 'info');
  const status = fields.status || (category === 'must-fix' ? 'blocking' : category === 'should-fix' ? 'warning' : 'info');
  return {
    id: fields.id,
    category,
    severity,
    status,
    issueType: fields.issueType || fields.id,
    scope: fields.scope || 'setup',
    title: fields.title,
    whyMatters: fields.whyMatters,
    where: fields.where || 'Not available.',
    howToFix: fields.howToFix || 'Review this in KDP Previewer.',
    pageRefs: Array.isArray(fields.pageRefs) ? fields.pageRefs : [],
    fixability: fields.fixability || (category === 'info' ? 'info-only' : 'manual-review'),
    confidence: fields.confidence || (fields.source === 'missing-metadata' ? 'low' : 'high'),
    source: sourceName(fields.source || 'official-kdp'),
    affectedPageCount: fields.affectedPageCount,
    totalPageCount: fields.totalPageCount,
    fixActions: Array.isArray(fields.fixActions) ? fields.fixActions : [],
    evidence: {
      actual: fields.evidence && fields.evidence.actual,
      expected: fields.evidence && fields.evidence.expected,
      rule: fields.evidence && fields.evidence.rule,
      payloadFieldsUsed: fields.evidence && fields.evidence.payloadFieldsUsed || [],
      notes: fields.evidence && fields.evidence.notes,
    },
  };
}

function noteSkipped(ctx, check, missing, issue) {
  if (!ctx.checksSkipped.some(item => item.checkId === check)) {
    ctx.checksSkipped.push({
      checkId: check,
      reason: issue?.whyMatters || `${check} requires additional parser metadata.`,
      missingMetadata: missing,
      source: 'missing-metadata',
      status: 'skipped',
    });
  }
  for (const field of missing) {
    if (!ctx.missingMetadata.includes(field)) ctx.missingMetadata.push(field);
  }
  if (issue) ctx.globalDiagnostics.push(issue);
}

function notePerformed(ctx, check) {
  if (!ctx.checksPerformed.includes(check)) ctx.checksPerformed.push(check);
}

function classifyIssue(issue) {
  if (issue.status === 'skipped') return 'skippedCheck';
  if (issue.status === 'cost_advisory') return 'costAdvisory';
  if (issue.category === 'must-fix' || issue.status === 'blocking') return 'blockingIssue';
  if (issue.category === 'should-fix' || issue.status === 'warning') return 'warningIssue';
  if (issue.category === 'info') return 'advisoryIssue';
  return 'advisoryIssue';
}

function isRealPageIssue(issue) {
  return issue.scope === 'page' && issue.status !== 'skipped' && (issue.category === 'must-fix' || issue.category === 'should-fix' || issue.status === 'print_advisory');
}

function realIssuesForPage(issues, pageNumber, pageCount) {
  return issues.filter(issue => {
    if (!isRealPageIssue(issue)) return false;
    if (issue.pageRefs.length === 0) return pageCount > 0;
    return issue.pageRefs.includes(pageNumber);
  });
}

function getExpectedManuscriptSize(trimWidthIn, trimHeightIn, hasBleed) {
  return {
    widthIn: trimWidthIn + (hasBleed ? BLEED_WIDTH_ADD_IN : 0),
    heightIn: trimHeightIn + (hasBleed ? BLEED_HEIGHT_ADD_IN : 0),
  };
}

function getAlternateManuscriptSize(trimWidthIn, trimHeightIn, hasBleed) {
  return getExpectedManuscriptSize(trimWidthIn, trimHeightIn, !hasBleed);
}

function getPageEntries(payload) {
  if (Array.isArray(payload.pageBoxes) && payload.pageBoxes.length > 0) {
    return payload.pageBoxes.map((box, index) => ({
      pageNumber: box.pageNumber || index + 1,
      printBox: box.printBox || { widthIn: payload.widthIn, heightIn: payload.heightIn },
      sourceBox: box,
    })).filter(entry => hasSize(entry.printBox));
  }
  if (Array.isArray(payload.pageWidths) && Array.isArray(payload.pageHeights) && payload.pageWidths.length > 0) {
    return payload.pageWidths.map((widthIn, index) => ({
      pageNumber: index + 1,
      printBox: { widthIn, heightIn: payload.pageHeights[index] },
      sourceBox: null,
    })).filter(entry => hasSize(entry.printBox));
  }
  if (hasSize({ widthIn: payload.widthIn, heightIn: payload.heightIn })) {
    return [{ pageNumber: 1, printBox: { widthIn: payload.widthIn, heightIn: payload.heightIn }, sourceBox: null }];
  }
  return [];
}

function checkRequiredSetupMetadata(payload, ctx) {
  notePerformed(ctx, 'required-setup-metadata');
  const missing = [];
  const validBookTypes = ['paperback', 'hardcover', 'kindle'];
  const validBleed = ['bleed', 'no-bleed'];
  const validInteriors = ['black-white', 'standard-color', 'premium-color'];
  const validPapers = ['white', 'cream'];

  if (!validBookTypes.includes(payload.bookType)) missing.push('bookType');
  if (!Number.isFinite(Number(payload.confirmedTrimWidthIn)) || Number(payload.confirmedTrimWidthIn) <= 0) missing.push('confirmedTrimWidthIn');
  if (!Number.isFinite(Number(payload.confirmedTrimHeightIn)) || Number(payload.confirmedTrimHeightIn) <= 0) missing.push('confirmedTrimHeightIn');
  if (!validBleed.includes(payload.confirmedBleed)) missing.push('confirmedBleed');
  if (!validInteriors.includes(payload.interior)) missing.push('interior');
  if (!validPapers.includes(payload.paper)) missing.push('paper');
  if (!Number.isFinite(Number(payload.pageCount)) || Number(payload.pageCount) <= 0) missing.push('pageCount');

  if (missing.length === 0) return true;

  noteSkipped(ctx, 'setup-dependent-checks', missing, createIssue({
    id: 'setup-metadata-missing',
    category: 'info',
    severity: 'info',
    status: 'skipped',
    issueType: 'metadata-skipped',
    scope: 'setup',
    title: 'Setup-dependent checks need complete book setup metadata',
    whyMatters: 'KDP print checks depend on book type, trim size, bleed, interior, paper, and page count.',
    where: 'Book setup.',
    howToFix: 'Provide the missing setup fields, then run the print preflight check again.',
    pageRefs: [],
    fixability: 'info-only',
    confidence: 'low',
    source: 'missing-metadata',
    evidence: {
      actual: missing.reduce((acc, field) => ({ ...acc, [field]: payload[field] }), {}),
      expected: { requiredFields: ['bookType', 'confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'confirmedBleed', 'interior', 'paper', 'pageCount'] },
      rule: 'Required setup metadata must be present before setup-dependent KDP checks can run.',
      payloadFieldsUsed: missing,
    },
  }));
  return false;
}

function matrixLookup(payload) {
  const bookType = payload.bookType;
  const interior = payload.interior || 'black-white';
  const paper = payload.paper || 'white';
  const trimKey = payload.trimKey;
  const trimWidthIn = asNumber(payload.confirmedTrimWidthIn);
  const trimHeightIn = asNumber(payload.confirmedTrimHeightIn);

  let matches = KDP_PRINT_MATRIX.filter(row =>
    row.bookType === bookType &&
    row.interior === interior &&
    row.paper === paper &&
    (row.trimKey === trimKey ||
      (Math.abs(row.trimWidthIn - trimWidthIn) <= TOLERANCE_IN &&
        Math.abs(row.trimHeightIn - trimHeightIn) <= TOLERANCE_IN))
  );

  if (matches.length === 0 && trimKey) {
    matches = KDP_PRINT_MATRIX.filter(row =>
      row.bookType === bookType &&
      row.interior === interior &&
      row.paper === paper &&
      row.trimKey === trimKey
    );
  }

  return matches[0] || null;
}

// Official KDP source: Print Options trim/page-count compatibility table.
function checkCompatibility(payload, ctx) {
  notePerformed(ctx, 'trim-interior-paper-page-count');
  const row = matrixLookup(payload);
  const pageCount = asNumber(payload.pageCount);
  const actual = {
    bookType: payload.bookType,
    trimKey: payload.trimKey,
    trimWidthIn: payload.confirmedTrimWidthIn,
    trimHeightIn: payload.confirmedTrimHeightIn,
    interior: payload.interior,
    paper: payload.paper,
    pageCount,
  };

  if (!row) {
    ctx.issues.push(createIssue({
      id: 'unsupported-combination',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: 'This print setup is not in KDP’s official print options table',
      whyMatters: 'KDP page-count limits depend on book type, trim size, ink, and paper. This combination was not found in the official KDP print matrix used by this checker.',
      where: 'Book setup.',
      howToFix: 'Choose a trim, interior, and paper combination listed in KDP Print Options, or verify it manually in KDP before relying on this checker.',
      fixability: 'manual-review',
      source: 'official-kdp',
      evidence: {
        actual,
        expected: { matrix: 'A matching official KDP print option row' },
        rule: 'Print options must match an available KDP trim, ink, paper, and book-format combination.',
        payloadFieldsUsed: ['bookType', 'trimKey', 'confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'interior', 'paper', 'pageCount'],
      },
    }));
    return null;
  }

  if (pageCount < row.minPages || pageCount > row.maxPages) {
    const low = pageCount < row.minPages;
    ctx.issues.push(createIssue({
      id: low ? 'page-count-low' : 'page-count-high',
      category: 'must-fix',
      issueType: low ? 'page-count-low' : 'page-count-high',
      scope: 'setup',
      title: low ? 'Not enough pages for this KDP print setup' : 'Too many pages for this KDP print setup',
      whyMatters: 'KDP minimum and maximum page counts vary by format, trim size, ink, and paper type.',
      where: `Book has ${pageCount} pages; official range is ${row.minPages}-${row.maxPages}.`,
      howToFix: low ? 'Add pages or choose a print setup with a lower minimum page count.' : 'Reduce the page count, split the book into volumes, or choose a print setup with a higher maximum page count.',
      fixability: 'manual-review',
      source: 'official-kdp',
      evidence: {
        actual,
        expected: row,
        rule: 'KDP Print Options page-count range for the selected book type, trim, ink, and paper.',
        payloadFieldsUsed: ['bookType', 'trimKey', 'confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'interior', 'paper', 'pageCount'],
      },
    }));
  }

  return row;
}

// Official KDP source: Expanded Distribution eligibility chart.
function checkExpandedDistribution(payload, row, ctx) {
  if (!payload.expandedDistributionEnabled) return;
  notePerformed(ctx, 'expanded-distribution');

  if (!OFFICIAL_EXPANDED_DISTRIBUTION_MATRIX_IMPLEMENTED) {
    noteSkipped(ctx, 'expanded-distribution', ['expandedDistributionEnabled'], createIssue({
      id: 'expanded-distribution-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'setup',
      title: 'Expanded Distribution validation requires official eligibility matrix',
      whyMatters: 'Expanded Distribution eligibility depends on trim, ink, paper, and book format.',
      where: 'Expanded Distribution setup.',
      howToFix: 'Verify eligibility in KDP or update the checker with the official eligibility matrix.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: { expandedDistributionEnabled: true },
        expected: { officialEligibilityMatrix: true },
        rule: 'Do not guess Expanded Distribution support.',
        payloadFieldsUsed: ['expandedDistributionEnabled'],
      },
    }));
    return;
  }

  if (payload.bookType === 'hardcover') {
    ctx.issues.push(createIssue({
      id: 'expanded-distribution-hardcover-unsupported',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: 'Hardcover is not eligible for Expanded Distribution',
      whyMatters: 'KDP says hardcover books are not eligible for Expanded Distribution.',
      where: 'Expanded Distribution setup.',
      howToFix: 'Disable Expanded Distribution for this hardcover edition.',
      source: 'official-kdp',
      evidence: {
        actual: { bookType: payload.bookType, expandedDistributionEnabled: true },
        expected: { bookType: 'paperback' },
        rule: 'Hardcover books are not eligible for Expanded Distribution.',
        payloadFieldsUsed: ['bookType', 'expandedDistributionEnabled'],
      },
    }));
    return;
  }

  if (!row) {
    noteSkipped(ctx, 'expanded-distribution-matrix', ['trimKey', 'interior', 'paper'], createIssue({
      id: 'expanded-distribution-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'setup',
      title: 'Expanded Distribution validation needs a supported print matrix row',
      whyMatters: 'Expanded Distribution eligibility depends on trim, ink, and paper.',
      where: 'Expanded Distribution setup.',
      howToFix: 'Verify the selected trim, ink, and paper in KDP’s Expanded Distribution chart.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: { trimKey: payload.trimKey, interior: payload.interior, paper: payload.paper },
        expected: { matrixRow: true },
        rule: 'Expanded Distribution validation requires an official eligibility row.',
        payloadFieldsUsed: ['expandedDistributionEnabled', 'trimKey', 'interior', 'paper'],
      },
    }));
    return;
  }

  if (!row.expandedDistributionSupported) {
    ctx.issues.push(createIssue({
      id: 'expanded-distribution-unsupported',
      category: 'must-fix',
      issueType: 'unsupported-combination',
      scope: 'setup',
      title: 'This setup is not eligible for Expanded Distribution',
      whyMatters: 'KDP Expanded Distribution eligibility depends on trim size, ink, and paper type.',
      where: 'Expanded Distribution setup.',
      howToFix: 'Disable Expanded Distribution or choose an eligible paperback trim, ink, and paper combination.',
      source: 'official-kdp',
      evidence: {
        actual: { trimKey: row.trimKey, interior: row.interior, paper: row.paper, expandedDistributionEnabled: true },
        expected: { expandedDistributionSupported: true },
        rule: 'KDP Expanded Distribution eligibility chart.',
        payloadFieldsUsed: ['expandedDistributionEnabled', 'trimKey', 'interior', 'paper'],
      },
    }));
  }
}

// Official KDP source: Paperback Submission Guidelines and Fix Formatting Issues.
function checkManuscriptSize(payload, ctx) {
  const entries = getPageEntries(payload);
  const hasBleed = payload.confirmedBleed === 'bleed';
  const trimWidthIn = asNumber(payload.confirmedTrimWidthIn);
  const trimHeightIn = asNumber(payload.confirmedTrimHeightIn);

  if (!trimWidthIn || !trimHeightIn || entries.length === 0) {
    noteSkipped(ctx, 'manuscript-page-size', ['confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'pageBoxes/pageWidths/widthIn'], createIssue({
      id: 'manuscript-size-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'page',
      title: 'Manuscript size check needs page size metadata',
      whyMatters: 'KDP page-size checks compare the PDF page box to the selected trim and bleed setup.',
      where: 'Manuscript pages.',
      howToFix: 'Run a parser that extracts PDF page boxes, then check again.',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: { trimWidthIn, trimHeightIn, pageBoxes: entries.length },
        expected: { pageSizeMetadata: true },
        rule: 'Manuscript page size must match trim size, plus bleed when selected.',
        payloadFieldsUsed: ['confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'pageBoxes', 'pageWidths', 'pageHeights', 'widthIn', 'heightIn'],
      },
    }));
    return;
  }

  notePerformed(ctx, 'manuscript-page-size');
  const expected = getExpectedManuscriptSize(trimWidthIn, trimHeightIn, hasBleed);
  const alternate = getAlternateManuscriptSize(trimWidthIn, trimHeightIn, hasBleed);
  const mismatches = [];
  const bleedMissing = [];
  const noBleedButBleedSized = [];

  for (const entry of entries) {
    const actual = { widthIn: entry.printBox.widthIn, heightIn: entry.printBox.heightIn };
    if (!sizeMatches(actual, expected, TOLERANCE_WARN_IN)) {
      mismatches.push({ page: entry.pageNumber, actual });
      if (hasBleed && sizeMatches(actual, alternate, TOLERANCE_WARN_IN)) bleedMissing.push(entry.pageNumber);
      if (!hasBleed && sizeMatches(actual, alternate, TOLERANCE_WARN_IN)) noBleedButBleedSized.push(entry.pageNumber);
    }
  }

  annotatePageBoxes(payload, expected);

  if (mismatches.length === 0) return;

  if (hasBleed && bleedMissing.length === entries.length) {
    ctx.issues.push(createIssue({
      id: 'bleed-missing',
      category: 'must-fix',
      issueType: 'bleed-missing',
      scope: 'page',
      title: 'Bleed is selected, but the manuscript is trim-sized',
      whyMatters: 'KDP says a bleed manuscript must be wider and taller than the trim size. A trim-sized file does not include the bleed area.',
      where: 'All checked manuscript pages.',
      howToFix: `Re-export the manuscript at ${formatSize(expected)} for this trim and bleed setup.`,
      pageRefs: [],
      fixability: 'auto-fix',
      source: 'official-kdp',
      fixActions: [FIX_ACTIONS.addBleedCanvas],
      evidence: {
        actual: mismatches[0].actual,
        expected,
        rule: 'Bleed manuscript size = trim width + 0.125 in, trim height + 0.25 in.',
        payloadFieldsUsed: ['confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'confirmedBleed', 'pageBoxes', 'pageWidths', 'pageHeights', 'widthIn', 'heightIn'],
        notes: 'The detected manuscript page size matches the selected trim size instead of the KDP bleed size.',
      },
    }));
    return;
  }

  if (!hasBleed && noBleedButBleedSized.length === entries.length) {
    ctx.issues.push(createIssue({
      id: 'no-bleed-file-appears-bleed-sized',
      category: 'should-fix',
      severity: 'warning',
      status: 'warning',
      issueType: 'size-mismatch',
      scope: 'setup',
      title: 'No-bleed is selected, but the manuscript appears bleed-sized',
      whyMatters: 'The selected KDP setup says no bleed, while the PDF page size matches KDP’s bleed dimensions. This is a setup mismatch to review before upload.',
      where: 'All checked manuscript pages.',
      howToFix: 'Either switch the KDP bleed setting to Bleed or re-export the manuscript at the trim size with no bleed.',
      pageRefs: [],
      fixability: 'manual-review',
      confidence: 'high',
      source: 'official-kdp',
      evidence: {
        actual: mismatches[0].actual,
        expected,
        rule: 'No-bleed manuscript page size = trim width x trim height.',
        payloadFieldsUsed: ['confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'confirmedBleed', 'pageBoxes', 'pageWidths', 'pageHeights', 'widthIn', 'heightIn'],
      },
    }));
    return;
  }

  const allPagesDiffer = mismatches.length === entries.length;
  ctx.issues.push(createIssue({
    id: allPagesDiffer ? 'selected-config-size-mismatch' : 'inconsistent-pages',
    category: allPagesDiffer ? 'must-fix' : 'must-fix',
    issueType: allPagesDiffer ? 'size-mismatch' : 'inconsistent-pages',
    scope: 'page',
    title: allPagesDiffer ? 'Manuscript page size does not match selected setup' : 'Some manuscript pages have the wrong size',
    whyMatters: 'KDP checks manuscript page size against the selected trim and bleed setup. Incorrect or inconsistent page boxes can cause preview errors.',
    where: allPagesDiffer ? 'All checked manuscript pages.' : formatPageList(mismatches.map(item => item.page)),
    howToFix: `Re-export the manuscript so every page is ${formatSize(expected)}.`,
    pageRefs: allPagesDiffer ? [] : mismatches.map(item => item.page).slice(0, 20),
    fixability: 'auto-fix',
    source: 'official-kdp',
    fixActions: [FIX_ACTIONS.resizeManuscriptPageSize],
    evidence: {
      actual: allPagesDiffer ? mismatches[0].actual : mismatches.slice(0, 10),
      expected,
      rule: hasBleed
        ? 'Bleed manuscript size = trim width + 0.125 in, trim height + 0.25 in.'
        : 'No-bleed manuscript page size = trim width x trim height.',
      payloadFieldsUsed: ['confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'confirmedBleed', 'pageBoxes', 'pageWidths', 'pageHeights', 'widthIn', 'heightIn'],
    },
  }));
}

function annotatePageBoxes(payload, expected) {
  if (!Array.isArray(payload.pageBoxes)) return;
  for (const box of payload.pageBoxes) {
    const actual = box.printBox || {};
    box.expectedWidthIn = expected.widthIn;
    box.expectedHeightIn = expected.heightIn;
    box.diffWidthIn = Number.isFinite(actual.widthIn) ? Math.abs(actual.widthIn - expected.widthIn) : null;
    box.diffHeightIn = Number.isFinite(actual.heightIn) ? Math.abs(actual.heightIn - expected.heightIn) : null;
    box.validationResult = box.diffWidthIn !== null && box.diffHeightIn !== null && Math.max(box.diffWidthIn, box.diffHeightIn) > TOLERANCE_WARN_IN
      ? 'must-fix'
      : 'ok';
    box.reasonCode = box.validationResult === 'ok' ? 'PAGE_SIZE_MATCHES_SELECTED_CONFIG' : 'PAGE_SIZE_DIFFERS_FROM_SELECTED_CONFIG';
    box.validationSource = 'setup-level';
  }
}

function getMarginRule(pageCount) {
  return KDP_MARGIN_RULES.find(rule => pageCount >= rule.minPages && pageCount <= rule.maxPages) || null;
}

function getPageSizeForPage(payload, pageNumber) {
  const entry = getPageEntries(payload).find(item => item.pageNumber === pageNumber);
  if (entry) return entry.printBox;
  return { widthIn: payload.widthIn, heightIn: payload.heightIn };
}

// Official KDP source: Set Trim Size, Bleed, and Margins.
function checkMargins(payload, ctx) {
  if (!payload.contentBoundsByPage || typeof payload.contentBoundsByPage !== 'object') {
    noteSkipped(ctx, 'margins-and-gutter', ['contentBoundsByPage'], createIssue({
      id: 'margin-check-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'page',
      title: 'Margin check requires extracted content bounding boxes',
      whyMatters: 'KDP margin checks need content positions, not just page size.',
      where: 'Manuscript pages.',
      howToFix: 'Run a parser that extracts page content bounds, then check margins again.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: { contentBoundsByPage: payload.contentBoundsByPage },
        expected: { contentBoundsByPage: 'Record<number, Box>' },
        rule: 'Margin check requires content bounding boxes.',
        payloadFieldsUsed: ['contentBoundsByPage'],
      },
    }));
    return;
  }

  const marginRule = getMarginRule(asNumber(payload.pageCount));
  if (!marginRule) {
    noteSkipped(ctx, 'margins-and-gutter', ['pageCount'], null);
    return;
  }

  notePerformed(ctx, 'margins-and-gutter');
  const hasBleed = payload.confirmedBleed === 'bleed';
  const outsideMin = hasBleed ? marginRule.outsideBleedIn : marginRule.outsideNoBleedIn;
  const problemPages = [];

  for (const key of Object.keys(payload.contentBoundsByPage)) {
    const pageNumber = Number(key);
    const bounds = payload.contentBoundsByPage[key];
    const page = getPageSizeForPage(payload, pageNumber);
    if (!bounds || !hasSize(page)) continue;
    const left = bounds.xMinIn;
    const right = page.widthIn - bounds.xMaxIn;
    const bottom = bounds.yMinIn;
    const top = page.heightIn - bounds.yMaxIn;
    const odd = pageNumber % 2 === 1;
    const inside = odd ? left : right;
    const outside = odd ? right : left;
    const failures = [];
    if (inside < marginRule.insideIn - TOLERANCE_IN) failures.push(['inside/gutter', inside, marginRule.insideIn]);
    if (outside < outsideMin - TOLERANCE_IN) failures.push(['outside', outside, outsideMin]);
    if (top < outsideMin - TOLERANCE_IN) failures.push(['top', top, outsideMin]);
    if (bottom < outsideMin - TOLERANCE_IN) failures.push(['bottom', bottom, outsideMin]);
    if (failures.length > 0) problemPages.push({ pageNumber, margins: { left, right, top, bottom, inside, outside }, failures });
  }

  if (problemPages.length === 0) return;

  ctx.issues.push(createIssue({
    id: 'margin-gutter-risk',
    category: 'should-fix',
    issueType: 'margin-gutter-risk',
    scope: 'page',
    title: 'Some content appears outside KDP margin or gutter minimums',
    whyMatters: 'KDP margins protect text and important content from being trimmed or hidden in the binding gutter.',
    where: formatPageList(problemPages.map(item => item.pageNumber)),
    howToFix: 'Move text and important content inside the required inside, outside, top, and bottom margins. Full-bleed background art can extend only when Bleed is selected.',
    pageRefs: problemPages.map(item => item.pageNumber).slice(0, 20),
    fixability: 'manual-review',
    confidence: 'medium',
    source: 'official-kdp',
    evidence: {
      actual: problemPages.slice(0, 10),
      expected: { insideIn: marginRule.insideIn, outsideIn: outsideMin },
      rule: 'Inside/gutter margin depends on page count; top, bottom, and outside margins must meet KDP minimums.',
      payloadFieldsUsed: ['contentBoundsByPage', 'pageCount', 'confirmedBleed', 'pageBoxes', 'widthIn', 'heightIn'],
      notes: 'The checker cannot distinguish decorative bleed backgrounds from text or important content.',
    },
  }));
}

// Official KDP source: Create a Hardcover Cover and Paperback Submission Guidelines.
function checkCover(payload, ctx) {
  const hasCover = payload.hasCover === true || isPresent(payload.coverWidthIn) || isPresent(payload.coverHeightIn);
  if (!hasCover) {
    noteSkipped(ctx, 'cover-size', ['hasCover', 'coverWidthIn', 'coverHeightIn'], createIssue({
      id: 'cover-check-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'cover',
      title: 'Cover validation requires cover PDF metadata',
      whyMatters: 'Cover checks need the cover page count and cover dimensions.',
      where: 'Cover PDF.',
      howToFix: 'Upload or parse the cover PDF to check cover size, artifacts, spine text, and barcode metadata.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: { hasCover: payload.hasCover },
        expected: { hasCover: true },
        rule: 'Cover PDF checks require cover metadata.',
        payloadFieldsUsed: ['hasCover', 'coverWidthIn', 'coverHeightIn'],
      },
    }));
    return;
  }

  notePerformed(ctx, 'cover-page-count');
  if (asNumber(payload.coverPageCount, 1) > 1) {
    ctx.issues.push(createIssue({
      id: 'cover-page-count',
      category: 'must-fix',
      issueType: 'cover-page-count',
      scope: 'cover',
      title: 'Cover PDF has more than one page',
      whyMatters: 'KDP print covers must be a single PDF page containing back cover, spine, and front cover as one image.',
      where: `Cover PDF has ${payload.coverPageCount} pages.`,
      howToFix: 'Export one full-spread cover PDF page with back cover, spine, and front cover.',
      source: 'official-kdp',
      evidence: {
        actual: { coverPageCount: payload.coverPageCount },
        expected: { coverPageCount: 1 },
        rule: 'Cover must be a single PDF page.',
        payloadFieldsUsed: ['coverPageCount'],
      },
    }));
  }

  if (!isPresent(payload.coverWidthIn) || !isPresent(payload.coverHeightIn)) {
    noteSkipped(ctx, 'cover-size', ['coverWidthIn', 'coverHeightIn'], null);
  } else if (payload.bookType === 'hardcover') {
    checkHardcoverCoverSize(payload, ctx);
  } else if (payload.bookType === 'paperback') {
    checkPaperbackCoverSize(payload, ctx);
  }

  checkCoverArtifacts(payload, ctx);
}

function getPaperbackSpineWidth(payload) {
  const interior = payload.interior || 'black-white';
  const paper = interior === 'black-white' ? (payload.paper || 'white') : interior;
  const factor = PAPERBACK_SPINE_FACTORS_IN[paper] || PAPERBACK_SPINE_FACTORS_IN.white;
  return round3(asNumber(payload.pageCount) * factor);
}

function getPaperbackCoverExpected(payload) {
  if (isPresent(payload.coverExpectedWidthIn) && isPresent(payload.coverExpectedHeightIn)) {
    return {
      widthIn: asNumber(payload.coverExpectedWidthIn),
      heightIn: asNumber(payload.coverExpectedHeightIn),
      source: 'official-kdp',
      confidence: 'high',
      rule: 'KDP Cover Calculator/template dimensions.',
    };
  }
  const officialSpineProvided = isPresent(payload.officialSpineWidthIn);
  const estimatedSpineProvided = isPresent(payload.estimatedSpineWidthIn) || isPresent(payload.spineWidthIn);
  const spineWidthIn = officialSpineProvided
    ? asNumber(payload.officialSpineWidthIn)
    : (isPresent(payload.estimatedSpineWidthIn)
      ? asNumber(payload.estimatedSpineWidthIn)
      : (isPresent(payload.spineWidthIn) ? asNumber(payload.spineWidthIn) : getPaperbackSpineWidth(payload)));
  return {
    widthIn: asNumber(payload.confirmedTrimWidthIn) * 2 + spineWidthIn + 0.25,
    heightIn: asNumber(payload.confirmedTrimHeightIn) + 0.25,
    spineWidthIn,
    source: officialSpineProvided ? 'derived-from-kdp-formula' : 'best-effort',
    confidence: officialSpineProvided ? 'high' : (estimatedSpineProvided ? 'medium' : 'low'),
    rule: 'Paperback cover width = bleed + back trim width + spine width + front trim width + bleed; cover height = bleed + trim height + bleed.',
  };
}

// Official KDP source: Paperback Submission Guidelines cover-size formula.
function checkPaperbackCoverSize(payload, ctx) {
  notePerformed(ctx, 'paperback-cover-size');
  const actual = { widthIn: asNumber(payload.coverWidthIn), heightIn: asNumber(payload.coverHeightIn) };
  const expected = getPaperbackCoverExpected(payload);
  if (!hasSize(actual) || !hasSize(expected)) return;
  if (sizeMatches(actual, expected, TOLERANCE_WARN_IN)) return;

  ctx.issues.push(createIssue({
    id: 'cover-size-mismatch',
    category: 'must-fix',
    issueType: 'cover-size-mismatch',
    scope: 'cover',
    title: 'Paperback cover size does not match expected full-spread dimensions',
    whyMatters: 'KDP paperback covers must include back cover, spine, front cover, and 0.125 inch bleed on both outside edges.',
    where: `Cover is ${formatSize(actual)}; expected ${formatSize(expected)}.`,
    howToFix: 'Re-export the paperback cover using KDP’s cover calculator/template dimensions.',
    fixability: 'manual-review',
    confidence: expected.confidence,
    source: expected.source,
    evidence: {
      actual,
      expected,
      rule: expected.rule,
      payloadFieldsUsed: ['coverWidthIn', 'coverHeightIn', 'coverExpectedWidthIn', 'coverExpectedHeightIn', 'confirmedTrimWidthIn', 'confirmedTrimHeightIn', 'pageCount', 'paper', 'interior'],
    },
  }));
}

// Official KDP source: Create a Hardcover Cover.
function checkHardcoverCoverSize(payload, ctx) {
  if (!isPresent(payload.coverExpectedWidthIn) || !isPresent(payload.coverExpectedHeightIn)) {
    noteSkipped(ctx, 'hardcover-cover-size', ['coverExpectedWidthIn', 'coverExpectedHeightIn'], createIssue({
      id: 'hardcover-cover-size-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'cover',
      title: 'Hardcover cover size requires KDP Cover Calculator/template dimensions',
      whyMatters: 'KDP says hardcover covers need wrap and should be sized using the cover calculator/template. This checker does not reuse the paperback formula for hardcover.',
      where: 'Hardcover cover PDF.',
      howToFix: 'Generate the exact hardcover template in KDP Cover Calculator, then provide those expected dimensions for validation.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: { coverWidthIn: payload.coverWidthIn, coverHeightIn: payload.coverHeightIn },
        expected: { coverExpectedWidthIn: 'from KDP Cover Calculator', coverExpectedHeightIn: 'from KDP Cover Calculator' },
        rule: 'Hardcover cover needs wrap and KDP Cover Calculator/template dimensions.',
        payloadFieldsUsed: ['bookType', 'coverWidthIn', 'coverHeightIn', 'coverExpectedWidthIn', 'coverExpectedHeightIn'],
      },
    }));
    return;
  }

  notePerformed(ctx, 'hardcover-cover-size');
  const actual = { widthIn: asNumber(payload.coverWidthIn), heightIn: asNumber(payload.coverHeightIn) };
  const expected = { widthIn: asNumber(payload.coverExpectedWidthIn), heightIn: asNumber(payload.coverExpectedHeightIn) };
  if (sizeMatches(actual, expected, TOLERANCE_WARN_IN)) return;
  ctx.issues.push(createIssue({
    id: 'cover-size-mismatch',
    category: 'must-fix',
    issueType: 'cover-size-mismatch',
    scope: 'cover',
    title: 'Hardcover cover size does not match provided KDP template dimensions',
    whyMatters: 'KDP hardcover covers must be sized with wrap using calculator/template dimensions.',
    where: `Cover is ${formatSize(actual)}; expected ${formatSize(expected)}.`,
    howToFix: 'Re-export the hardcover cover at the exact KDP Cover Calculator/template dimensions.',
    source: 'official-kdp',
    evidence: {
      actual,
      expected,
      rule: 'Hardcover cover size must follow KDP Cover Calculator/template dimensions.',
      payloadFieldsUsed: ['coverWidthIn', 'coverHeightIn', 'coverExpectedWidthIn', 'coverExpectedHeightIn'],
    },
  }));
}

// Official KDP source: Paperback Submission Guidelines and Fix Formatting Issues.
function checkCoverArtifacts(payload, ctx) {
  const artifacts = [
    ['coverHasCropMarks', 'cover-crop-marks', 'crop marks'],
    ['coverHasTrimMarks', 'cover-trim-marks', 'trim marks'],
    ['coverHasPrinterMarks', 'cover-printer-marks', 'printer marks'],
    ['coverHasColorBars', 'cover-color-bars', 'color bars'],
    ['coverHasTemplateText', 'cover-template-text', 'template text'],
    ['coverHasGuideText', 'cover-guide-text', 'guide text'],
    ['coverHasSoftwareReferences', 'cover-software-references', 'PDF creation logos, watermarks, or software references'],
  ];

  for (const [field, id, label] of artifacts) {
    if (payload[field] !== true) continue;
    notePerformed(ctx, field);
    ctx.issues.push(createIssue({
      id,
      category: field === 'coverHasSoftwareReferences' ? 'should-fix' : 'must-fix',
      issueType: 'cover-production-artifact',
      scope: 'cover',
      title: `Cover includes ${label}`,
      whyMatters: 'KDP files should not include production marks, template content, guide elements, color bars, placeholder text, or PDF creation marks.',
      where: 'Cover PDF.',
      howToFix: 'Hide template and guide layers, remove production marks, then export a clean final cover PDF.',
      fixability: 'manual-review',
      source: 'official-kdp',
      evidence: {
        actual: { [field]: true },
        expected: { [field]: false },
        rule: 'Submitted files should not contain crop marks, trim marks, placeholder/template content, or production artifacts.',
        payloadFieldsUsed: [field],
      },
    }));
  }
}

// Official KDP source: Paperback Submission Guidelines spine text.
function checkSpineText(payload, ctx) {
  const pageCount = asNumber(payload.pageCount);
  if (payload.hasSpineText === true && pageCount <= 79) {
    notePerformed(ctx, 'spine-text-page-count');
    ctx.issues.push(createIssue({
      id: 'spine-text-too-thin',
      category: 'must-fix',
      issueType: 'spine-text-risk',
      scope: 'spine',
      title: 'Book is too thin for printed spine text',
      whyMatters: 'KDP only prints spine text on books with more than 79 pages.',
      where: `Book has ${pageCount} pages and spine text was detected.`,
      howToFix: 'Remove spine text from the cover or increase the page count above 79 pages.',
      source: 'official-kdp',
      evidence: {
        actual: { pageCount, hasSpineText: payload.hasSpineText },
        expected: { minPagesForSpineText: 80 },
        rule: 'KDP only prints spine text on books with more than 79 pages.',
        payloadFieldsUsed: ['pageCount', 'hasSpineText'],
      },
    }));
  } else if ((payload.hasSpineText === null || payload.hasSpineText === undefined) && pageCount <= 79) {
    noteSkipped(ctx, 'spine-text-presence', ['hasSpineText'], null);
    ctx.issues.push(createIssue({
      id: 'spine-text-manual-review',
      category: 'should-fix',
      severity: 'warning',
      status: 'warning',
      issueType: 'spine-text-risk',
      scope: 'spine',
      title: 'Verify this thin book has no spine text',
      whyMatters: 'KDP only prints spine text on books with more than 79 pages, but this checker could not detect whether spine text exists.',
      where: `Book has ${pageCount} pages.`,
      howToFix: 'Open the cover and confirm the spine area is blank.',
      fixability: 'manual-review',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: { pageCount, hasSpineText: payload.hasSpineText },
        expected: { hasSpineText: false },
        rule: 'Books with 79 or fewer pages should not have spine text.',
        payloadFieldsUsed: ['pageCount', 'hasSpineText'],
      },
    }));
  }

  if (payload.hasSpineText === true && payload.spineTextBounds && payload.spineBounds) {
    notePerformed(ctx, 'spine-text-clearance');
    const leftClearance = payload.spineTextBounds.xMinIn - payload.spineBounds.xMinIn;
    const rightClearance = payload.spineBounds.xMaxIn - payload.spineTextBounds.xMaxIn;
    if (leftClearance < SPINE_TEXT_CLEARANCE_IN - TOLERANCE_IN || rightClearance < SPINE_TEXT_CLEARANCE_IN - TOLERANCE_IN) {
      ctx.issues.push(createIssue({
        id: 'spine-text-clearance',
        category: 'must-fix',
        issueType: 'spine-text-risk',
        scope: 'spine',
        title: 'Spine text is too close to the spine edge',
        whyMatters: 'KDP requires at least 0.0625 inch between spine text and the edge of the spine and advises allowing variance around fold lines.',
        where: 'Spine text bounds.',
        howToFix: 'Resize or move spine text so it stays at least 0.0625 inch from both spine edges.',
        source: 'official-kdp',
        evidence: {
          actual: { leftClearance, rightClearance, spineTextBounds: payload.spineTextBounds, spineBounds: payload.spineBounds },
          expected: { minClearanceIn: SPINE_TEXT_CLEARANCE_IN },
          rule: 'Spine text needs at least 0.0625 in space from the edge of the spine.',
          payloadFieldsUsed: ['hasSpineText', 'spineTextBounds', 'spineBounds'],
        },
      }));
    }
  } else if (payload.hasSpineText === true && payload.spineTextBounds && !payload.spineBounds) {
    noteSkipped(ctx, 'spine-text-clearance', ['spineBounds'], null);
  }
}

// Official KDP source: Barcodes.
function checkBarcode(payload, ctx) {
  if (payload.coverHasBarcodeConflict === true) {
    notePerformed(ctx, 'barcode-conflict');
    ctx.issues.push(createIssue({
      id: 'cover-barcode-conflict',
      category: 'must-fix',
      issueType: 'cover-barcode-conflict',
      scope: 'cover',
      title: 'Cover has content in the barcode area',
      whyMatters: 'KDP says covers with images or text in the barcode location may be rejected when KDP needs to place a barcode.',
      where: 'Back cover barcode area.',
      howToFix: 'Remove text or artwork from the barcode location, or provide a barcode that meets KDP requirements.',
      source: 'official-kdp',
      evidence: {
        actual: { coverHasBarcodeConflict: true },
        expected: { coverHasBarcodeConflict: false },
        rule: 'Covers with images or text in the barcode location may be rejected.',
        payloadFieldsUsed: ['coverHasBarcodeConflict'],
      },
    }));
  }

  if (payload.coverHasUserBarcode !== true) {
    if (payload.coverHasBarcodeConflict !== true) {
      noteSkipped(ctx, 'barcode-validation', ['coverHasUserBarcode', 'coverBarcodeBounds', 'coverBarcodeResolutionDpi'], createIssue({
        id: 'barcode-validation-skipped',
        category: 'info',
        severity: 'info',
        status: 'skipped',
        issueType: 'metadata-skipped',
        scope: 'cover',
        title: 'Barcode validation requires barcode detection metadata',
        whyMatters: 'KDP can add a barcode when your cover does not include one, but this checker needs barcode metadata to validate a user-provided barcode or barcode-area conflicts.',
        where: 'Back cover barcode area.',
        howToFix: 'Use KDP Previewer or provide barcode detection metadata to check barcode size, resolution, placement, and readability.',
        fixability: 'info-only',
        confidence: 'low',
        source: 'missing-metadata',
        evidence: {
          actual: { coverHasUserBarcode: payload.coverHasUserBarcode },
          expected: { barcodeDetectionMetadata: true },
          rule: 'Barcode validation requires detected barcode metadata.',
          payloadFieldsUsed: ['coverHasUserBarcode', 'coverBarcodeBounds', 'coverBarcodeResolutionDpi', 'coverBarcodeIsReadable', 'coverBarcodeMeetsKdpRequirements'],
        },
      }));
    }
    return;
  }

  notePerformed(ctx, 'barcode-validation');

  if (payload.coverBarcodeMeetsKdpRequirements === false) {
    ctx.issues.push(createIssue({
      id: 'barcode-requirements',
      category: 'must-fix',
      issueType: 'cover-barcode-conflict',
      scope: 'cover',
      title: 'User-provided barcode failed KDP requirement metadata',
      whyMatters: 'KDP says user-provided barcodes must meet formatting requirements and be readable.',
      where: 'Back cover barcode.',
      howToFix: 'Replace the barcode with a sharp, black, readable barcode on a white background, or remove it and let KDP place one.',
      source: 'official-kdp',
      evidence: {
        actual: { coverBarcodeMeetsKdpRequirements: false },
        expected: { coverBarcodeMeetsKdpRequirements: true },
        rule: 'User-provided barcode must meet KDP formatting requirements.',
        payloadFieldsUsed: ['coverBarcodeMeetsKdpRequirements'],
      },
    }));
  }

  if (isPresent(payload.coverBarcodeResolutionDpi) && payload.coverBarcodeResolutionDpi < BARCODE_MIN_DPI) {
    ctx.issues.push(createIssue({
      id: 'barcode-resolution-low',
      category: 'must-fix',
      issueType: 'cover-barcode-conflict',
      scope: 'cover',
      title: 'Raster barcode resolution is below 300 PPI',
      whyMatters: 'KDP says rasterized barcode images should be 300 PPI.',
      where: 'Back cover barcode.',
      howToFix: 'Replace the barcode with a vector barcode or a raster barcode at 300 PPI or higher.',
      source: 'official-kdp',
      evidence: {
        actual: { coverBarcodeResolutionDpi: payload.coverBarcodeResolutionDpi },
        expected: { minDpi: BARCODE_MIN_DPI },
        rule: 'Rasterized barcode images should be 300 PPI.',
        payloadFieldsUsed: ['coverBarcodeResolutionDpi'],
      },
    }));
  }

  if (payload.coverBarcodeBounds) {
    const width = payload.coverBarcodeBounds.xMaxIn - payload.coverBarcodeBounds.xMinIn;
    const height = payload.coverBarcodeBounds.yMaxIn - payload.coverBarcodeBounds.yMinIn;
    if (width < BARCODE_MIN_WIDTH_IN - TOLERANCE_IN || height < BARCODE_MIN_HEIGHT_IN - TOLERANCE_IN) {
      ctx.issues.push(createIssue({
        id: 'barcode-size-small',
        category: 'must-fix',
        issueType: 'cover-barcode-conflict',
        scope: 'cover',
        title: 'User-provided barcode is smaller than KDP minimum size',
        whyMatters: 'KDP lists a minimum barcode size of 1.4 x 0.8 inches.',
        where: 'Back cover barcode.',
        howToFix: 'Resize the barcode to at least 1.4 x 0.8 inches. KDP suggests 2 x 1.2 inches.',
        source: 'official-kdp',
        evidence: {
          actual: { widthIn: width, heightIn: height, bounds: payload.coverBarcodeBounds },
          expected: { minWidthIn: BARCODE_MIN_WIDTH_IN, minHeightIn: BARCODE_MIN_HEIGHT_IN, suggestedWidthIn: BARCODE_RECOMMENDED_WIDTH_IN, suggestedHeightIn: BARCODE_RECOMMENDED_HEIGHT_IN },
          rule: 'Suggested barcode size is 2 x 1.2 in; minimum is 1.4 x 0.8 in.',
          payloadFieldsUsed: ['coverBarcodeBounds'],
        },
      }));
    }
    checkBarcodePlacement(payload, ctx);
  }

  if (payload.coverBarcodeIsReadable === false) {
    ctx.issues.push(createIssue({
      id: 'barcode-unreadable',
      category: 'must-fix',
      issueType: 'cover-barcode-conflict',
      scope: 'cover',
      title: 'Barcode metadata says the barcode is not readable',
      whyMatters: 'KDP says unreadable barcodes can cause validation and manufacturing delays.',
      where: 'Back cover barcode.',
      howToFix: 'Replace the barcode with a sharp, readable barcode or remove it and let KDP place one.',
      source: 'official-kdp',
      evidence: {
        actual: { coverBarcodeIsReadable: false },
        expected: { coverBarcodeIsReadable: true },
        rule: 'Barcode must be sharp, clear, right-side up, square to the cover, and readable.',
        payloadFieldsUsed: ['coverBarcodeIsReadable'],
      },
    }));
  }
}

function checkBarcodePlacement(payload, ctx) {
  if (!payload.coverBarcodeBounds || !payload.spineBounds || !isPresent(payload.coverWidthIn) || !isPresent(payload.coverHeightIn)) {
    noteSkipped(ctx, 'barcode-placement', ['coverBarcodeBounds', 'spineBounds', 'coverWidthIn', 'coverHeightIn'], null);
    return;
  }
  const b = payload.coverBarcodeBounds;
  const cover = { widthIn: asNumber(payload.coverWidthIn), heightIn: asNumber(payload.coverHeightIn) };
  const spineDistance = b.xMinIn >= payload.spineBounds.xMaxIn
    ? b.xMinIn - payload.spineBounds.xMaxIn
    : payload.spineBounds.xMinIn - b.xMaxIn;
  const trimDistance = Math.min(b.xMinIn, b.yMinIn, cover.widthIn - b.xMaxIn, cover.heightIn - b.yMaxIn);
  if (spineDistance < BARCODE_CLEARANCE_IN - TOLERANCE_IN || trimDistance < BARCODE_CLEARANCE_IN - TOLERANCE_IN) {
    ctx.issues.push(createIssue({
      id: 'barcode-placement',
      category: 'must-fix',
      issueType: 'cover-barcode-conflict',
      scope: 'cover',
      title: 'Barcode is too close to the spine or trim',
      whyMatters: 'KDP says barcodes should be positioned at least 0.25 inch from the spine and trim of the cover.',
      where: 'Back cover barcode.',
      howToFix: 'Move the barcode so it is at least 0.25 inch from the spine and all trim edges.',
      source: 'official-kdp',
      evidence: {
        actual: { spineDistanceIn: spineDistance, trimDistanceIn: trimDistance, bounds: b },
        expected: { minDistanceIn: BARCODE_CLEARANCE_IN },
        rule: 'Barcode positioned at least 0.25 in from spine and trim.',
        payloadFieldsUsed: ['coverBarcodeBounds', 'spineBounds', 'coverWidthIn', 'coverHeightIn'],
      },
    }));
  }
}

// Official KDP source: Paperback Submission Guidelines file specifications and Fix Formatting Issues.
function checkTechnical(payload, ctx) {
  const checks = [
    ['isLocked', true, 'locked-pdf', 'must-fix', 'technical', 'PDF is locked or protected', 'KDP lists locked or encrypted files as a common point of failure.', 'Export an unlocked PDF and make sure it is not encrypted.'],
    ['hasAnnotations', true, 'pdf-annotations', 'should-fix', 'technical', 'PDF contains annotations or comments', 'KDP submitted files should not contain comments or annotations.', 'Flatten or remove annotations/comments before export.', 'high', [FIX_ACTIONS.removeAnnotationsForms]],
    ['hasFormFields', true, 'pdf-form-fields', 'should-fix', 'technical', 'PDF contains form fields', 'Interactive form fields can behave unpredictably in print workflows.', 'Flatten or remove form fields before export.', 'high', [FIX_ACTIONS.removeAnnotationsForms]],
    ['hasTransparency', true, 'pdf-transparency', 'should-fix', 'technical', 'PDF contains transparency', 'KDP recommends flattening transparent objects and layers before publishing.', 'Flatten transparency in the native file, then export a new PDF.', 'high', [FIX_ACTIONS.flattenTransparencyLayers]],
    ['hasLayers', true, 'pdf-layers', 'should-fix', 'technical', 'PDF contains layers', 'KDP recommends flattening transparent objects and layers before publishing.', 'Flatten all layers before export.', 'high', [FIX_ACTIONS.flattenTransparencyLayers]],
    ['hasCropMarks', true, 'crop-marks', 'must-fix', 'technical', 'Manuscript includes crop marks', 'KDP submitted files should not contain crop marks or trim marks.', 'Export the manuscript without crop marks or printer marks.'],
    ['hasTrimMarks', true, 'trim-marks', 'must-fix', 'technical', 'Manuscript includes trim marks', 'KDP submitted files should not contain crop marks or trim marks.', 'Export the manuscript without trim marks or printer marks.'],
    ['hasPrinterMarks', true, 'printer-marks', 'must-fix', 'technical', 'Manuscript includes printer marks', 'KDP submitted files should not contain printer marks.', 'Export the manuscript without printer marks.'],
    ['hasTwoPageSpreads', true, 'two-page-spreads', 'must-fix', 'page', 'Manuscript appears to use two-page spreads', 'KDP requires single-page files rather than spreads or 2-up files.', 'Export the manuscript as single pages, not two-page spreads.'],
    ['hasMixedOrientation', true, 'mixed-orientation', 'should-fix', 'page', 'Manuscript has mixed orientation metadata', 'Mixed orientation can indicate pages were rotated or exported inconsistently.', 'Review rotated pages in KDP Previewer and re-export intentional pages consistently.', 'medium'],
  ];

  for (const [field, badValue, id, category, scope, title, whyMatters, howToFix, confidence, fixActions] of checks) {
    if (payload[field] === undefined) continue;
    notePerformed(ctx, field);
    if (payload[field] !== badValue) continue;
    ctx.issues.push(createIssue({
      id,
      category,
      issueType: id,
      scope,
      title,
      whyMatters,
      where: 'PDF metadata.',
      howToFix,
      fixability: 'manual-review',
      confidence: confidence || 'high',
      source: 'official-kdp',
      fixActions: fixActions || [],
      evidence: {
        actual: { [field]: payload[field] },
        expected: { [field]: !badValue },
        rule: title,
        payloadFieldsUsed: [field],
      },
    }));
  }

  if (payload.hasEmbeddedFonts === false || (Array.isArray(payload.unembeddedFonts) && payload.unembeddedFonts.length > 0)) {
    notePerformed(ctx, 'embedded-fonts');
    ctx.issues.push(createIssue({
      id: 'fonts-not-embedded',
      category: 'must-fix',
      issueType: 'fonts-not-embedded',
      scope: 'technical',
      title: 'Some fonts are not embedded',
      whyMatters: 'KDP says all fonts should be fully embedded in interior and cover files.',
      where: Array.isArray(payload.unembeddedFonts) && payload.unembeddedFonts.length > 0 ? `Fonts: ${payload.unembeddedFonts.join(', ')}` : 'PDF font metadata.',
      howToFix: 'Embed all fonts in the source file and export a new PDF.',
      source: 'official-kdp',
      evidence: {
        actual: { hasEmbeddedFonts: payload.hasEmbeddedFonts, unembeddedFonts: payload.unembeddedFonts },
        expected: { hasEmbeddedFonts: true, unembeddedFonts: [] },
        rule: 'All fonts should be fully embedded.',
        payloadFieldsUsed: ['hasEmbeddedFonts', 'unembeddedFonts'],
      },
    }));
  } else if (payload.hasEmbeddedFonts === undefined && payload.unembeddedFonts === undefined) {
    noteSkipped(ctx, 'embedded-fonts', ['hasEmbeddedFonts', 'unembeddedFonts'], createIssue({
      id: 'font-check-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'technical',
      title: 'Font embedding check requires font metadata',
      whyMatters: 'KDP expects fonts to be embedded, but this checker needs PDF font metadata to verify that.',
      where: 'PDF font metadata.',
      howToFix: 'Use a parser that reports embedded and unembedded fonts.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: {},
        expected: { hasEmbeddedFonts: true },
        rule: 'All fonts should be fully embedded.',
        payloadFieldsUsed: ['hasEmbeddedFonts', 'unembeddedFonts'],
      },
    }));
  }

  const optionalTechnicalFields = [
    'isLocked',
    'hasAnnotations',
    'hasFormFields',
    'hasTransparency',
    'hasLayers',
    'hasCropMarks',
    'hasTrimMarks',
    'hasPrinterMarks',
    'hasTwoPageSpreads',
    'hasMixedOrientation',
  ];
  for (const field of optionalTechnicalFields) {
    if (payload[field] === undefined) noteSkipped(ctx, field, [field], null);
  }
}

// Official KDP source: Format Images in Your Book and Paperback Submission Guidelines.
function checkImages(payload, ctx) {
  const lowPages = Array.isArray(payload.lowResolutionImagePages) ? payload.lowResolutionImagePages : [];
  const dpiByPage = payload.imageDpiByPage && typeof payload.imageDpiByPage === 'object' ? payload.imageDpiByPage : null;

  if (lowPages.length === 0 && !dpiByPage && !Array.isArray(payload.blurryPageIndices)) {
    noteSkipped(ctx, 'image-resolution', ['imageDpiByPage', 'lowResolutionImagePages'], createIssue({
      id: 'image-dpi-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'metadata-skipped',
      scope: 'page',
      title: 'Image DPI check requires image resolution metadata',
      whyMatters: 'KDP recommends images at a minimum resolution of 300 DPI, but DPI cannot be inferred from page size alone.',
      where: 'Manuscript and cover images.',
      howToFix: 'Use a parser that extracts image DPI at final printed size.',
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: {},
        expected: { imageDpiByPage: 'Record<number, number[]>' },
        rule: 'Images should be at least 300 DPI.',
        payloadFieldsUsed: ['imageDpiByPage', 'lowResolutionImagePages'],
      },
    }));
    return;
  }

  notePerformed(ctx, 'image-resolution');
  const pageDpis = [];
  if (dpiByPage) {
    for (const key of Object.keys(dpiByPage)) {
      const dpis = Array.isArray(dpiByPage[key]) ? dpiByPage[key] : [];
      for (const dpi of dpis) {
        if (Number.isFinite(Number(dpi)) && Number(dpi) < MIN_IMAGE_DPI) pageDpis.push({ page: Number(key), dpi: Number(dpi) });
      }
    }
  }
  for (const page of lowPages) {
    if (!pageDpis.some(item => item.page === page)) pageDpis.push({ page, dpi: null });
  }

  if (pageDpis.length > 0) {
    const severe = pageDpis.filter(item => item.dpi !== null && item.dpi < SEVERE_IMAGE_DPI);
    ctx.issues.push(createIssue({
      id: 'image-resolution-low',
      category: severe.length > 0 ? 'must-fix' : 'should-fix',
      issueType: 'blurry-page-risk',
      scope: 'page',
      title: severe.length > 0 ? 'Some images are severely below 300 DPI' : 'Some images are below KDP’s 300 DPI recommendation',
      whyMatters: 'KDP recommends images at a minimum resolution of 300 DPI for print quality.',
      where: formatPageList([...new Set(pageDpis.map(item => item.page))]),
      howToFix: 'Replace low-resolution images with originals sized to at least 300 DPI at final printed size. Avoid repeated JPEG compression.',
      pageRefs: [...new Set(pageDpis.map(item => item.page))].slice(0, 20),
      fixability: 'manual-review',
      confidence: dpiByPage ? 'high' : 'medium',
      source: 'official-kdp',
      evidence: {
        actual: pageDpis.slice(0, 30),
        expected: { minDpi: MIN_IMAGE_DPI },
        rule: 'All images should be at least 300 DPI.',
        payloadFieldsUsed: ['imageDpiByPage', 'lowResolutionImagePages'],
      },
    }));
  }

  const blurryPages = Array.isArray(payload.blurryPageIndices) ? payload.blurryPageIndices : [];
  const blurryOnlyPages = blurryPages.filter(page => !pageDpis.some(item => item.page === page));
  if (blurryOnlyPages.length > 0) {
    ctx.issues.push(createIssue({
      id: 'blurry-page-risk',
      category: 'should-fix',
      issueType: 'blurry-page-risk',
      scope: 'page',
      title: 'Some pages may print blurry or low contrast',
      whyMatters: 'KDP print quality depends on clear images and readable content. This check is based on parser quality metadata and should be reviewed in KDP Previewer.',
      where: formatPageList(blurryOnlyPages),
      howToFix: 'Replace low-quality source images, avoid screenshots, and export from the original design file at print quality.',
      pageRefs: blurryOnlyPages.slice(0, 20),
      fixability: 'manual-review',
      confidence: 'medium',
      source: 'best-effort',
      evidence: {
        actual: { blurryPageIndices: blurryOnlyPages },
        expected: { clearReadablePages: true },
        rule: 'Best-effort quality warning from parser metadata; not a standalone KDP rejection rule.',
        payloadFieldsUsed: ['blurryPageIndices'],
      },
    }));
  }
}

// Official KDP source: Fix Paperback and Hardcover Formatting Issues.
function checkBlankPagesAndPagination(payload, ctx) {
  const blanks = Array.isArray(payload.blankPageIndices) ? payload.blankPageIndices.slice().sort((a, b) => a - b) : [];
  if (blanks.length > 0) notePerformed(ctx, 'blank-pages');

  const runs = [];
  let start = null;
  let prev = null;
  for (const page of blanks) {
    if (start === null || page !== prev + 1) {
      if (start !== null) runs.push([start, prev]);
      start = page;
    }
    prev = page;
  }
  if (start !== null) runs.push([start, prev]);

  const pageCount = asNumber(payload.pageCount);
  const excessiveRuns = runs.filter(([a, b]) => {
    const len = b - a + 1;
    const atEnd = b === pageCount;
    return atEnd ? len > 10 : len > 4;
  });

  if (excessiveRuns.length > 0) {
    ctx.issues.push(createIssue({
      id: 'blank-pages',
      category: 'should-fix',
      issueType: 'blank-pages',
      scope: 'page',
      title: 'Excessive consecutive blank pages detected',
      whyMatters: 'KDP says it allows no more than 4 consecutive blank pages at the beginning or middle and/or 10 consecutive blank pages at the end.',
      where: excessiveRuns.map(([a, b]) => a === b ? `Page ${a}` : `Pages ${a}-${b}`).join(', '),
      howToFix: 'Remove unexpected blank pages, or verify intentional blanks in KDP Previewer.',
      pageRefs: excessiveRuns.flatMap(([a, b]) => {
        const pages = [];
        for (let page = a; page <= b && pages.length < 20; page++) pages.push(page);
        return pages;
      }),
      fixability: 'manual-review',
      source: 'official-kdp',
      evidence: {
        actual: { blankPageIndices: blanks, excessiveRuns },
        expected: { maxConsecutiveBeginningOrMiddle: 4, maxConsecutiveEnd: 10 },
        rule: 'No more than 4 consecutive blank pages at beginning/middle and/or 10 at the end.',
        payloadFieldsUsed: ['blankPageIndices', 'pageCount'],
      },
    }));
  }

  if (Array.isArray(payload.detectedPageNumberSequenceIssues) && payload.detectedPageNumberSequenceIssues.length > 0) {
    notePerformed(ctx, 'pagination-sequence');
    ctx.issues.push(createIssue({
      id: 'pagination-sequence',
      category: 'should-fix',
      issueType: 'pagination-sequence',
      scope: 'page',
      title: 'Page numbering sequence needs review',
      whyMatters: 'KDP says skipped or changed page numbers can indicate missing or incorrectly ordered pages.',
      where: formatPageList(payload.detectedPageNumberSequenceIssues),
      howToFix: 'Review page numbering and confirm pages are ordered correctly.',
      pageRefs: payload.detectedPageNumberSequenceIssues.slice(0, 20),
      fixability: 'manual-review',
      source: 'official-kdp',
      evidence: {
        actual: { detectedPageNumberSequenceIssues: payload.detectedPageNumberSequenceIssues },
        expected: { sequentialPageNumbers: true },
        rule: 'Page numbers should be ordered sequentially.',
        payloadFieldsUsed: ['detectedPageNumberSequenceIssues'],
      },
    }));
  }

  if (isPresent(payload.expectedPageCountFromSource) && asNumber(payload.expectedPageCountFromSource) !== pageCount) {
    notePerformed(ctx, 'expected-page-count');
    ctx.issues.push(createIssue({
      id: 'page-count-source-mismatch',
      category: 'should-fix',
      issueType: 'pagination-sequence',
      scope: 'page',
      title: 'PDF page count differs from expected source page count',
      whyMatters: 'A page-count mismatch can indicate missing pages or export settings that changed the document.',
      where: `PDF has ${pageCount} pages; source expected ${payload.expectedPageCountFromSource}.`,
      howToFix: 'Compare the PDF to the source document and re-export if pages are missing.',
      fixability: 'manual-review',
      confidence: 'medium',
      source: 'best-effort',
      evidence: {
        actual: { pageCount },
        expected: { expectedPageCountFromSource: payload.expectedPageCountFromSource },
        rule: 'Compare extracted PDF page count against source metadata when provided.',
        payloadFieldsUsed: ['pageCount', 'expectedPageCountFromSource'],
      },
    }));
  }
}

// Official KDP source: Print Options ink/paper and Format Images in Your Book.
function getColorDetectionMetadata(payload) {
  const hasStats = payload.pageColorStatsByPage && typeof payload.pageColorStatsByPage === 'object';
  const stats = hasStats ? payload.pageColorStatsByPage : {};
  const pageCount = asNumber(payload.pageCount);
  const analyzedPageSet = new Set();
  const missingPageSet = new Set();
  const failedPageSet = new Set();
  const meaningfulColorPageSet = new Set();
  const colorByPage = {};
  let hasQuantitativeStats = false;
  let statsColorWithoutQuantity = false;
  let hasLowConfidenceColorPage = false;
  let maxColorPixelRatio = 0;
  let maxSaturationScore = 0;

  if (hasStats) {
    for (const key of Object.keys(stats)) {
      const page = Number(key);
      const pageStats = stats[key] || {};
      if (!Number.isFinite(page) || page <= 0) continue;
      const analyzed = pageStats.analyzed === true;
      if (!analyzed) {
        failedPageSet.add(page);
        colorByPage[page] = {
          analyzed: false,
          hasColor: false,
          meaningfulColor: false,
          colorPixelRatio: null,
          saturatedColorPixelRatio: undefined,
          saturationScore: undefined,
          averageSaturation: undefined,
          maxColorDelta: undefined,
          totalPixelsSampled: Number.isFinite(Number(pageStats.totalPixelsSampled)) ? Number(pageStats.totalPixelsSampled) : 0,
          colorLikePixels: Number.isFinite(Number(pageStats.colorLikePixels)) ? Number(pageStats.colorLikePixels) : 0,
          threshold: pageStats.threshold,
          confidence: 'low',
          reasonCode: pageStats.reasonCode || 'COLOR_ANALYSIS_FAILED',
        };
        continue;
      }

      analyzedPageSet.add(page);
      const colorPixelRatio = Number(pageStats.colorPixelRatio);
      const saturatedColorPixelRatio = Number(pageStats.saturatedColorPixelRatio);
      const effectiveColorRatio = Number.isFinite(saturatedColorPixelRatio) ? saturatedColorPixelRatio : colorPixelRatio;
      const averageSaturation = Number(pageStats.averageSaturation);
      const saturationScore = Number.isFinite(averageSaturation) ? averageSaturation : Number(pageStats.saturationScore);
      const maxColorDelta = Number(pageStats.maxColorDelta);
      const totalPixelsSampled = Number(pageStats.totalPixelsSampled);
      const colorLikePixels = Number(pageStats.colorLikePixels);
      const hasRatio = Number.isFinite(effectiveColorRatio);
      const hasSaturation = Number.isFinite(saturationScore);
      if (hasRatio) {
        hasQuantitativeStats = true;
        maxColorPixelRatio = Math.max(maxColorPixelRatio, effectiveColorRatio);
      }
      if (hasSaturation) {
        hasQuantitativeStats = true;
        maxSaturationScore = Math.max(maxSaturationScore, saturationScore);
      }
      const meaningfulColor = pageStats.meaningfulColor === true || (hasRatio && effectiveColorRatio >= COLOR_MEANINGFUL_RATIO_THRESHOLD);
      const hasColor = pageStats.hasColor === true || meaningfulColor || (hasRatio && effectiveColorRatio >= COLOR_HAS_RATIO_THRESHOLD);
      const reasonCode = !hasColor
        ? 'GRAYSCALE_PAGE'
        : meaningfulColor
          ? 'MEANINGFUL_COLOR_DETECTED'
          : 'ONLY_TINY_COLOR_NOISE';
      colorByPage[page] = {
        analyzed: true,
        hasColor,
        meaningfulColor,
        colorPixelRatio: hasRatio ? effectiveColorRatio : null,
        saturatedColorPixelRatio: Number.isFinite(saturatedColorPixelRatio) ? saturatedColorPixelRatio : undefined,
        averageSaturation: hasSaturation ? saturationScore : undefined,
        saturationScore: hasSaturation ? saturationScore : undefined,
        maxColorDelta: Number.isFinite(maxColorDelta) ? maxColorDelta : undefined,
        totalPixelsSampled: Number.isFinite(totalPixelsSampled) ? totalPixelsSampled : undefined,
        colorLikePixels: Number.isFinite(colorLikePixels) ? colorLikePixels : undefined,
        threshold: pageStats.threshold,
        confidence: pageStats.confidence || (hasRatio || hasSaturation ? 'high' : 'low'),
        reasonCode: pageStats.reasonCode || reasonCode,
      };
      if (meaningfulColor) {
        meaningfulColorPageSet.add(page);
        if (pageStats.confidence === 'low' || (!hasRatio && !hasSaturation)) {
          hasLowConfidenceColorPage = true;
        }
      } else if (!hasRatio && pageStats.hasColor === true) {
        if (!hasRatio && !hasSaturation) statsColorWithoutQuantity = true;
      }
    }
  }

  if (hasStats && pageCount > 0) {
    for (let page = 1; page <= pageCount; page++) {
      if (!analyzedPageSet.has(page)) missingPageSet.add(page);
    }
  }

  const colorPages = [...meaningfulColorPageSet].sort((a, b) => a - b);
  const analyzedPages = hasStats ? [...analyzedPageSet].sort((a, b) => a - b) : [];
  const incomplete = hasStats && pageCount > 0 && analyzedPageSet.size < pageCount;
  let confidence = 'medium';
  if (hasLowConfidenceColorPage) confidence = 'low';
  else if (hasQuantitativeStats) confidence = 'high';
  else if (statsColorWithoutQuantity) confidence = 'low';

  return {
    metadataAvailable: hasStats,
    hasStats,
    analyzedPages,
    analyzedPageCount: analyzedPages.length,
    missingPages: [...missingPageSet].sort((a, b) => a - b),
    failedPages: [...failedPageSet].sort((a, b) => a - b),
    incomplete,
    totalPages: pageCount,
    colorPages,
    colorByPage,
    colorPagesDetected: colorPages.length,
    maxColorPixelRatio,
    maxSaturationScore,
    confidence,
  };
}

function checkColorInteriorMismatch(interior, pageCount, colorPageIndices, pageColorStatsByPage) {
  const ctx = { issues: [], checksPerformed: [], checksSkipped: [], missingMetadata: [], globalDiagnostics: [], internalDiagnostics: [] };
  checkColor({ interior, pageCount, colorPageIndices, pageColorStatsByPage }, ctx);
  return ctx.issues;
}

// Official KDP source: Print Options ink/paper and Format Images in Your Book.
function checkColor(payload, ctx) {
  const colorMetadata = getColorDetectionMetadata(payload);
  const pageCount = asNumber(payload.pageCount);
  const safePageCount = pageCount > 0 ? pageCount : Math.max(colorMetadata.colorPagesDetected, 1);
  const colorPageRatio = colorMetadata.colorPagesDetected / safePageCount;

  if (!colorMetadata.metadataAvailable) {
    noteSkipped(ctx, 'color-interior-mismatch', ['colorPageIndices', 'pageColorStatsByPage'], createIssue({
      id: 'color-detection-skipped',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'color-detection-skipped',
      scope: 'page',
      title: 'Color/interior check skipped',
      whyMatters: 'The checker needs page color analysis metadata to compare manuscript content against the selected KDP interior type.',
      where: 'Entire manuscript.',
      howToFix: 'Run page color analysis before KDP validation.',
      pageRefs: [],
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        payloadFieldsUsed: ['colorPageIndices', 'pageColorStatsByPage'],
        notes: 'No color metadata was provided.',
      },
    }));
  }

  if (colorMetadata.metadataAvailable && colorMetadata.incomplete) {
    noteSkipped(ctx, 'color-interior-mismatch', ['pageColorStatsByPage'], createIssue({
      id: 'color-analysis-incomplete',
      category: 'info',
      severity: 'info',
      status: 'skipped',
      issueType: 'color-analysis-incomplete',
      scope: 'technical',
      title: 'Color analysis incomplete',
      whyMatters: `Color analysis did not include all pages. Only ${colorMetadata.analyzedPageCount} of ${colorMetadata.totalPages} pages were analyzed. Unanalyzed pages are not treated as passed.`,
      where: 'Entire manuscript.',
      howToFix: 'Run full-page color analysis for every manuscript page before relying on color/interior mismatch results.',
      pageRefs: [],
      fixability: 'info-only',
      confidence: 'low',
      source: 'missing-metadata',
      evidence: {
        actual: {
          analyzedPages: colorMetadata.analyzedPages,
          analyzedPagesCount: colorMetadata.analyzedPageCount,
          missingPages: colorMetadata.missingPages,
          failedPages: colorMetadata.failedPages,
          totalPages: colorMetadata.totalPages,
        },
        expected: { analyzedPagesCount: colorMetadata.totalPages },
        payloadFieldsUsed: ['pageCount', 'pageColorStatsByPage'],
        rule: 'Color/interior validation requires all pages to be analyzed; unanalyzed pages are not treated as passed.',
      },
    }));
  }

  if (colorMetadata.metadataAvailable) {
    notePerformed(ctx, 'color-interior-mismatch');

    if (payload.interior === 'black-white' && colorMetadata.colorPagesDetected > 0) {
    const onlySmallTraces =
      colorMetadata.colorPagesDetected <= 3 &&
      colorMetadata.maxColorPixelRatio > 0 &&
      colorMetadata.maxColorPixelRatio < 0.005;
    const majorityColor = colorPageRatio > COLOR_MAJORITY_PAGE_RATIO_THRESHOLD;
    const manyMeaningfulPages = colorPageRatio >= COLOR_MANY_PAGE_RATIO_THRESHOLD;
    const strongColorCoverage = colorMetadata.maxColorPixelRatio >= 0.01;
    const category = colorMetadata.confidence === 'low' || onlySmallTraces || (!manyMeaningfulPages && !strongColorCoverage)
      ? 'should-fix'
      : 'must-fix';
    const where = majorityColor
      ? `Most pages (${colorMetadata.colorPagesDetected} of ${safePageCount})`
      : formatPageList(colorMetadata.colorPages);

      ctx.issues.push(createIssue({
      id: 'color-in-bw-book',
      category,
      severity: category === 'must-fix' ? 'critical' : 'warning',
      status: category === 'must-fix' ? 'blocking' : 'warning',
      issueType: 'color-in-bw-book',
      scope: 'page',
      title: 'Color content detected in a Black & White book',
      whyMatters: 'Your setup is Black & White, but the manuscript contains color. KDP color output depends on the selected ink type, so these pages may print as grayscale and look different, muddy, washed out, or lower contrast.',
      where,
      howToFix: 'Convert the manuscript or detected color pages to Black & White, or change the selected interior type to Standard Color or Premium Color if the book is meant to print in color.',
      pageRefs: colorMetadata.colorPages,
      affectedPageCount: colorMetadata.colorPagesDetected,
      totalPageCount: pageCount,
      fixability: 'auto-fix',
      confidence: colorMetadata.confidence,
      source: 'official-kdp',
      fixActions: [FIX_ACTIONS.convertToBlackWhite, FIX_ACTIONS.changeSetupToColor],
      evidence: {
        actual: {
          selectedInterior: 'black-white',
          analyzedPages: colorMetadata.analyzedPageCount,
          totalPages: pageCount,
          meaningfulColorPages: colorMetadata.colorPagesDetected,
          colorPageRatio,
          affectedPages: colorMetadata.colorPages,
          confidence: colorMetadata.confidence,
          maxColorPixelRatio: colorMetadata.maxColorPixelRatio || undefined,
          maxSaturationScore: colorMetadata.maxSaturationScore || undefined,
        },
        expected: {
          interiorContent: 'grayscale/black-and-white',
        },
        payloadFieldsUsed: ['interior', 'pageCount', 'colorPageIndices', 'pageColorStatsByPage'],
        rule: 'Color content only prints in color when a color ink option is selected.',
        notes: colorMetadata.incomplete
          ? 'Some pages were not analyzed; unanalyzed pages are not treated as passed.'
          : 'Page color detection used quantitative color metadata.',
      },
      }));
    }

    if ((payload.interior === 'standard-color' || payload.interior === 'premium-color') && pageCount > 0 && !colorMetadata.incomplete && colorPageRatio < 0.05) {
      const noColor = colorMetadata.colorPagesDetected === 0;
      ctx.issues.push(createIssue({
      id: 'bw-in-color-book',
      category: noColor ? 'should-fix' : 'info',
      severity: noColor ? 'warning' : 'info',
      status: 'cost_advisory',
      issueType: 'bw-in-color-book',
      scope: 'setup',
      title: 'Color printing may be unnecessary',
      whyMatters: 'Your manuscript appears mostly Black & White, but Color printing is selected. KDP printing cost depends on ink type, so this may increase printing cost and minimum list price.',
      where: 'Entire manuscript setup.',
      howToFix: 'Switch the interior type to Black & White if the color setup was accidental. Keep Color if the color pages are intentional.',
      pageRefs: [],
      fixability: 'manual-review',
      confidence: colorMetadata.confidence,
      source: 'official-kdp',
      fixActions: [FIX_ACTIONS.switchSetupToBlackWhite, FIX_ACTIONS.keepColor],
      evidence: {
        actual: {
          selectedInterior: payload.interior,
          colorPagesDetected: colorMetadata.colorPagesDetected,
          colorPageRatio,
          analyzedPages: colorMetadata.analyzedPageCount,
          totalPages: pageCount,
        },
        expected: {
          suggestedInterior: 'black-white if color is accidental',
        },
        payloadFieldsUsed: ['interior', 'pageCount', 'colorPageIndices', 'pageColorStatsByPage'],
        rule: 'KDP printing cost depends on ink type.',
      },
      }));
    }
  }

  const darkPages = Array.isArray(payload.darkPageIndices) ? payload.darkPageIndices : [];
  if (darkPages.length > 0) {
    notePerformed(ctx, 'dark-print-heavy-pages');
    const qualityRiskPages = new Set([
      ...(Array.isArray(payload.blurryPageIndices) ? payload.blurryPageIndices : []),
      ...(Array.isArray(payload.lowResolutionImagePages) ? payload.lowResolutionImagePages : []),
      ...Object.keys(payload.imageDpiByPage || {}).filter(key => {
        const dpis = Array.isArray(payload.imageDpiByPage[key]) ? payload.imageDpiByPage[key] : [];
        return dpis.some(dpi => Number(dpi) < MIN_IMAGE_DPI);
      }).map(Number),
    ]);
    const riskyDarkPages = darkPages.filter(page => qualityRiskPages.has(page));
    if (riskyDarkPages.length > 0) {
      ctx.issues.push(createIssue({
        id: 'dark-background-quality-risk',
        category: 'should-fix',
        severity: 'warning',
        status: 'print_advisory',
        issueType: 'dark-background-risk',
        scope: 'page',
        title: 'Dark pages also have possible quality risks',
        whyMatters: 'Dark pages are not automatically KDP errors, but dark print-heavy pages with low resolution, blur, or compression risk can print poorly.',
        where: formatPageList(riskyDarkPages),
        howToFix: 'Review these pages carefully, improve source image quality where needed, and order a physical proof before publishing.',
        pageRefs: riskyDarkPages.slice(0, 20),
        fixability: 'manual-review',
        confidence: 'medium',
        source: 'best-effort',
        evidence: {
          actual: { darkPageIndices: darkPages, qualityRiskPages: [...qualityRiskPages] },
          expected: { physicalProofReview: true },
          rule: 'Dark pages are advisory; combined parser quality risks warrant manual review.',
          payloadFieldsUsed: ['darkPageIndices', 'blurryPageIndices', 'lowResolutionImagePages', 'imageDpiByPage'],
        },
      }));
      return;
    }
    ctx.issues.push(createIssue({
      id: 'dark-background-risk',
      category: 'info',
      severity: 'info',
      status: 'print_advisory',
      issueType: 'dark-background-risk',
      scope: 'page',
      title: 'Dark print-heavy pages detected',
      whyMatters: 'Dark pages are not automatically KDP errors, but heavy ink coverage can print differently from screen previews.',
      where: formatPageList(darkPages),
      howToFix: 'Order a physical proof. If the proof looks too dark, lighten backgrounds or increase contrast in the source file.',
      pageRefs: darkPages.slice(0, 20),
      fixability: 'info-only',
      confidence: 'medium',
      source: 'best-effort',
      evidence: {
        actual: { darkPageIndices: darkPages },
        expected: { physicalProofReview: true },
        rule: 'Advisory only; dark pages are not a standalone KDP rejection rule in the checked official docs.',
        payloadFieldsUsed: ['darkPageIndices'],
      },
    }));
  }
}

// Official KDP source: Paperback Submission Guidelines and Format Images in Your Book.
function checkFileSize(payload, ctx) {
  if (!isPresent(payload.fileSizeMb)) {
    noteSkipped(ctx, 'file-size', ['fileSizeMb'], null);
    return;
  }
  notePerformed(ctx, 'file-size');
  const fileSizeMb = asNumber(payload.fileSizeMb);
  if (KDP_OFFICIAL_FILE_SIZE_LIMIT_MB && fileSizeMb > KDP_OFFICIAL_FILE_SIZE_LIMIT_MB) {
    ctx.issues.push(createIssue({
      id: 'pdf-too-large',
      category: 'must-fix',
      issueType: 'pdf-too-large',
      scope: 'technical',
      title: 'PDF exceeds KDP’s 650 MB file-size limit',
      whyMatters: 'KDP file specifications list a 650 MB maximum file size.',
      where: `PDF is ${round3(fileSizeMb)} MB.`,
      howToFix: 'Optimize images while keeping 300 DPI at final size. Avoid repeated JPEG compression.',
      fixability: 'auto-fix',
      source: 'official-kdp',
      evidence: {
        actual: { fileSizeMb },
        expected: { maxFileSizeMb: KDP_OFFICIAL_FILE_SIZE_LIMIT_MB },
        rule: 'Ensure file size is not more than the official KDP upload limit in the file specifications.',
        payloadFieldsUsed: ['fileSizeMb'],
      },
    }));
  } else if (fileSizeMb > LARGE_FILE_ADVISORY_MB) {
    ctx.issues.push(createIssue({
      id: 'oversized-file-risk',
      category: 'should-fix',
      issueType: 'oversized-file-risk',
      scope: 'technical',
      title: 'Large PDF may slow upload or processing',
      whyMatters: 'KDP notes large files and excessively high image resolutions may time out or slow processing.',
      where: `PDF is ${round3(fileSizeMb)} MB.`,
      howToFix: 'Compress images carefully while keeping 300 DPI at final size. Avoid repeated JPEG compression.',
      fixability: 'auto-fix',
      confidence: 'medium',
      source: 'official-kdp',
      evidence: {
        actual: { fileSizeMb },
        expected: { maxFileSizeMb: KDP_OFFICIAL_FILE_SIZE_LIMIT_MB },
        rule: 'Maximum upload file size is 650 MB; large files may slow processing.',
        payloadFieldsUsed: ['fileSizeMb'],
      },
    }));
  }
}

function buildPageDiagnostics(payload, issues) {
  const pageCount = asNumber(payload.pageCount);
  const entries = getPageEntries(payload);
  const entryByPage = new Map(entries.map(entry => [entry.pageNumber, entry]));
  const hasBleed = payload.confirmedBleed === 'bleed';
  const trimWidthIn = asNumber(payload.confirmedTrimWidthIn);
  const trimHeightIn = asNumber(payload.confirmedTrimHeightIn);
  const expected = trimWidthIn && trimHeightIn ? getExpectedManuscriptSize(trimWidthIn, trimHeightIn, hasBleed) : null;
  const colorMetadata = getColorDetectionMetadata(payload);
  const marginRule = getMarginRule(pageCount);
  const pageDiagnostics = {};

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const entry = entryByPage.get(pageNumber);
    const actualSize = entry?.printBox || { widthIn: payload.widthIn, heightIn: payload.heightIn };
    const pageSizePassed = expected && hasSize(actualSize) ? sizeMatches(actualSize, expected, TOLERANCE_WARN_IN) : false;
    const color = colorMetadata.colorByPage[pageNumber] || {
      analyzed: false,
      hasColor: false,
      meaningfulColor: false,
      colorPixelRatio: null,
      saturatedColorPixelRatio: undefined,
      averageSaturation: undefined,
      saturationScore: undefined,
      maxColorDelta: undefined,
      totalPixelsSampled: 0,
      colorLikePixels: 0,
      threshold: undefined,
      confidence: 'low',
      reasonCode: 'COLOR_ANALYSIS_MISSING',
    };

    let margin = {
      analyzed: false,
      skippedReason: 'Margin check requires extracted content bounding boxes.',
      passed: null,
      reasonCode: 'CONTENT_BOUNDS_MISSING',
    };
    if (payload.contentBoundsByPage && typeof payload.contentBoundsByPage === 'object' && marginRule && hasSize(actualSize)) {
      const bounds = payload.contentBoundsByPage[pageNumber] || payload.contentBoundsByPage[String(pageNumber)];
      if (bounds) {
        const outsideMin = hasBleed ? marginRule.outsideBleedIn : marginRule.outsideNoBleedIn;
        const left = bounds.xMinIn;
        const right = actualSize.widthIn - bounds.xMaxIn;
        const bottom = bounds.yMinIn;
        const top = actualSize.heightIn - bounds.yMaxIn;
        const odd = pageNumber % 2 === 1;
        const inside = odd ? left : right;
        const outside = odd ? right : left;
        const passed = inside >= marginRule.insideIn - TOLERANCE_IN &&
          outside >= outsideMin - TOLERANCE_IN &&
          top >= outsideMin - TOLERANCE_IN &&
          bottom >= outsideMin - TOLERANCE_IN;
        margin = {
          analyzed: true,
          skippedReason: null,
          passed,
          reasonCode: passed ? 'MARGINS_MEET_MINIMUMS' : 'MARGIN_OR_GUTTER_BELOW_MINIMUM',
        };
      } else {
        margin = {
          analyzed: false,
          skippedReason: `Margin check missing content bounds for page ${pageNumber}.`,
          passed: null,
          reasonCode: 'PAGE_CONTENT_BOUNDS_MISSING',
        };
      }
    }

    const realPageIssues = realIssuesForPage(issues, pageNumber, pageCount);
    const criticalCount = realPageIssues.filter(issue => issue.category === 'must-fix').length;
    const warningCount = realPageIssues.filter(issue => issue.category === 'should-fix').length;
    const advisoryCount = realPageIssues.filter(issue => issue.category === 'info' && issue.status !== 'skipped').length;
    const hasIncompleteRequiredChecks = !color.analyzed;
    const skippedCount = [
      expected ? 0 : 1,
      color.analyzed ? 0 : 1,
      margin.analyzed ? 0 : 1,
    ].reduce((sum, value) => sum + value, 0);

    pageDiagnostics[pageNumber] = {
      pageSize: {
        actualWidthIn: hasSize(actualSize) ? actualSize.widthIn : null,
        actualHeightIn: hasSize(actualSize) ? actualSize.heightIn : null,
        expectedWidthIn: expected?.widthIn ?? null,
        expectedHeightIn: expected?.heightIn ?? null,
        passed: !!pageSizePassed,
        reasonCode: expected ? (pageSizePassed ? 'PAGE_SIZE_MATCHES_SELECTED_CONFIG' : 'PAGE_SIZE_DIFFERS_FROM_SELECTED_CONFIG') : 'EXPECTED_SIZE_MISSING',
      },
      color: {
        analyzed: !!color.analyzed,
        hasColor: !!color.hasColor,
        meaningfulColor: !!color.meaningfulColor,
        totalPixelsSampled: color.totalPixelsSampled,
        colorLikePixels: color.colorLikePixels,
        colorPixelRatio: color.colorPixelRatio,
        saturatedColorPixelRatio: color.saturatedColorPixelRatio,
        averageSaturation: color.averageSaturation,
        saturationScore: color.saturationScore,
        maxColorDelta: color.maxColorDelta,
        threshold: color.threshold,
        confidence: color.confidence,
        reasonCode: color.reasonCode,
      },
      margin,
      finalStatus: {
        hasRealIssue: criticalCount + warningCount > 0,
        hasIncompleteRequiredChecks,
        canShowOk: criticalCount + warningCount + advisoryCount === 0 && !hasIncompleteRequiredChecks,
        criticalCount,
        warningCount,
        advisoryCount,
        skippedCount,
      },
    };
  }

  return pageDiagnostics;
}

function buildConsistencyDiagnostics(payload, pageDiagnostics) {
  const diagnostics = [];
  const entries = getPageEntries(payload);
  const bySize = new Map();
  for (const entry of entries) {
    const key = `${round3(entry.printBox.widthIn)}x${round3(entry.printBox.heightIn)}`;
    bySize.set(key, [...(bySize.get(key) || []), entry.pageNumber]);
  }
  for (const pages of bySize.values()) {
    const colorStates = new Map();
    for (const page of pages) {
      const diag = pageDiagnostics[page]?.color;
      if (!diag?.analyzed) continue;
      const key = `${diag.meaningfulColor}:${diag.reasonCode}`;
      colorStates.set(key, [...(colorStates.get(key) || []), page]);
    }
    if (colorStates.size > 1) {
      diagnostics.push({
        checkId: 'potential-inconsistent-color-detection',
        status: 'debug',
        source: 'best-effort',
        message: 'Potential inconsistent color detection among pages with identical or nearly identical dimensions.',
        groups: [...colorStates.values()],
      });
    }
  }
  return diagnostics;
}

function computeScore(issues) {
  let score = 100;
  for (const issue of issues) {
    if (issue.status === 'skipped' || issue.status === 'cost_advisory') continue;
    if (issue.category === 'must-fix' || issue.status === 'blocking') score -= 20;
    else if (issue.category === 'should-fix' || issue.status === 'warning') score -= 8;
  }
  return Math.max(10, Math.min(100, score));
}

function computeVerdict(score) {
  if (score >= 90) return { verdict: 'Likely ready for KDP Previewer', verdictLevel: 'good' };
  if (score >= 75) return { verdict: 'A few things to review', verdictLevel: 'caution' };
  if (score >= 55) return { verdict: 'Fix these issues before uploading', verdictLevel: 'caution' };
  if (score >= 35) return { verdict: 'Several problems detected', verdictLevel: 'danger' };
  return { verdict: 'High chance of KDP upload/preview problems', verdictLevel: 'danger' };
}

function analyzeKindle(payload) {
  const issue = createIssue({
    id: 'kindle-out-of-scope',
    category: 'info',
    severity: 'info',
    status: 'skipped',
    issueType: 'kindle-out-of-scope',
    scope: 'setup',
    title: 'Kindle/eBook validation is outside this print preflight checker.',
    whyMatters: 'Paperback and hardcover print rules are different from Kindle eBook, EPUB, and KPF rules.',
    where: 'Book type.',
    howToFix: 'Use a separate Kindle/eBook checker for EPUB/KPF validation.',
    fixability: 'info-only',
    confidence: 'high',
    source: 'official-kdp',
    evidence: {
      actual: { bookType: payload.bookType },
      expected: { bookType: 'paperback or hardcover' },
      rule: 'This worker validates print books only.',
      payloadFieldsUsed: ['bookType'],
    },
  });
  return {
    issues: [issue],
    score: 100,
    ...computeVerdict(100),
    spineWidthIn: null,
    expectedFullWidthIn: null,
    expectedFullHeightIn: null,
    bleedIn: COVER_BLEED_IN,
    pageBoxes: payload.pageBoxes,
    checksPerformed: [],
    checksSkipped: [{
      checkId: 'kindle-ebook-validation',
      reason: 'Kindle/eBook validation is outside this print preflight checker.',
      missingMetadata: [],
      source: 'missing-metadata',
      status: 'skipped',
    }],
    missingMetadata: [],
    globalDiagnostics: [issue],
    internalDiagnostics: [],
    pageDiagnostics: {},
    ruleVersion: payload.sourceRuleVersion || RULE_VERSION,
    officialSourcesUsed: Object.values(OFFICIAL_SOURCES),
  };
}

function analyze(payload) {
  if (payload && payload.bookType === 'kindle') return analyzeKindle(payload);

  const ctx = {
    issues: [],
    checksPerformed: [],
    checksSkipped: [],
    missingMetadata: [],
    globalDiagnostics: [],
    internalDiagnostics: [],
  };

  const normalized = {
    ...payload,
    bookType: payload.bookType || 'paperback',
    interior: payload.interior || 'black-white',
    paper: payload.paper || 'white',
    confirmedBleed: payload.confirmedBleed || 'no-bleed',
  };

  if (!checkRequiredSetupMetadata(normalized, ctx)) {
    const pageDiagnostics = buildPageDiagnostics(normalized, ctx.issues);
    const score = computeScore(ctx.issues);
    const verdict = computeVerdict(score);
    return {
      issues: ctx.issues,
      score,
      verdict: verdict.verdict,
      verdictLevel: verdict.verdictLevel,
      spineWidthIn: null,
      expectedFullWidthIn: null,
      expectedFullHeightIn: null,
      bleedIn: COVER_BLEED_IN,
      pageBoxes: normalized.pageBoxes,
      checksPerformed: ctx.checksPerformed,
      checksSkipped: ctx.checksSkipped,
      missingMetadata: ctx.missingMetadata,
      globalDiagnostics: ctx.globalDiagnostics,
      internalDiagnostics: buildConsistencyDiagnostics(normalized, pageDiagnostics),
      pageDiagnostics,
      ruleVersion: normalized.sourceRuleVersion || RULE_VERSION,
      officialSourcesUsed: Object.values(OFFICIAL_SOURCES),
    };
  }

  const row = checkCompatibility(normalized, ctx);
  checkManuscriptSize(normalized, ctx);
  checkMargins(normalized, ctx);
  checkColor(normalized, ctx);
  checkTechnical(normalized, ctx);
  checkImages(normalized, ctx);
  checkBlankPagesAndPagination(normalized, ctx);
  checkCover(normalized, ctx);
  checkSpineText(normalized, ctx);
  checkBarcode(normalized, ctx);
  checkExpandedDistribution(normalized, row, ctx);
  checkFileSize(normalized, ctx);

  const spineWidthIn = normalized.bookType === 'paperback' ? getPaperbackSpineWidth(normalized) : null;
  const paperbackExpected = normalized.bookType === 'paperback' ? getPaperbackCoverExpected(normalized) : null;
  const expectedFullWidthIn = normalized.bookType === 'paperback'
    ? paperbackExpected.widthIn
    : (isPresent(normalized.coverExpectedWidthIn) ? asNumber(normalized.coverExpectedWidthIn) : null);
  const expectedFullHeightIn = normalized.bookType === 'paperback'
    ? paperbackExpected.heightIn
    : (isPresent(normalized.coverExpectedHeightIn) ? asNumber(normalized.coverExpectedHeightIn) : null);

  for (const issue of ctx.issues) {
    issue.classification = classifyIssue(issue);
  }
  for (const diagnostic of ctx.globalDiagnostics) {
    diagnostic.classification = 'skippedCheck';
  }

  const pageDiagnostics = buildPageDiagnostics(normalized, ctx.issues);
  ctx.internalDiagnostics.push(...buildConsistencyDiagnostics(normalized, pageDiagnostics));

  const score = computeScore(ctx.issues);
  const verdict = computeVerdict(score);

  return {
    issues: ctx.issues,
    score,
    verdict: verdict.verdict,
    verdictLevel: verdict.verdictLevel,
    spineWidthIn,
    expectedFullWidthIn,
    expectedFullHeightIn,
    bleedIn: COVER_BLEED_IN,
    pageBoxes: normalized.pageBoxes,
    checksPerformed: ctx.checksPerformed,
    checksSkipped: ctx.checksSkipped,
    missingMetadata: ctx.missingMetadata,
    globalDiagnostics: ctx.globalDiagnostics,
    internalDiagnostics: ctx.internalDiagnostics,
    pageDiagnostics,
    ruleVersion: normalized.sourceRuleVersion || RULE_VERSION,
    officialSourcesUsed: Object.values(OFFICIAL_SOURCES),
  };
}

globalThis.__KDP_ANALYSIS_TEST__ = {
  analyze,
  checkColorInteriorMismatch,
  getExpectedManuscriptSize,
  KDP_PRINT_MATRIX,
  KDP_MARGIN_RULES,
  OFFICIAL_SOURCES,
};

globalThis.onmessage = function (e) {
  if (e.data.type === 'ANALYZE') {
    try {
      globalThis.postMessage({
        type: 'ANALYSIS_COMPLETE',
        requestId: e.data.requestId,
        fileFingerprint: e.data.fileFingerprint,
        validationConfigHash: e.data.validationConfigHash,
        payload: analyze(e.data.payload || {}),
      });
    } catch (err) {
      globalThis.postMessage({
        type: 'ANALYSIS_ERROR',
        requestId: e.data.requestId,
        fileFingerprint: e.data.fileFingerprint,
        validationConfigHash: e.data.validationConfigHash,
        payload: { message: String(err && err.stack ? err.stack : err) },
      });
    }
  }
};
