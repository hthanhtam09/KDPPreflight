import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

function loadWorkerApi() {
  const code = readFileSync(new URL('../public/workers/kdp-analysis-worker.js', import.meta.url), 'utf8');
  const sandbox = { globalThis: {} };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'kdp-analysis-worker.js' });
  return sandbox.__KDP_ANALYSIS_TEST__;
}

const api = loadWorkerApi();

function basePayload(overrides = {}) {
  return {
    bookType: 'paperback',
    trimKey: '6x9',
    confirmedTrimWidthIn: 6,
    confirmedTrimHeightIn: 9,
    confirmedBleed: 'no-bleed',
    interior: 'black-white',
    paper: 'white',
    pageCount: 120,
    fileSizeMb: 20,
    widthIn: 6,
    heightIn: 9,
    pageBoxes: [
      { pageNumber: 1, printBox: { widthIn: 6, heightIn: 9 } },
      { pageNumber: 2, printBox: { widthIn: 6, heightIn: 9 } },
    ],
    hasCover: false,
    hasEmbeddedFonts: true,
    colorPageIndices: [],
    imageDpiByPage: { 1: [300] },
    contentBoundsByPage: {
      1: { xMinIn: 0.6, yMinIn: 0.6, xMaxIn: 5.4, yMaxIn: 8.4 },
      2: { xMinIn: 0.6, yMinIn: 0.6, xMaxIn: 5.4, yMaxIn: 8.4 },
    },
    ...overrides,
  };
}

function issue(result, id) {
  return result.issues.find(item => item.id === id || item.issueType === id);
}

function diagnostic(result, id) {
  return (result.globalDiagnostics || []).find(item => item.id === id || item.issueType === id);
}

function skipped(result, checkId) {
  return (result.checksSkipped || []).find(item => item.checkId === checkId);
}

function pageColorStats(pageCount, colorPages = [], options = {}) {
  const colorSet = new Set(colorPages);
  const ratio = options.ratio ?? 0.02;
  const stats = {};
  for (let page = 1; page <= pageCount; page++) {
    const meaningful = colorSet.has(page);
    stats[page] = {
      analyzed: true,
      hasColor: meaningful,
      meaningfulColor: meaningful,
      colorPixelRatio: meaningful ? ratio : 0,
      saturatedColorPixelRatio: meaningful ? ratio : 0,
      saturationScore: meaningful ? 0.12 : 0,
      averageSaturation: meaningful ? 0.12 : 0,
      maxColorDelta: meaningful ? 24 : 0,
      totalPixelsSampled: 10000,
      colorLikePixels: meaningful ? Math.round(10000 * ratio) : 0,
      confidence: options.confidence ?? 'high',
      reasonCode: meaningful ? 'MEANINGFUL_COLOR_DETECTED' : 'GRAYSCALE_PAGE',
      threshold: { colorDelta: 10, saturation: 0.06, hasColorRatio: 0.001, meaningfulRatio: 0.003 },
    };
  }
  return stats;
}

test('manuscript size formula matches official KDP bleed math', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(api.getExpectedManuscriptSize(6, 9, false))), { widthIn: 6, heightIn: 9 });
  assert.deepEqual(JSON.parse(JSON.stringify(api.getExpectedManuscriptSize(6, 9, true))), { widthIn: 6.125, heightIn: 9.25 });
  assert.deepEqual(JSON.parse(JSON.stringify(api.getExpectedManuscriptSize(8.5, 11, true))), { widthIn: 8.625, heightIn: 11.25 });
});

test('bleed selected but manuscript is trim-sized returns bleed-missing', () => {
  const result = api.analyze(basePayload({ confirmedBleed: 'bleed' }));
  const found = issue(result, 'bleed-missing');
  assert.equal(found.category, 'must-fix');
  assert.equal(found.evidence.expected.widthIn, 6.125);
  assert.equal(found.evidence.expected.heightIn, 9.25);
});

test('no-bleed selected but manuscript is bleed-sized returns setup mismatch warning', () => {
  const result = api.analyze(basePayload({
    widthIn: 6.125,
    heightIn: 9.25,
    pageBoxes: [
      { pageNumber: 1, printBox: { widthIn: 6.125, heightIn: 9.25 } },
      { pageNumber: 2, printBox: { widthIn: 6.125, heightIn: 9.25 } },
    ],
  }));
  const found = issue(result, 'no-bleed-file-appears-bleed-sized');
  assert.equal(found.category, 'should-fix');
  assert.equal(found.fixability, 'manual-review');
});

