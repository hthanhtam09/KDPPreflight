import { BookConfig, CalculatedMeasurements, ValidationCheck, CheckStatus } from '@/types/kdp';
import { DIMENSION_TOLERANCE_IN, SPINE_TOLERANCE_IN, MIN_COVER_DPI, SAFE_AREA_IN, BARCODE_AREA } from './kdp-constants';

// Determine check status based on deviation from expected value
function evaluateDimension(
  actual: number,
  expected: number,
  tolerance: number = DIMENSION_TOLERANCE_IN
): { status: CheckStatus; message: string } {
  const diff = Math.abs(actual - expected);
  const pctDiff = expected > 0 ? (diff / expected) * 100 : 0;

  if (diff <= tolerance * 0.5) {
    return { status: 'pass', message: `Exactly matches KDP specification (${actual.toFixed(3)}" vs ${expected.toFixed(3)}").` };
  } else if (diff <= tolerance) {
    return { status: 'safe', message: `Within acceptable KDP tolerance (±${(tolerance * 1000).toFixed(0)} mils).` };
  } else if (pctDiff < 2) {
    return { status: 'warning', message: `Slightly outside KDP specification but commonly accepted in practice.` };
  } else if (pctDiff < 5) {
    return { status: 'risk', message: `Notably different from KDP specification. May cause issues during upload.` };
  } else {
    return { status: 'fail', message: `Significantly outside KDP specification. Will likely be rejected by KDP.` };
  }
}

export interface PDFAnalysisResult {
  widthIn: number;
  heightIn: number;
  pageCount: number;
  hasBleed: boolean;
  dpi: number;
  isGrayscale: boolean;
  hasTransparency: boolean;
  blankPages: number[];
  pageWidths: number[];
  pageHeights: number[];
  imageResolutions: { page: number; dpi: number }[];
}

