/**
 * Tests for src/lib/kdp/kdp-rules.ts
 *
 * These tests cover:
 *   - Bleed formula (official KDP: +0.125" width, +0.25" height)
 *   - getMarginRequirements() bracket lookups
 *   - getPrintCombinationRule() matrix lookups
 *   - validateSetupConfig() — all validation checks
 *
 * The worker-level tests remain in kdp-analysis-worker.test.mjs.
 * This file tests the shared TypeScript rules module directly via ESM transform.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

// Load the shared rules file via tsx/ts-node.
// Since the test runner uses Node's built-in test runner with .mjs extension,
// we use a dynamic import with ts-node/esm or read the compiled output.
// We import it at the top level and let Node resolve via tsconfig paths
// (or direct relative path if paths are not resolved in test environment).
// Using a relative path as a safe fallback:

let rules;
try {
  // Try project-aliased path first (works if ts-node/register or tsx is in effect)
  rules = await import('../src/lib/kdp/kdp-rules.ts');
} catch {
  // Fallback: direct relative path (same file, no alias)
  rules = await import('../src/lib/kdp/kdp-rules.ts');
}

const {
  getExpectedManuscriptSize,
  getMarginRequirements,
  getPrintCombinationRule,
  validateSetupConfig,
  KDP_BLEED_RULES,
  KDP_MARGIN_RULES,
  KDP_PRINT_MATRIX,
  KDP_RULE_VERSION,
} = rules;

// ---------------------------------------------------------------------------
// Bleed formula
// ---------------------------------------------------------------------------

test('getExpectedManuscriptSize: no-bleed returns trim size exactly', () => {
  const result = getExpectedManuscriptSize(6, 9, 'no-bleed');
  assert.equal(result.widthIn, 6);
  assert.equal(result.heightIn, 9);
  assert.equal(result.includesBleed, false);
});

test('getExpectedManuscriptSize: bleed adds 0.125" to width and 0.25" to height', () => {
  const result = getExpectedManuscriptSize(6, 9, 'bleed');
  assert.equal(result.widthIn, 6.125);
  assert.equal(result.heightIn, 9.25);
  assert.equal(result.includesBleed, true);
});

test('getExpectedManuscriptSize: 8.5x11 with bleed = 8.625 x 11.25', () => {
  const result = getExpectedManuscriptSize(8.5, 11, 'bleed');
  assert.equal(result.widthIn, 8.625);
  assert.equal(result.heightIn, 11.25);
});

test('getExpectedManuscriptSize: bleed width is +0.125 NOT +0.25', () => {
  // Critical: width must add 0.125 not 0.25
  const result = getExpectedManuscriptSize(6, 9, 'bleed');
  // Width diff should be 0.125
  assert.equal(result.widthIn - 6, 0.125, 'Width bleed add must be 0.125"');
  // Height diff should be 0.25
  assert.equal(result.heightIn - 9, 0.25, 'Height bleed add must be 0.25"');
  // Width and height bleed adds are DIFFERENT (not the same)
  assert.notEqual(result.widthIn - 6, result.heightIn - 9, 'Width bleed != height bleed');
});

test('getExpectedManuscriptSize: 5x8 with bleed = 5.125 x 8.25', () => {
  const result = getExpectedManuscriptSize(5, 8, 'bleed');
  assert.equal(result.widthIn, 5.125);
  assert.equal(result.heightIn, 8.25);
});

test('getExpectedManuscriptSize: 8.25x8.25 with bleed = 8.375 x 8.5', () => {
  const result = getExpectedManuscriptSize(8.25, 8.25, 'bleed');
  assert.equal(result.widthIn, 8.375);
  assert.equal(result.heightIn, 8.5);
});

test('KDP_BLEED_RULES constants are correct official values', () => {
  assert.equal(KDP_BLEED_RULES.BLEED_WIDTH_ADD_IN, 0.125);
  assert.equal(KDP_BLEED_RULES.BLEED_HEIGHT_ADD_IN, 0.25);
  assert.equal(KDP_BLEED_RULES.COVER_BLEED_IN, 0.125);
});

// ---------------------------------------------------------------------------
// Margin requirements
// ---------------------------------------------------------------------------

test('getMarginRequirements: returns correct bracket for page count ranges', () => {
  const r24 = getMarginRequirements(24);
  assert.equal(r24.insideIn, 0.375);
  assert.equal(r24.minPages, 24);
  assert.equal(r24.maxPages, 150);

  const r150 = getMarginRequirements(150);
  assert.equal(r150.insideIn, 0.375); // 150 is still in the first bracket

  const r151 = getMarginRequirements(151);
  assert.equal(r151.insideIn, 0.5);

  const r300 = getMarginRequirements(300);
  assert.equal(r300.insideIn, 0.5);

  const r301 = getMarginRequirements(301);
  assert.equal(r301.insideIn, 0.625);

  const r500 = getMarginRequirements(500);
  assert.equal(r500.insideIn, 0.625);

  const r501 = getMarginRequirements(501);
  assert.equal(r501.insideIn, 0.75);

  const r700 = getMarginRequirements(700);
  assert.equal(r700.insideIn, 0.75);

  const r701 = getMarginRequirements(701);
  assert.equal(r701.insideIn, 0.875);

  const r828 = getMarginRequirements(828);
  assert.equal(r828.insideIn, 0.875);
});

test('getMarginRequirements: returns null for page count outside all ranges', () => {
  assert.equal(getMarginRequirements(10), null);
  assert.equal(getMarginRequirements(0), null);
  assert.equal(getMarginRequirements(900), null);
});

test('getMarginRequirements: bleed outside margin is larger than no-bleed', () => {
  const r = getMarginRequirements(120);
  assert.ok(r.outsideBleedIn > r.outsideNoBleedIn, 'Bleed outside margin must be larger than no-bleed');
  assert.equal(r.outsideNoBleedIn, 0.25);
  assert.equal(r.outsideBleedIn, 0.375);
});

// ---------------------------------------------------------------------------
// Print matrix lookups
// ---------------------------------------------------------------------------

test('getPrintCombinationRule: valid 6x9 paperback black-white white returns rule', () => {
  const rule = getPrintCombinationRule('paperback', '6x9', 6, 9, 'black-white', 'white');
  assert.ok(rule !== null, 'Must find a valid rule');
  assert.equal(rule.bookType, 'paperback');
  assert.equal(rule.trimKey, '6x9');
  assert.equal(rule.interior, 'black-white');
  assert.equal(rule.paper, 'white');
  assert.equal(rule.minPages, 24);
  assert.equal(rule.maxPages, 828);
  assert.equal(rule.source, 'official-kdp');
});

test('getPrintCombinationRule: valid 6x9 hardcover black-white returns rule', () => {
  const rule = getPrintCombinationRule('hardcover', '6x9', 6, 9, 'black-white', 'white');
  assert.ok(rule !== null, 'Hardcover 6x9 must be supported');
  assert.equal(rule.bookType, 'hardcover');
  assert.equal(rule.minPages, 75);
  assert.equal(rule.maxPages, 550);
});

test('getPrintCombinationRule: standard-color cream returns null (unsupported)', () => {
  const rule = getPrintCombinationRule('paperback', '6x9', 6, 9, 'standard-color', 'cream');
  assert.equal(rule, null, 'standard-color + cream is not supported — must return null');
});

test('getPrintCombinationRule: premium-color cream returns null (unsupported)', () => {
  const rule = getPrintCombinationRule('paperback', '6x9', 6, 9, 'premium-color', 'cream');
  assert.equal(rule, null, 'premium-color + cream is not supported — must return null');
});

test('getPrintCombinationRule: hardcover standard-color returns null (not available)', () => {
  const rule = getPrintCombinationRule('hardcover', '6x9', 6, 9, 'standard-color', 'white');
  assert.equal(rule, null, 'Hardcover standard-color is not available — must return null');
});

test('getPrintCombinationRule: 8.5x11 hardcover returns null (not available)', () => {
  const rule = getPrintCombinationRule('hardcover', '8.5x11', 8.5, 11, 'black-white', 'white');
  assert.equal(rule, null, '8.5x11 hardcover is not in the KDP matrix — must return null');
});

test('getPrintCombinationRule: unknown trim key returns null', () => {
  const rule = getPrintCombinationRule('paperback', '4.4x8.8', 4.4, 8.8, 'black-white', 'white');
  assert.equal(rule, null, 'Non-KDP trim must return null');
});

// ---------------------------------------------------------------------------
// Print matrix structure
// ---------------------------------------------------------------------------

test('KDP_PRINT_MATRIX: all entries have required fields and valid source', () => {
  assert.ok(KDP_PRINT_MATRIX.length > 0, 'Matrix must not be empty');
  for (const entry of KDP_PRINT_MATRIX) {
    assert.ok(entry.bookType === 'paperback' || entry.bookType === 'hardcover', `Invalid bookType: ${entry.bookType}`);
    assert.ok(entry.trimKey, 'trimKey required');
    assert.ok(entry.trimWidthIn > 0, 'trimWidthIn must be positive');
    assert.ok(entry.trimHeightIn > 0, 'trimHeightIn must be positive');
    assert.ok(entry.minPages > 0, 'minPages must be positive');
    assert.ok(entry.maxPages >= entry.minPages, 'maxPages must be >= minPages');
    assert.equal(entry.source, 'official-kdp', 'source must be official-kdp');
  }
});

test('KDP_PRINT_MATRIX: hardcover entries all have page range 75–550', () => {
  const hardcoverEntries = KDP_PRINT_MATRIX.filter(e => e.bookType === 'hardcover');
  assert.ok(hardcoverEntries.length > 0, 'Must have hardcover entries');
  for (const entry of hardcoverEntries) {
    assert.equal(entry.minPages, 75, `Hardcover min must be 75: ${entry.trimKey}`);
    assert.equal(entry.maxPages, 550, `Hardcover max must be 550: ${entry.trimKey}`);
  }
});

test('KDP_PRINT_MATRIX: cream paper only appears for black-white interior', () => {
  const creamEntries = KDP_PRINT_MATRIX.filter(e => e.paper === 'cream');
  for (const entry of creamEntries) {
    assert.equal(entry.interior, 'black-white', `Cream paper entry must be black-white: ${entry.trimKey}`);
  }
});

// ---------------------------------------------------------------------------
// validateSetupConfig — comprehensive
// ---------------------------------------------------------------------------

function baseConfig(overrides = {}) {
  return {
    bookType: 'paperback',
    trimKey: '6x9',
    trimWidthIn: 6,
    trimHeightIn: 9,
    interior: 'black-white',
    paper: 'white',
    bleed: 'no-bleed',
    pageCount: 120,
    ...overrides,
  };
}

function issue(result, id) {
  return result.issues.find(i => i.id === id || i.issueType === id);
}

test('validateSetupConfig: valid 6x9 paperback returns ok=true', () => {
  const result = validateSetupConfig(baseConfig());
  assert.equal(result.ok, true);
  const blocking = result.issues.filter(i => i.category === 'must-fix');
  assert.equal(blocking.length, 0);
});

test('validateSetupConfig: standard-color + cream is must-fix', () => {
  const result = validateSetupConfig(baseConfig({ interior: 'standard-color', paper: 'cream' }));
  assert.equal(result.ok, false);
  const found = issue(result, 'interior-paper-incompatible');
  assert.ok(found, 'Must have interior-paper-incompatible issue');
  assert.equal(found.category, 'must-fix');
  assert.equal(found.issueType, 'unsupported-combination');
  assert.equal(found.source, 'official-kdp');
});

test('validateSetupConfig: premium-color + cream is must-fix', () => {
  const result = validateSetupConfig(baseConfig({ interior: 'premium-color', paper: 'cream' }));
  assert.equal(result.ok, false);
  const found = issue(result, 'interior-paper-incompatible');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
});

test('validateSetupConfig: black-white + cream is valid', () => {
  const result = validateSetupConfig(baseConfig({ interior: 'black-white', paper: 'cream', pageCount: 150 }));
  const found = issue(result, 'interior-paper-incompatible');
  assert.equal(found, undefined, 'black-white + cream should be valid');
});

test('validateSetupConfig: unknown trim returns unsupported-combination must-fix', () => {
  const result = validateSetupConfig(baseConfig({
    trimKey: 'unknown',
    trimWidthIn: 4.4,
    trimHeightIn: 8.8,
  }));
  assert.equal(result.ok, false);
  const found = issue(result, 'unsupported-combination');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
});

test('validateSetupConfig: hardcover 8.5x11 returns unsupported-combination must-fix', () => {
  const result = validateSetupConfig(baseConfig({
    bookType: 'hardcover',
    trimKey: '8.5x11',
    trimWidthIn: 8.5,
    trimHeightIn: 11,
    pageCount: 200,
  }));
  assert.equal(result.ok, false);
  const found = issue(result, 'unsupported-combination');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
});

test('validateSetupConfig: hardcover 50 pages returns page-count-low', () => {
  const result = validateSetupConfig(baseConfig({
    bookType: 'hardcover',
    trimKey: '6x9',
    trimWidthIn: 6,
    trimHeightIn: 9,
    pageCount: 50,
  }));
  assert.equal(result.ok, false);
  const found = issue(result, 'page-count-low');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
  assert.equal(found.evidence.expected.minPages, 75);
});

test('validateSetupConfig: hardcover 600 pages returns page-count-high', () => {
  const result = validateSetupConfig(baseConfig({
    bookType: 'hardcover',
    trimKey: '6x9',
    trimWidthIn: 6,
    trimHeightIn: 9,
    pageCount: 600,
  }));
  assert.equal(result.ok, false);
  const found = issue(result, 'page-count-high');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
  assert.equal(found.evidence.expected.maxPages, 550);
});

test('validateSetupConfig: hardcover 120 pages is valid', () => {
  const result = validateSetupConfig(baseConfig({
    bookType: 'hardcover',
    trimKey: '6x9',
    trimWidthIn: 6,
    trimHeightIn: 9,
    pageCount: 120,
  }));
  const found = issue(result, 'page-count-low') || issue(result, 'page-count-high');
  assert.equal(found, undefined, 'Hardcover 120 pages should be valid');
});

test('validateSetupConfig: paperback 829 pages returns page-count-high', () => {
  const result = validateSetupConfig(baseConfig({ pageCount: 829 }));
  assert.equal(result.ok, false);
  const found = issue(result, 'page-count-high');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
});

test('validateSetupConfig: missing page count returns page-count-unknown info (not must-fix)', () => {
  const result = validateSetupConfig(baseConfig({ pageCount: null }));
  // Info-level only — not a blocking issue
  const infoFound = issue(result, 'page-count-unknown');
  assert.ok(infoFound, 'Must show page-count-unknown info');
  assert.equal(infoFound.category, 'info');
  // No must-fix for missing page count
  const blocking = result.issues.filter(i => i.category === 'must-fix');
  assert.equal(blocking.length, 0, 'Missing page count must NOT be a blocking error');
  // Page count and margin checks are skipped
  assert.ok(result.checksSkipped.includes('page-count'), 'page-count must be in checksSkipped');
  assert.equal(result.marginRequirements, null);
});

test('validateSetupConfig: expectedManuscriptSize is correct for bleed and no-bleed', () => {
  const noBleed = validateSetupConfig(baseConfig({ bleed: 'no-bleed' }));
  assert.equal(noBleed.expectedManuscriptSize.widthIn, 6);
  assert.equal(noBleed.expectedManuscriptSize.heightIn, 9);
  assert.equal(noBleed.expectedManuscriptSize.includesBleed, false);

  const withBleed = validateSetupConfig(baseConfig({ bleed: 'bleed' }));
  assert.equal(withBleed.expectedManuscriptSize.widthIn, 6.125);
  assert.equal(withBleed.expectedManuscriptSize.heightIn, 9.25);
  assert.equal(withBleed.expectedManuscriptSize.includesBleed, true);
});

test('validateSetupConfig: margin requirements are returned for valid page count', () => {
  const result = validateSetupConfig(baseConfig({ pageCount: 120 }));
  assert.ok(result.marginRequirements !== null);
  assert.equal(result.marginRequirements.insideIn, 0.375);
});

test('validateSetupConfig: selectedPrintRule is returned for valid combo', () => {
  const result = validateSetupConfig(baseConfig());
  assert.ok(result.selectedPrintRule !== null);
  assert.equal(result.selectedPrintRule.bookType, 'paperback');
  assert.equal(result.selectedPrintRule.trimKey, '6x9');
});

test('validateSetupConfig: expanded distribution hardcover is must-fix', () => {
  const result = validateSetupConfig(baseConfig({
    bookType: 'hardcover',
    trimKey: '6x9',
    trimWidthIn: 6,
    trimHeightIn: 9,
    pageCount: 200,
    expandedDistributionEnabled: true,
  }));
  assert.equal(result.ok, false);
  const found = issue(result, 'expanded-distribution-hardcover');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
});

test('validateSetupConfig: unsupported book type returns must-fix and exits early', () => {
  const result = validateSetupConfig(baseConfig({ bookType: 'kindle' }));
  assert.equal(result.ok, false);
  const found = issue(result, 'unsupported-book-type');
  assert.ok(found);
  assert.equal(found.category, 'must-fix');
});

test('validateSetupConfig: all issues have required fields', () => {
  const result = validateSetupConfig(baseConfig({ interior: 'standard-color', paper: 'cream', pageCount: null }));
  for (const iss of result.issues) {
    assert.ok(iss.id, `Issue missing id: ${JSON.stringify(iss)}`);
    assert.ok(iss.title, `Issue missing title: ${iss.id}`);
    assert.ok(iss.category, `Issue missing category: ${iss.id}`);
    assert.ok(iss.source, `Issue missing source: ${iss.id}`);
    assert.ok(iss.howToFix, `Issue missing howToFix: ${iss.id}`);
    assert.ok(iss.whyMatters, `Issue missing whyMatters: ${iss.id}`);
  }
});

// ---------------------------------------------------------------------------
// Rule version
// ---------------------------------------------------------------------------

test('KDP_RULE_VERSION is a non-empty string', () => {
  assert.ok(typeof KDP_RULE_VERSION === 'string' && KDP_RULE_VERSION.length > 0);
});