test('paperback page count and compatibility matrix cases', () => {
  assert.equal(issue(api.analyze(basePayload({
    trimKey: '8.5x11',
    confirmedTrimWidthIn: 8.5,
    confirmedTrimHeightIn: 11,
    pageCount: 600,
    widthIn: 8.5,
    heightIn: 11,
    pageBoxes: [{ pageNumber: 1, printBox: { widthIn: 8.5, heightIn: 11 } }],
  })), 'page-count-high').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    trimKey: '8.5x11',
    confirmedTrimWidthIn: 8.5,
    confirmedTrimHeightIn: 11,
    paper: 'cream',
    pageCount: 560,
    widthIn: 8.5,
    heightIn: 11,
    pageBoxes: [{ pageNumber: 1, printBox: { widthIn: 8.5, heightIn: 11 } }],
  })), 'page-count-high').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    interior: 'standard-color',
    paper: 'white',
    pageCount: 50,
  })), 'page-count-low').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    interior: 'premium-color',
    paper: 'white',
    pageCount: 50,
  })), 'page-count-low'), undefined);

  assert.equal(issue(api.analyze(basePayload({
    interior: 'standard-color',
    paper: 'cream',
  })), 'unsupported-combination').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    interior: 'premium-color',
    paper: 'cream',
  })), 'unsupported-combination').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    trimKey: 'unknown',
    confirmedTrimWidthIn: 4.4,
    confirmedTrimHeightIn: 8.8,
  })), 'unsupported-combination').category, 'must-fix');
});

test('hardcover page count and trim support', () => {
  assert.equal(issue(api.analyze(basePayload({
    bookType: 'hardcover',
    trimKey: '6x9',
    pageCount: 50,
  })), 'page-count-low').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    bookType: 'hardcover',
    trimKey: '6x9',
    pageCount: 600,
  })), 'page-count-high').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    bookType: 'hardcover',
    trimKey: '8.5x11',
    confirmedTrimWidthIn: 8.5,
    confirmedTrimHeightIn: 11,
  })), 'unsupported-combination').category, 'must-fix');

  const result = api.analyze(basePayload({
    bookType: 'hardcover',
    trimKey: '6x9',
    pageCount: 120,
    hasCover: true,
    coverWidthIn: 13,
    coverHeightIn: 10,
  }));
  assert.equal(diagnostic(result, 'hardcover-cover-size-skipped').status, 'skipped');
  assert.equal(issue(result, 'cover-size-mismatch'), undefined);
});

test('cover checks handle paperback formula, artifacts, and barcode metadata', () => {
  const spineWidth = Math.round(120 * 0.002252 * 1000) / 1000;
  const result = api.analyze(basePayload({
    hasCover: true,
    coverPageCount: 2,
    coverWidthIn: 12 + spineWidth + 0.25 + 0.2,
    coverHeightIn: 9.25,
    coverHasCropMarks: true,
    coverHasTemplateText: true,
    coverHasBarcodeConflict: true,
  }));
  assert.equal(issue(result, 'cover-page-count').category, 'must-fix');
  assert.equal(issue(result, 'cover-size-mismatch').category, 'must-fix');
  assert.equal(issue(result, 'cover-crop-marks').category, 'must-fix');
  assert.equal(issue(result, 'cover-template-text').category, 'must-fix');
  assert.equal(issue(result, 'cover-barcode-conflict').category, 'must-fix');

  const noBarcodeMetadata = api.analyze(basePayload({ hasCover: true, coverWidthIn: 12 + spineWidth + 0.25, coverHeightIn: 9.25 }));
  assert.equal(diagnostic(noBarcodeMetadata, 'barcode-validation-skipped').status, 'skipped');
});