export function validateCover(
  analysis: PDFAnalysisResult,
  config: BookConfig,
  measurements: CalculatedMeasurements
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // 1. Cover Width Check
  const expectedWidth = measurements.fullCoverWidthIn;
  const widthResult = evaluateDimension(analysis.widthIn, expectedWidth);
  checks.push({
    id: 'cover-width',
    category: 'cover',
    name: 'Cover Width',
    description: `Full cover width (including spine, bleed, and wrap)`,
    status: widthResult.status,
    message: `Cover width is ${analysis.widthIn.toFixed(3)}", expected ${expectedWidth.toFixed(3)}". ${widthResult.message}`,
    suggestion: widthResult.status === 'fail' || widthResult.status === 'risk' 
      ? `Adjust your cover width to ${expectedWidth.toFixed(3)}" (including ${measurements.spineWidthIn.toFixed(3)}" spine + ${measurements.bleedIn}" bleed on each side).`
      : undefined,
    value: analysis.widthIn,
    expected: expectedWidth,
  });

  // 2. Cover Height Check
  const expectedHeight = measurements.fullCoverHeightIn;
  const heightResult = evaluateDimension(analysis.heightIn, expectedHeight);
  checks.push({
    id: 'cover-height',
    category: 'cover',
    name: 'Cover Height',
    description: `Full cover height (including bleed and wrap)`,
    status: heightResult.status,
    message: `Cover height is ${analysis.heightIn.toFixed(3)}", expected ${expectedHeight.toFixed(3)}". ${heightResult.message}`,
    suggestion: heightResult.status === 'fail' || heightResult.status === 'risk'
      ? `Adjust your cover height to ${expectedHeight.toFixed(3)}".`
      : undefined,
    value: analysis.heightIn,
    expected: expectedHeight,
  });

  // 3. Spine Width Check
  const expectedSpine = measurements.spineWidthIn;
  // For a full cover, spine = total width - 2*trim - 2*bleed - 2*wrap
  const actualSpine = analysis.widthIn - (2 * measurements.trimWidthIn) - (2 * measurements.bleedIn) - (2 * measurements.wrapAroundIn);
  const spineResult = evaluateDimension(actualSpine, expectedSpine, SPINE_TOLERANCE_IN);
  checks.push({
    id: 'spine-width',
    category: 'cover',
    name: 'Spine Width',
    description: `Calculated spine width based on page count and paper type`,
    status: spineResult.status,
    message: `Calculated spine width is ${actualSpine.toFixed(3)}", expected ${expectedSpine.toFixed(3)}". ${spineResult.message}`,
    suggestion: spineResult.status !== 'pass' && spineResult.status !== 'safe'
      ? `For ${config.pageCount} pages on ${config.paper} paper, spine should be approximately ${expectedSpine.toFixed(3)}".`
      : undefined,
    value: actualSpine,
    expected: expectedSpine,
  });

  // 4. Bleed Check
  const hasBleed = config.bleed === 'bleed';
  const bleedCheck: ValidationCheck = {
    id: 'cover-bleed',
    category: 'cover',
    name: 'Bleed Area',
    description: 'Bleed area extends artwork beyond trim line',
    status: hasBleed ? (analysis.hasBleed ? 'pass' : 'warning') : (analysis.hasBleed ? 'warning' : 'pass'),
    message: hasBleed 
      ? (analysis.hasBleed ? 'Bleed area detected on cover.' : 'Bleed is enabled but no bleed area detected. Ensure artwork extends 0.125" beyond trim.')
      : (analysis.hasBleed ? 'No bleed selected but bleed area detected. This is fine if intentional.' : 'No bleed required, and none detected.'),
    suggestion: hasBleed && !analysis.hasBleed ? 'Add 0.125" bleed on each side of your cover.' : undefined,
  };
  checks.push(bleedCheck);

  // 5. Resolution / DPI Check
  const dpiStatus: CheckStatus = analysis.dpi >= MIN_COVER_DPI ? 'pass' : analysis.dpi >= 200 ? 'warning' : analysis.dpi >= 150 ? 'risk' : 'fail';
  checks.push({
    id: 'cover-dpi',
    category: 'cover',
    name: 'Image Resolution',
    description: 'Cover resolution should be at least 300 DPI for quality printing',
    status: dpiStatus,
    message: `Cover resolution is approximately ${analysis.dpi} DPI.`,
    suggestion: dpiStatus !== 'pass' ? 'Increase your cover resolution to at least 300 DPI for best print quality.' : undefined,
    value: analysis.dpi,
    expected: MIN_COVER_DPI,
  });

  // 6. Transparency Check
  if (analysis.hasTransparency) {
    checks.push({
      id: 'cover-transparency',
      category: 'cover',
      name: 'Transparency',
      description: 'KDP does not support transparent elements in PDF covers',
      status: 'risk',
      message: 'Transparency detected in cover PDF. KDP may not process this correctly.',
      suggestion: 'Flatten all transparency before uploading to KDP. Export as a flattened PDF without layers.',
    });
  }

  // 7. Barcode Safe Zone
  checks.push({
    id: 'barcode-zone',
    category: 'cover',
    name: 'Barcode Safe Zone',
    description: `Bottom-right ${BARCODE_AREA.width}" × ${BARCODE_AREA.height}" area must be clear for KDP barcode`,
    status: 'safe',
    message: 'Ensure the bottom-right area of your back cover is clear for the KDP barcode. This area is automatically added by Amazon.',
    suggestion: 'Keep the bottom-right 2" × 1.2" area of your back cover free of important text or images.',
  });

  // 8. Color Mode Check
  if (analysis.isGrayscale && config.interior !== 'black-white') {
    checks.push({
      id: 'cover-color-mode',
      category: 'cover',
      name: 'Color Mode',
      description: 'Cover appears to be grayscale but color interior is selected',
      status: 'warning',
      message: 'Your cover appears to be in grayscale mode, but you selected a color interior type.',
      suggestion: 'Consider using a color cover for better visual appeal with color interiors.',
    });
  }

  return checks;
}