test('spine text rules use page count and require bounds for clearance', () => {
  assert.equal(issue(api.analyze(basePayload({
    pageCount: 79,
    hasSpineText: true,
  })), 'spine-text-too-thin').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    pageCount: 79,
    hasSpineText: null,
  })), 'spine-text-manual-review').category, 'should-fix');

  assert.equal(issue(api.analyze(basePayload({
    pageCount: 120,
    hasSpineText: true,
    spineTextBounds: { xMinIn: 6.01, yMinIn: 1, xMaxIn: 6.2, yMaxIn: 8 },
    spineBounds: { xMinIn: 6, yMinIn: 0, xMaxIn: 6.3, yMaxIn: 9 },
  })), 'spine-text-clearance').category, 'must-fix');

  assert.equal(issue(api.analyze(basePayload({
    pageCount: 120,
    hasSpineText: true,
    spineTextBounds: { xMinIn: 6.01, yMinIn: 1, xMaxIn: 6.2, yMaxIn: 8 },
  })), 'spine-text-clearance'), undefined);
});

test('technical PDF checks and metadata skips', () => {
  const result = api.analyze(basePayload({
    isLocked: true,
    hasEmbeddedFonts: false,
    unembeddedFonts: ['ExampleFont'],
    hasTwoPageSpreads: true,
    hasTransparency: true,
    hasLayers: true,
    hasAnnotations: true,
    hasFormFields: true,
    imageDpiByPage: { 2: [250] },
  }));
  assert.equal(issue(result, 'locked-pdf').category, 'must-fix');
  assert.equal(issue(result, 'fonts-not-embedded').category, 'must-fix');
  assert.equal(issue(result, 'two-page-spreads').category, 'must-fix');
  assert.equal(issue(result, 'image-resolution-low').category, 'should-fix');
  assert.equal(issue(result, 'pdf-transparency').category, 'should-fix');
  assert.equal(issue(result, 'pdf-layers').category, 'should-fix');
  assert.equal(issue(result, 'pdf-annotations').category, 'should-fix');
  assert.equal(issue(result, 'pdf-form-fields').category, 'should-fix');

  const skipped = api.analyze(basePayload({
    hasEmbeddedFonts: undefined,
    unembeddedFonts: undefined,
    imageDpiByPage: undefined,
    lowResolutionImagePages: undefined,
    contentBoundsByPage: undefined,
  }));
  assert.equal(diagnostic(skipped, 'image-dpi-skipped').status, 'skipped');
  assert.equal(diagnostic(skipped, 'margin-check-skipped').status, 'skipped');
  assert.equal(diagnostic(skipped, 'font-check-skipped').status, 'skipped');
});

test('lowResolutionImagePages creates image resolution warning without inferring from page size', () => {
  const low = api.analyze(basePayload({
    imageDpiByPage: undefined,
    lowResolutionImagePages: [2],
  }));
  assert.equal(issue(low, 'image-resolution-low').category, 'should-fix');

  const missing = api.analyze(basePayload({
    imageDpiByPage: undefined,
    lowResolutionImagePages: undefined,
  }));
  assert.equal(diagnostic(missing, 'image-dpi-skipped').status, 'skipped');
});

test('margin checks use official gutter and outside minimums only when content bounds exist', () => {
  const missing = api.analyze(basePayload({ contentBoundsByPage: undefined }));
  assert.equal(diagnostic(missing, 'margin-check-skipped').status, 'skipped');
  assert.equal(skipped(missing, 'margins-and-gutter').status, 'skipped');
  assert.equal(issue(missing, 'margin-gutter-risk'), undefined);

  const gutter = api.analyze(basePayload({
    contentBoundsByPage: {
      1: { xMinIn: 0.2, yMinIn: 0.6, xMaxIn: 5.4, yMaxIn: 8.4 },
    },
  }));
  assert.equal(issue(gutter, 'margin-gutter-risk').category, 'should-fix');
  assert.deepEqual(JSON.parse(JSON.stringify(issue(gutter, 'margin-gutter-risk').pageRefs)), [1]);

  const noBleedOutsideOk = api.analyze(basePayload({
    contentBoundsByPage: {
      1: { xMinIn: 0.5, yMinIn: 0.26, xMaxIn: 5.74, yMaxIn: 8.74 },
    },
  }));
  assert.equal(issue(noBleedOutsideOk, 'margin-gutter-risk'), undefined);

  const bleedOutsideTooSmall = api.analyze(basePayload({
    confirmedBleed: 'bleed',
    widthIn: 6.125,
    heightIn: 9.25,
    pageBoxes: [{ pageNumber: 1, printBox: { widthIn: 6.125, heightIn: 9.25 } }],
    contentBoundsByPage: {
      1: { xMinIn: 0.5, yMinIn: 0.26, xMaxIn: 5.86, yMaxIn: 8.99 },
    },
  }));
  assert.equal(issue(bleedOutsideTooSmall, 'margin-gutter-risk').category, 'should-fix');
});

test('cover expected dimensions override paperback formula and missing cover metadata is skipped only', () => {
  const override = api.analyze(basePayload({
    hasCover: true,
    coverWidthIn: 13,
    coverHeightIn: 10,
    coverExpectedWidthIn: 13,
    coverExpectedHeightIn: 10,
  }));
  assert.equal(issue(override, 'cover-size-mismatch'), undefined);

  const missing = api.analyze(basePayload({ hasCover: false, coverWidthIn: undefined, coverHeightIn: undefined }));
  assert.equal(diagnostic(missing, 'cover-check-skipped').status, 'skipped');
  assert.equal(issue(missing, 'cover-size-mismatch'), undefined);
});

test('barcode user metadata checks dpi, minimum size, and missing metadata', () => {
  const lowDpi = api.analyze(basePayload({
    hasCover: true,
    coverHasUserBarcode: true,
    coverBarcodeResolutionDpi: 200,
  }));
  assert.equal(issue(lowDpi, 'barcode-resolution-low').category, 'must-fix');

  const small = api.analyze(basePayload({
    hasCover: true,
    coverHasUserBarcode: true,
    coverBarcodeBounds: { xMinIn: 1, yMinIn: 1, xMaxIn: 2.2, yMaxIn: 1.7 },
  }));
  assert.equal(issue(small, 'barcode-size-small').category, 'must-fix');

  const skipped = api.analyze(basePayload({ hasCover: true, coverHasUserBarcode: undefined }));
  assert.equal(diagnostic(skipped, 'barcode-validation-skipped').status, 'skipped');
});

test('cover production artifacts include color bars without fake missing-metadata issues', () => {
  const result = api.analyze(basePayload({
    hasCover: true,
    coverHasColorBars: true,
  }));
  assert.equal(issue(result, 'cover-color-bars').category, 'must-fix');
});

test('dark pages are advisory only unless combined with quality metadata', () => {
  const darkOnly = api.analyze(basePayload({ darkPageIndices: [1, 2] }));
  assert.equal(issue(darkOnly, 'dark-background-risk').category, 'info');
  assert.equal(issue(darkOnly, 'dark-background-risk').status, 'print_advisory');

  const darkQuality = api.analyze(basePayload({
    darkPageIndices: [1, 2],
    blurryPageIndices: [2],
  }));
  assert.equal(issue(darkQuality, 'dark-background-quality-risk').category, 'should-fix');
  assert.notEqual(issue(darkQuality, 'dark-background-quality-risk').category, 'must-fix');
});

test('expanded distribution unsupported combination returns issue', () => {
  const result = api.analyze(basePayload({
    trimKey: '8.25x6',
    confirmedTrimWidthIn: 8.25,
    confirmedTrimHeightIn: 6,
    expandedDistributionEnabled: true,
    widthIn: 8.25,
    heightIn: 6,
    pageBoxes: [{ pageNumber: 1, printBox: { widthIn: 8.25, heightIn: 6 } }],
  }));
  assert.equal(issue(result, 'expanded-distribution-unsupported').category, 'must-fix');
});

test('file size hard limit is applied only from official constant', () => {
  const result = api.analyze(basePayload({ fileSizeMb: 700 }));
  assert.equal(issue(result, 'pdf-too-large').category, 'must-fix');
  assert.equal(issue(result, 'pdf-too-large').evidence.expected.maxFileSizeMb, 650);
});

test('color and dark-page checks are warnings or advisory only', () => {
  assert.equal(issue(api.analyze(basePayload({
    interior: 'black-white',
    pageColorStatsByPage: pageColorStats(120, [2, 3], { ratio: 0.004 }),
  })), 'color-in-bw-book').category, 'should-fix');

  assert.equal(issue(api.analyze(basePayload({
    interior: 'premium-color',
    pageColorStatsByPage: pageColorStats(120, [2]),
    pageCount: 120,
  })), 'bw-in-color-book').category, 'info');

  assert.equal(issue(api.analyze(basePayload({
    darkPageIndices: [1, 2, 3],
  })), 'dark-background-risk').category, 'info');
});