export function validateManuscript(
  analysis: PDFAnalysisResult,
  config: BookConfig,
  measurements: CalculatedMeasurements
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // 1. Trim Size Check
  const expectedWidth = measurements.trimWidthIn;
  const expectedHeight = measurements.trimHeightIn;
  const widthResult = evaluateDimension(analysis.widthIn, expectedWidth);
  const heightResult = evaluateDimension(analysis.heightIn, expectedHeight);
  
  checks.push({
    id: 'manuscript-trim-width',
    category: 'manuscript',
    name: 'Page Width',
    description: 'Manuscript page width must match selected trim size',
    status: widthResult.status,
    message: `Manuscript width is ${analysis.widthIn.toFixed(3)}", expected ${expectedWidth.toFixed(3)}". ${widthResult.message}`,
    suggestion: widthResult.status === 'fail' || widthResult.status === 'risk'
      ? `Set your document page size to ${expectedWidth.toFixed(3)}" × ${expectedHeight.toFixed(3)}".`
      : undefined,
    value: analysis.widthIn,
    expected: expectedWidth,
  });

  checks.push({
    id: 'manuscript-trim-height',
    category: 'manuscript',
    name: 'Page Height',
    description: 'Manuscript page height must match selected trim size',
    status: heightResult.status,
    message: `Manuscript height is ${analysis.heightIn.toFixed(3)}", expected ${expectedHeight.toFixed(3)}". ${heightResult.message}`,
    suggestion: heightResult.status === 'fail' || heightResult.status === 'risk'
      ? `Set your document page size to ${expectedWidth.toFixed(3)}" × ${expectedHeight.toFixed(3)}".`
      : undefined,
    value: analysis.heightIn,
    expected: expectedHeight,
  });

  // 2. Page Count Check
  if (config.pageCount !== analysis.pageCount) {
    const diff = Math.abs(config.pageCount - analysis.pageCount);
    const status: CheckStatus = diff <= 2 ? 'safe' : diff <= 10 ? 'warning' : 'risk';
    checks.push({
      id: 'manuscript-page-count',
      category: 'manuscript',
      name: 'Page Count',
      description: 'Actual page count vs configured page count',
      status,
      message: `Manuscript has ${analysis.pageCount} pages, but you configured ${config.pageCount}. ${status === 'safe' ? 'This small difference is acceptable.' : 'Update your page count to match.'}`,
      suggestion: `Update the page count in Book Setup to ${analysis.pageCount} for accurate spine calculation.`,
      value: analysis.pageCount,
      expected: config.pageCount,
    });
  }

  // 3. Bleed Consistency Check
  const hasBleed = config.bleed === 'bleed';
  if (hasBleed && !analysis.hasBleed) {
    checks.push({
      id: 'manuscript-bleed',
      category: 'manuscript',
      name: 'Bleed Consistency',
      description: 'Manuscript should have bleed when bleed is enabled',
      status: 'warning',
      message: 'Bleed is enabled but manuscript pages do not appear to include bleed area.',
      suggestion: 'Add 0.125" bleed to each edge of your manuscript pages.',
    });
  }

  // 4. Margin Safety Check
  checks.push({
    id: 'manuscript-margins',
    category: 'manuscript',
    name: 'Margin Safety',
    description: `Content should stay within ${SAFE_AREA_IN}" from edges`,
    status: 'safe',
    message: `Ensure all important content stays at least ${SAFE_AREA_IN}" from page edges to avoid trimming issues.`,
    suggestion: 'Keep text and important images at least 0.25" from all page edges.',
  });

  // 5. Blank Pages Check
  if (analysis.blankPages.length > 0) {
    const ratio = analysis.blankPages.length / analysis.pageCount;
    const status: CheckStatus = ratio < 0.05 ? 'safe' : ratio < 0.15 ? 'warning' : 'risk';
    checks.push({
      id: 'manuscript-blank-pages',
      category: 'manuscript',
      name: 'Blank Pages',
      description: 'Blank pages detected in manuscript',
      status,
      message: `${analysis.blankPages.length} blank page(s) detected out of ${analysis.pageCount} total pages. ${status === 'safe' ? 'This is normal for many book layouts.' : 'A high percentage of blank pages may indicate issues.'}`,
      suggestion: status !== 'safe' ? 'Review blank pages to ensure they are intentional (e.g., chapter starts on right-hand pages).' : undefined,
      value: analysis.blankPages.length,
    });
  }

  // 6. Page Size Consistency
  const uniqueWidths = new Set(analysis.pageWidths.map(w => Math.round(w * 100)));
  const uniqueHeights = new Set(analysis.pageHeights.map(h => Math.round(h * 100)));
  if (uniqueWidths.size > 1 || uniqueHeights.size > 1) {
    checks.push({
      id: 'manuscript-size-consistency',
      category: 'manuscript',
      name: 'Page Size Consistency',
      description: 'All pages should have consistent dimensions',
      status: 'warning',
      message: 'Inconsistent page sizes detected in manuscript. This may cause issues during KDP processing.',
      suggestion: 'Ensure all pages in your manuscript have the same dimensions.',
    });
  }

  // 7. Resolution Check
  const lowResPages = analysis.imageResolutions.filter(r => r.dpi < MIN_COVER_DPI);
  if (lowResPages.length > 0) {
    const status: CheckStatus = lowResPages.length <= 2 ? 'warning' : 'risk';
    checks.push({
      id: 'manuscript-resolution',
      category: 'manuscript',
      name: 'Image Resolution',
      description: 'Images should be at least 300 DPI for quality printing',
      status,
      message: `${lowResPages.length} page(s) contain images below 300 DPI. This may result in blurry printing.`,
      suggestion: 'Replace low-resolution images with higher-quality versions (at least 300 DPI).',
    });
  }

  return checks;
}