test('black-white setup with fully analyzed grayscale pages has no color mismatch', () => {
  const result = api.analyze(basePayload({
    interior: 'black-white',
    pageColorStatsByPage: pageColorStats(120),
  }));
  assert.equal(issue(result, 'color-in-bw-book'), undefined);
  assert.equal(issue(result, 'color-detection-skipped'), undefined);
  assert.equal(result.pageDiagnostics[1].finalStatus.canShowOk, true);
});

test('black-white setup with one small color-trace page is should-fix', () => {
  const result = api.analyze(basePayload({
    interior: 'black-white',
    pageColorStatsByPage: pageColorStats(120, [3], { ratio: 0.004 }),
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.equal(found.category, 'should-fix');
  assert.equal(found.status, 'warning');
  assert.equal(found.fixability, 'auto-fix');
  assert.equal(found.evidence.actual.meaningfulColorPages, 1);
});

test('black-white setup with many meaningful color pages is must-fix', () => {
  const result = api.analyze(basePayload({
    interior: 'black-white',
    pageCount: 20,
    pageColorStatsByPage: pageColorStats(20, [1, 2, 3], { ratio: 0.02 }),
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.equal(found.category, 'must-fix');
  assert.equal(found.status, 'blocking');
  assert.equal(found.confidence, 'high');
});

test('black-white setup with low-confidence color detection is should-fix, not must-fix', () => {
  const result = api.analyze(basePayload({
    interior: 'black-white',
    colorPageIndices: undefined,
    pageColorStatsByPage: {
      ...pageColorStats(120),
      1: { analyzed: true, hasColor: true, meaningfulColor: true, confidence: 'low' },
      2: { analyzed: true, hasColor: true, meaningfulColor: true, confidence: 'low' },
      3: { analyzed: true, hasColor: true, meaningfulColor: true, confidence: 'low' },
      4: { analyzed: true, hasColor: true, meaningfulColor: true, confidence: 'low' },
    },
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.equal(found.category, 'should-fix');
  assert.equal(found.confidence, 'low');
});

test('standard and premium color setup with zero color pages returns cost advisory, not must-fix', () => {
  for (const interior of ['standard-color', 'premium-color']) {
    const result = api.analyze(basePayload({ interior, paper: 'white', pageColorStatsByPage: pageColorStats(120) }));
    const found = issue(result, 'bw-in-color-book');
    assert.equal(found.category, 'should-fix');
    assert.equal(found.status, 'cost_advisory');
    assert.notEqual(found.category, 'must-fix');
    assert.equal(result.score, 100);
  }
});

test('standard-color setup with a few color pages returns info cost advisory only', () => {
  const result = api.analyze(basePayload({
    interior: 'standard-color',
    paper: 'white',
    pageCount: 120,
    pageColorStatsByPage: pageColorStats(120, [2, 8, 12, 24]),
  }));
  const found = issue(result, 'bw-in-color-book');
  assert.equal(found.category, 'info');
  assert.equal(found.status, 'cost_advisory');
  assert.equal(issue(result, 'color-in-bw-book'), undefined);
});

test('missing color metadata returns skipped issue, not fake color mismatch', () => {
  const result = api.analyze(basePayload({
    colorPageIndices: undefined,
    pageColorStatsByPage: undefined,
  }));
  const found = diagnostic(result, 'color-detection-skipped');
  assert.equal(found.category, 'info');
  assert.equal(found.status, 'skipped');
  assert.equal(found.fixability, 'info-only');
  assert.equal(issue(result, 'color-in-bw-book'), undefined);
  assert.equal(issue(result, 'bw-in-color-book'), undefined);
});

test('missing margin metadata is global skipped diagnostic, not a page issue or score penalty', () => {
  const result = api.analyze(basePayload({ contentBoundsByPage: undefined }));
  assert.equal(skipped(result, 'margins-and-gutter').status, 'skipped');
  assert.equal(diagnostic(result, 'margin-check-skipped').status, 'skipped');
  assert.equal(issue(result, 'margin-check-skipped'), undefined);
  assert.equal(issue(result, 'margin-gutter-risk'), undefined);
  assert.equal(result.score, 100);
  assert.equal(result.pageDiagnostics[1].finalStatus.hasRealIssue, false);
  assert.equal(result.pageDiagnostics[1].margin.analyzed, false);
});

test('full color analysis groups meaningful color pages in black-white setup', () => {
  const pageColorStatsByPage = {};
  for (let page = 1; page <= 10; page++) {
    pageColorStatsByPage[page] = {
      analyzed: true,
      hasColor: page === 2 || page === 5,
      meaningfulColor: page === 2 || page === 5,
      colorPixelRatio: page === 2 || page === 5 ? 0.02 : 0,
      confidence: 'high',
    };
  }
  const result = api.analyze(basePayload({
    pageCount: 10,
    pageColorStatsByPage,
    colorPageIndices: undefined,
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.deepEqual(JSON.parse(JSON.stringify(found.pageRefs)), [2, 5]);
});

test('full color PDF with black-white setup returns one grouped must-fix issue for most pages', () => {
  const colorPages = Array.from({ length: 80 }, (_, i) => i + 1);
  const result = api.analyze(basePayload({
    pageCount: 87,
    pageColorStatsByPage: pageColorStats(87, colorPages, { ratio: 0.02 }),
    colorPageIndices: undefined,
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.equal(found.title, 'Color content detected in a Black & White book');
  assert.equal(found.category, 'must-fix');
  assert.equal(found.status, 'blocking');
  assert.equal(found.affectedPageCount, 80);
  assert.equal(found.totalPageCount, 87);
  assert.equal(found.where, 'Most pages (80 of 87)');
  assert.equal(found.pageRefs.length, 80);
  assert.equal(result.pageDiagnostics[43].finalStatus.hasRealIssue, true);
  assert.equal(result.pageDiagnostics[45].finalStatus.canShowOk, false);
});

test('partial color analysis is skipped/incomplete and unanalyzed pages are not treated as passed', () => {
  const result = api.analyze(basePayload({
    pageCount: 10,
    colorPageIndices: undefined,
    pageColorStatsByPage: {
      1: { analyzed: true, hasColor: false, meaningfulColor: false, colorPixelRatio: 0 },
      2: { analyzed: true, hasColor: true, meaningfulColor: true, colorPixelRatio: 0.02 },
      3: { analyzed: true, hasColor: false, meaningfulColor: false, colorPixelRatio: 0 },
    },
  }));
  assert.equal(skipped(result, 'color-interior-mismatch').status, 'skipped');
  assert.equal(diagnostic(result, 'color-analysis-incomplete').status, 'skipped');
  assert.equal(result.pageDiagnostics[9].color.analyzed, false);
  assert.equal(result.pageDiagnostics[9].color.reasonCode, 'COLOR_ANALYSIS_MISSING');
  assert.equal(result.pageDiagnostics[9].finalStatus.canShowOk, false);
});

test('color metadata missing for many pages does not mark those pages OK', () => {
  const result = api.analyze(basePayload({
    pageCount: 87,
    colorPageIndices: undefined,
    pageColorStatsByPage: pageColorStats(20, [2, 5]),
  }));
  assert.equal(diagnostic(result, 'color-analysis-incomplete').status, 'skipped');
  assert.equal(result.pageDiagnostics[45].color.analyzed, false);
  assert.equal(result.pageDiagnostics[45].color.reasonCode, 'COLOR_ANALYSIS_MISSING');
  assert.equal(result.pageDiagnostics[45].finalStatus.canShowOk, false);
});

test('full grayscale PDF with black-white setup has no color issue when all pages are analyzed', () => {
  const result = api.analyze(basePayload({
    pageCount: 12,
    pageColorStatsByPage: pageColorStats(12),
    colorPageIndices: undefined,
  }));
  assert.equal(issue(result, 'color-in-bw-book'), undefined);
  assert.equal(diagnostic(result, 'color-analysis-incomplete'), undefined);
  assert.equal(result.pageDiagnostics[7].color.reasonCode, 'GRAYSCALE_PAGE');
  assert.equal(result.pageDiagnostics[7].finalStatus.canShowOk, true);
});

test('low saturation real color is still meaningful when ratio is above threshold', () => {
  const stats = pageColorStats(6);
  stats[4] = {
    analyzed: true,
    hasColor: true,
    meaningfulColor: true,
    colorPixelRatio: 0.004,
    saturatedColorPixelRatio: 0.004,
    saturationScore: 0.065,
    averageSaturation: 0.065,
    maxColorDelta: 11,
    totalPixelsSampled: 10000,
    colorLikePixels: 40,
    confidence: 'high',
    reasonCode: 'MEANINGFUL_COLOR_DETECTED',
    threshold: { colorDelta: 10, saturation: 0.06, hasColorRatio: 0.001, meaningfulRatio: 0.003 },
  };
  const result = api.analyze(basePayload({
    pageCount: 6,
    pageColorStatsByPage: stats,
    colorPageIndices: undefined,
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.equal(found.pageRefs.includes(4), true);
  assert.equal(result.pageDiagnostics[4].color.meaningfulColor, true);
});

test('similar same-size pages with meaningful color are consistently included', () => {
  const result = api.analyze(basePayload({
    pageCount: 60,
    pageBoxes: [
      { pageNumber: 35, printBox: { widthIn: 6, heightIn: 9 } },
      { pageNumber: 59, printBox: { widthIn: 6, heightIn: 9 } },
    ],
    colorPageIndices: undefined,
    pageColorStatsByPage: Object.fromEntries(
      Array.from({ length: 60 }, (_, i) => {
        const page = i + 1;
        const meaningful = page === 35 || page === 59;
        return [page, { analyzed: true, hasColor: meaningful, meaningfulColor: meaningful, colorPixelRatio: meaningful ? 0.02 : 0, confidence: 'high' }];
      })
    ),
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.equal(found.pageRefs.includes(35), true);
  assert.equal(found.pageRefs.includes(59), true);
  assert.equal(result.pageDiagnostics[35].color.reasonCode, 'MEANINGFUL_COLOR_DETECTED');
  assert.equal(result.pageDiagnostics[59].color.reasonCode, 'MEANINGFUL_COLOR_DETECTED');
});

test('tiny color noise below meaningful threshold is not critical color mismatch', () => {
  const result = api.analyze(basePayload({
    colorPageIndices: undefined,
    pageColorStatsByPage: {
      1: { analyzed: true, hasColor: true, meaningfulColor: false, colorPixelRatio: 0.0005, saturationScore: 0.04, confidence: 'high' },
      2: { analyzed: true, hasColor: false, meaningfulColor: false, colorPixelRatio: 0, confidence: 'high' },
    },
  }));
  assert.equal(issue(result, 'color-in-bw-book'), undefined);
  assert.equal(result.pageDiagnostics[1].color.reasonCode, 'ONLY_TINY_COLOR_NOISE');
});

test('color mismatch auto-fix issue points to grayscale conversion without changing trim analysis', () => {
  const result = api.analyze(basePayload({
    interior: 'black-white',
    pageColorStatsByPage: pageColorStats(120, [1], { ratio: 0.02 }),
  }));
  const found = issue(result, 'color-in-bw-book');
  assert.equal(found.fixability, 'auto-fix');
  assert.equal(found.fixActions[0].actionId, 'convert-to-black-white');
  assert.equal(found.fixActions[0].rerunAnalysisAfterFix, true);
  assert.equal(result.pageBoxes[0].expectedWidthIn, 6);
  assert.equal(result.pageBoxes[0].expectedHeightIn, 9);
  assert.equal(issue(result, 'selected-config-size-mismatch'), undefined);
});

test('changing setup to color reruns trim/interior/paper/page-count compatibility checks', () => {
  const result = api.analyze(basePayload({
    interior: 'standard-color',
    paper: 'white',
    pageCount: 50,
    pageColorStatsByPage: pageColorStats(50, [1, 2, 3]),
  }));
  assert.equal(issue(result, 'page-count-low').category, 'must-fix');
  assert.equal(issue(result, 'color-in-bw-book'), undefined);
});

test('kindle is explicitly out of scope', () => {
  const result = api.analyze(basePayload({ bookType: 'kindle' }));
  assert.equal(result.issues[0].title, 'Kindle/eBook validation is outside this print preflight checker.');
  assert.equal(result.issues[0].status, 'skipped');
});