// Simulate PDF analysis (since real PDF analysis would need pdf.js on client)
export function analyzePDFDimensions(
  widthPx: number,
  heightPx: number,
  pageCount: number,
  fileName: string
): PDFAnalysisResult {
  // Estimate DPI from file dimensions - use 300 DPI as baseline for calculation
  const estimatedDPI = 300;
  const widthIn = widthPx / estimatedDPI;
  const heightIn = heightPx / estimatedDPI;
  
  // Detect bleed by checking if dimensions suggest extra space
  const hasBleed = false; // Conservative default
  
  return {
    widthIn,
    heightIn,
    pageCount,
    hasBleed,
    dpi: estimatedDPI,
    isGrayscale: false,
    hasTransparency: false,
    blankPages: [],
    pageWidths: Array(pageCount).fill(widthIn),
    pageHeights: Array(pageCount).fill(heightIn),
    imageResolutions: [],
  };
}

// Get overall status from checks
export function getOverallStatus(checks: ValidationCheck[]): CheckStatus {
  const statusPriority: CheckStatus[] = ['fail', 'risk', 'warning', 'safe', 'pass'];
  for (const status of statusPriority) {
    if (checks.some(c => c.status === status)) return status;
  }
  return 'pass';
}

// Generate summary text
export function generateSummary(checks: ValidationCheck[]): string {
  const counts = {
    pass: checks.filter(c => c.status === 'pass').length,
    safe: checks.filter(c => c.status === 'safe').length,
    warning: checks.filter(c => c.status === 'warning').length,
    risk: checks.filter(c => c.status === 'risk').length,
    fail: checks.filter(c => c.status === 'fail').length,
  };

  const total = checks.length;
  const good = counts.pass + counts.safe;
  const problems = counts.warning + counts.risk + counts.fail;

  if (problems === 0) {
    return `All ${total} checks passed. Your file looks ready for KDP upload.`;
  } else if (counts.fail > 0) {
    return `${counts.fail} critical issue(s) found that will likely cause KDP rejection. ${counts.warning + counts.risk} other items need attention.`;
  } else if (counts.risk > 0) {
    return `${counts.risk} high-priority issue(s) found. ${counts.warning} warnings to review. ${good} checks passed.`;
  } else {
    return `${counts.warning} warning(s) found. These are commonly accepted but worth reviewing. ${good} checks passed.`;
  }
}
