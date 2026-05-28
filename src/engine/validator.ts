import { BookConfig, CalculatedMeasurements, ValidationCheck, CheckStatus, PageIssue, PageIssueExtended, ValidationSummary, IssueCategory, KdpRiskLevel } from '@/types/kdp';
import {  MIN_COVER_DPI, SAFE_AREA_IN, BARCODE_AREA, BLEED_SIZE_IN } from './kdp-constants';
import { getExpectedManuscriptSize } from '@/lib/kdp/kdp-rules';

// ---------------------------------------------------------------------------
// KDP-Realistic Dimension Tolerances
// ---------------------------------------------------------------------------

/** ±0.02" — Perfect match, well within KDP accepted variance */
const TOLERANCE_OK_IN = 0.02;

/** 0.02"–0.125" — Slight variance, usually still accepted by KDP.
 *  KDP often accepts files with minor dimensional differences because:
 *  - Export rounding in tools like Canva, Word, InDesign
 *  - KDP's own processing pipeline has tolerance
 *  - Print production variance is normal
 */
const TOLERANCE_WARNING_IN = 0.125;

/** >0.125" — Major variance, likely wrong export settings */
// Anything above TOLERANCE_WARNING_IN is critical

// ---------------------------------------------------------------------------
// Spec Accuracy & KDP Risk — Dual Dimension Evaluation
// ---------------------------------------------------------------------------

interface DimensionEval {
  status: CheckStatus;
  message: string;
  diffIn: number;
  specAccuracy: 'exact' | 'slight-variance' | 'major-variance';
  kdpRisk: KdpRiskLevel;
}

/**
 * Evaluate a dimension against expected value with KDP-realistic tolerances.
 *
 * PHILOSOPHY: "Will this realistically cause problems on KDP?"
 * NOT: "Does this perfectly match spec?"
 */
function evaluateDimension(
  actual: number,
  expected: number,
): DimensionEval {
  const diff = Math.abs(actual - expected);
  const direction = actual < expected ? 'small' : 'large';

  if (diff <= TOLERANCE_OK_IN) {
    return {
      status: diff <= TOLERANCE_OK_IN * 0.5 ? 'pass' : 'safe',
      message: diff <= TOLERANCE_OK_IN * 0.5
        ? `Exactly matches KDP specification.`
        : `Within KDP accepted tolerance (±${TOLERANCE_OK_IN.toFixed(2)}"). This is perfectly fine.`,
      diffIn: diff,
      specAccuracy: 'exact',
      kdpRisk: 'safe',
    };
  } else if (diff <= TOLERANCE_WARNING_IN) {
    // Slight variance — KDP almost always accepts these
    return {
      status: 'warning',
      message: `Slightly outside official dimensions — ${direction === 'small' ? 'smaller' : 'larger'} by ${diff.toFixed(3)}". This is commonly caused by export rounding and KDP usually accepts it without issues.`,
      diffIn: diff,
      specAccuracy: 'slight-variance',
      kdpRisk: 'probably-ok',
    };
  } else {
    // Major variance — likely wrong export settings
    const isExtreme = diff > 0.5;
    return {
      status: isExtreme ? 'fail' : 'risk',
      message: isExtreme
        ? `Significantly ${direction === 'small' ? 'smaller' : 'larger'} than KDP specification by ${diff.toFixed(3)}". This likely indicates wrong export settings and may cause upload rejection or severe print scaling.`
        : `Page dimensions differ from your selected trim size by ${diff.toFixed(3)}". This is likely due to incorrect export settings. KDP may reject this or apply unwanted scaling.`,
      diffIn: diff,
      specAccuracy: 'major-variance',
      kdpRisk: isExtreme ? 'high-rejection' : 'print-risk',
    };
  }
}

// ---------------------------------------------------------------------------
// Compute expected manuscript dimensions (bleed-aware)
// ---------------------------------------------------------------------------

/**
 * When bleed is enabled, the manuscript PDF must include bleed area.
 * Official KDP rule: width +0.125", height +0.25".
 * Source: https://kdp.amazon.com/help/topic/GVBQ3CMEQW3W2VL6
 *
 * Uses getExpectedManuscriptSize() from src/lib/kdp/kdp-rules.ts
 * (single source of truth for the bleed formula).
 *
 * NOTE: The previous implementation incorrectly used bleedIn * 2 for BOTH
 * dimensions, adding 0.25" to the width instead of 0.125".
 */
function getExpectedManuscriptDimensions(
  config: BookConfig,
  measurements: CalculatedMeasurements,
): { widthIn: number; heightIn: number; includesBleed: boolean } {
  return getExpectedManuscriptSize(
    measurements.trimWidthIn,
    measurements.trimHeightIn,
    config.bleed,
  );
}

// ---------------------------------------------------------------------------
// Smart Export Detection Heuristics
// ---------------------------------------------------------------------------

interface ExportDiagnosis {
  /** What likely went wrong during export */
  likelyCause: string;
  /** How to fix it */
  fixHint: string;
  /** How KDP will likely handle this */
  kdpBehavior: string;
  /** Is this a partial bleed situation? */
  isPartialBleed?: boolean;
}

/**
 * Detect common export mistakes by comparing actual vs expected dimensions.
 * Provides intelligent, context-aware diagnosis.
 */
function diagnoseExportIssue(
  actualW: number,
  actualH: number,
  expectedW: number,
  expectedH: number,
  hasBleed: boolean,
  trimW: number,
  trimH: number,
): ExportDiagnosis | null {
  // Heuristic: PDF is exactly trim size but bleed is enabled → exported without bleed
  if (hasBleed) {
    const matchesTrimExactly =
      Math.abs(actualW - trimW) < TOLERANCE_OK_IN &&
      Math.abs(actualH - trimH) < TOLERANCE_OK_IN;

    if (matchesTrimExactly) {
      return {
        likelyCause: 'This PDF appears to be exported WITHOUT bleed, but your KDP configuration has bleed enabled.',
        fixHint: `Re-export with bleed enabled. The page size should be ${(trimW + BLEED_SIZE_IN * 2).toFixed(3)}" × ${(trimH + BLEED_SIZE_IN * 2).toFixed(3)}" (trim ${trimW}" × ${trimH}" plus 0.125" bleed on each side). In Canva, enable "Show print bleed" before exporting. In InDesign, include bleed in the export settings.`,
        kdpBehavior: 'KDP may still accept this file if your artwork doesn\'t extend to the page edges. However, if you have full-bleed backgrounds or edge-to-edge images, white strips may appear after trimming.',
        isPartialBleed: false,
      };
    }

    // Heuristic: Width is close to trim + one-side bleed only (0.125" instead of 0.25")
    const oneSideBleedW = trimW + BLEED_SIZE_IN;
    const oneSideBleedH = trimH + BLEED_SIZE_IN;
    const widthMatchesOneSide = Math.abs(actualW - oneSideBleedW) < TOLERANCE_OK_IN;
    const heightMatchesOneSide = Math.abs(actualH - oneSideBleedH) < TOLERANCE_OK_IN;

    if (widthMatchesOneSide || heightMatchesOneSide) {
      const dimension = widthMatchesOneSide ? 'horizontal' : 'vertical';
      return {
        likelyCause: `This PDF appears to include bleed on only one side in the ${dimension} dimension, instead of both sides.`,
        fixHint: `Ensure bleed is added symmetrically on ALL sides (0.125" on each edge). Expected size with full bleed: ${(trimW + BLEED_SIZE_IN * 2).toFixed(3)}" × ${(trimH + BLEED_SIZE_IN * 2).toFixed(3)}".`,
        kdpBehavior: 'KDP may accept this, but the side with missing bleed could result in thin white edges or slight cropping after trimming.',
        isPartialBleed: true,
      };
    }

    // Heuristic: Only one dimension has bleed
    const hasWidthBleed = Math.abs(actualW - (trimW + BLEED_SIZE_IN * 2)) < TOLERANCE_WARNING_IN;
    const hasHeightBleed = Math.abs(actualH - (trimH + BLEED_SIZE_IN * 2)) < TOLERANCE_WARNING_IN;
    if (hasWidthBleed !== hasHeightBleed) {
      const missingDimension = hasWidthBleed ? 'vertical (height)' : 'horizontal (width)';
      return {
        likelyCause: `This PDF has bleed in one dimension but appears to be missing it in the ${missingDimension} dimension.`,
        fixHint: `Ensure bleed is added on ALL sides. Expected size: ${(trimW + BLEED_SIZE_IN * 2).toFixed(3)}" × ${(trimH + BLEED_SIZE_IN * 2).toFixed(3)}".`,
        kdpBehavior: 'Partial bleed is a common export issue. KDP may still process the file, but the dimension without bleed risks white edges or content clipping.',
        isPartialBleed: true,
      };
    }
  }

  // Heuristic: PDF matches a common KDP trim size that isn't the selected one
  const commonSizes = [
    { w: 6, h: 9, label: '6" × 9"' },
    { w: 8.5, h: 11, label: '8.5" × 11"' },
    { w: 8, h: 10, label: '8" × 10"' },
    { w: 5.5, h: 8.5, label: '5.5" × 8.5"' },
    { w: 7, h: 10, label: '7" × 10"' },
    { w: 5.06, h: 7.81, label: 'Digest (5.06" × 7.81")' },
    { w: 8.27, h: 11.69, label: 'A4 (8.27" × 11.69")' },
  ];

  for (const size of commonSizes) {
    if (
      Math.abs(actualW - size.w) < TOLERANCE_OK_IN &&
      Math.abs(actualH - size.h) < TOLERANCE_OK_IN &&
      (Math.abs(trimW - size.w) > TOLERANCE_OK_IN || Math.abs(trimH - size.h) > TOLERANCE_OK_IN)
    ) {
      return {
        likelyCause: `This PDF matches the ${size.label} format, but you selected ${trimW}" × ${trimH}". The document was likely created for a different book format.`,
        fixHint: `Either re-export the document at ${trimW}" × ${trimH}"${hasBleed ? ` (with bleed: ${(trimW + BLEED_SIZE_IN * 2).toFixed(3)}" × ${(trimH + BLEED_SIZE_IN * 2).toFixed(3)}")` : ''}, or change the trim size setting to match your document.`,
        kdpBehavior: 'KDP will likely detect the mismatch and either reject the upload or scale the document to fit, which may distort your layout.',
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Bleed Intelligence — Content-Aware Analysis
// ---------------------------------------------------------------------------

interface BleedAssessment {
  /** Should this bleed issue be downgraded from critical? */
  canDowngrade: boolean;
  /** What kind of bleed problem is this? */
  problemType: 'missing' | 'partial' | 'incorrect-size';
  /** Practical risk explanation */
  practicalRisk: string;
  /** KDP risk level */
  kdpRisk: KdpRiskLevel;
}

/**
 * Assess bleed issues with content-aware intelligence.
 * Instead of treating ALL bleed mismatches as critical,
 * evaluate based on practical printing impact.
 */
function assessBleedIssue(
  actualW: number,
  actualH: number,
  expectedW: number,
  expectedH: number,
  hasBleed: boolean,
  trimW: number,
  trimH: number,
): BleedAssessment {
  if (!hasBleed) {
    return {
      canDowngrade: false,
      problemType: 'missing',
      practicalRisk: 'No bleed is required for this configuration.',
      kdpRisk: 'safe',
    };
  }

  const widthDiff = Math.abs(actualW - expectedW);
  const heightDiff = Math.abs(actualH - expectedH);
  const maxDiff = Math.max(widthDiff, heightDiff);

  // Is it exactly trim size? → Missing bleed entirely
  const matchesTrim =
    Math.abs(actualW - trimW) < TOLERANCE_OK_IN &&
    Math.abs(actualH - trimH) < TOLERANCE_OK_IN;

  if (matchesTrim) {
    // Missing bleed — but KDP often still accepts if content doesn't touch edges
    return {
      canDowngrade: true, // Downgrade from critical to warning
      problemType: 'missing',
      practicalRisk: 'Your document does not include bleed area, but KDP may still accept this file if:\n• Artwork is not edge-critical\n• Important content remains inside safe areas\n• No visible white edges appear after trimming\n\nPotential risks:\n• Slight edge cropping\n• Inconsistent bleed on printed copies\n\nRecommendation: Use full bleed dimensions for maximum compatibility.',
      kdpRisk: 'probably-ok',
    };
  }

  // Is it close but slightly off?
  if (maxDiff <= TOLERANCE_WARNING_IN) {
    return {
      canDowngrade: true,
      problemType: 'incorrect-size',
      practicalRisk: `Bleed dimensions are slightly off (${maxDiff.toFixed(3)}" variance). KDP commonly accepts files with this level of variance — it's typically caused by export rounding. If your artwork extends to the edges, there's a minor risk of thin white strips.`,
      kdpRisk: 'probably-ok',
    };
  }

  // Partial bleed detection
  const diagnosis = diagnoseExportIssue(actualW, actualH, expectedW, expectedH, true, trimW, trimH);
  if (diagnosis?.isPartialBleed) {
    return {
      canDowngrade: true,
      problemType: 'partial',
      practicalRisk: `Partial bleed detected. ${diagnosis.kdpBehavior}`,
      kdpRisk: 'probably-ok',
    };
  }

  // Major bleed variance
  return {
    canDowngrade: maxDiff < 0.25,
    problemType: 'incorrect-size',
    practicalRisk: `Bleed dimensions differ significantly from specification. This may cause print inconsistencies or edge issues on final copies.`,
    kdpRisk: maxDiff < 0.25 ? 'print-risk' : 'high-rejection',
  };
}

// ---------------------------------------------------------------------------
// Cover Validation
// ---------------------------------------------------------------------------

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
  const widthEval = evaluateDimension(analysis.widthIn, expectedWidth);
  const trimLabel = config.trimSize === 'custom'
    ? `${config.customWidth}" × ${config.customHeight}"`
    : config.trimSize.replace('x', '" × ') + '"';

  const widthKdpBehavior = widthEval.kdpRisk === 'safe'
    ? 'KDP will accept this without issues.'
    : widthEval.kdpRisk === 'probably-ok'
    ? 'KDP will likely accept this, but minor adjustments are recommended.'
    : widthEval.kdpRisk === 'print-risk'
    ? 'May cause print inconsistencies or scaling issues.'
    : 'High likelihood of upload rejection.';

  checks.push({
    id: 'cover-width',
    category: 'cover',
    name: 'Cover Width',
    description: `Full cover width (including spine, bleed, and wrap)`,
    status: widthEval.status,
    message: `Cover width is ${analysis.widthIn.toFixed(3)}", expected ${expectedWidth.toFixed(3)}". ${widthEval.message}`,
    suggestion: widthEval.status === 'fail' || widthEval.status === 'risk'
      ? `Adjust your cover width to ${expectedWidth.toFixed(3)}" for ${trimLabel} with ${measurements.spineWidthIn.toFixed(3)}" spine. This includes: front (${measurements.trimWidthIn}") + spine (${measurements.spineWidthIn.toFixed(3)}") + back (${measurements.trimWidthIn}") + bleed + wrap.`
      : widthEval.status === 'warning'
      ? `For best results, set cover width to ${expectedWidth.toFixed(3)}". ${widthKdpBehavior}`
      : undefined,
    value: analysis.widthIn,
    expected: expectedWidth,
  });

  // 2. Cover Height Check
  const expectedHeight = measurements.fullCoverHeightIn;
  const heightEval = evaluateDimension(analysis.heightIn, expectedHeight);

  const heightKdpBehavior = heightEval.kdpRisk === 'safe'
    ? 'KDP will accept this without issues.'
    : heightEval.kdpRisk === 'probably-ok'
    ? 'KDP will likely accept this, but minor adjustments are recommended.'
    : heightEval.kdpRisk === 'print-risk'
    ? 'May cause print inconsistencies or scaling issues.'
    : 'High likelihood of upload rejection.';

  checks.push({
    id: 'cover-height',
    category: 'cover',
    name: 'Cover Height',
    description: `Full cover height (including bleed and wrap)`,
    status: heightEval.status,
    message: `Cover height is ${analysis.heightIn.toFixed(3)}", expected ${expectedHeight.toFixed(3)}". ${heightEval.message}`,
    suggestion: heightEval.status === 'fail' || heightEval.status === 'risk'
      ? `Adjust your cover height to ${expectedHeight.toFixed(3)}" for ${trimLabel} with ${config.bleed === 'bleed' ? 'bleed enabled' : 'no bleed'}.`
      : heightEval.status === 'warning'
      ? `For best results, set cover height to ${expectedHeight.toFixed(3)}". ${heightKdpBehavior}`
      : undefined,
    value: analysis.heightIn,
    expected: expectedHeight,
  });

  // 3. Spine Width Check — Practical realism
  const expectedSpine = measurements.spineWidthIn;
  const actualSpine = analysis.widthIn - (2 * measurements.trimWidthIn) - (2 * measurements.bleedIn) - (2 * measurements.wrapAroundIn);
  const spineDiff = Math.abs(actualSpine - expectedSpine);

  let spineStatus: CheckStatus;
  let spineKdpRisk: KdpRiskLevel;
  let spineMessage: string;
  let spineSuggestion: string | undefined;

  if (spineDiff <= 0.01) {
    spineStatus = 'pass';
    spineKdpRisk = 'safe';
    spineMessage = `Spine width is ${actualSpine.toFixed(3)}", matching the calculated ${expectedSpine.toFixed(3)}" for ${config.pageCount} pages on ${config.paper} paper.`;
  } else if (spineDiff <= 0.05) {
    // Slight spine offset — usually fine on KDP
    spineStatus = 'warning';
    spineKdpRisk = 'probably-ok';
    spineMessage = `Spine width is slightly off (${actualSpine.toFixed(3)}" vs expected ${expectedSpine.toFixed(3)}"). This small variance is common and KDP typically accepts it.`;
    spineSuggestion = `For precision, update spine to ${expectedSpine.toFixed(3)}". However, this small difference rarely causes problems.`;
  } else {
    // Completely wrong spine width
    spineStatus = spineDiff > 0.25 ? 'fail' : 'risk';
    spineKdpRisk = spineDiff > 0.25 ? 'high-rejection' : 'print-risk';
    spineMessage = `Spine width is significantly off (${actualSpine.toFixed(3)}" vs expected ${expectedSpine.toFixed(3)}"). ${spineDiff > 0.25 ? 'This may cause KDP to reject the cover.' : 'Text on the spine may not align correctly when printed.'}`;
    spineSuggestion = `For ${config.pageCount} pages on ${config.paper} paper, spine should be approximately ${expectedSpine.toFixed(3)}". Update your page count or cover template accordingly.`;
  }

  checks.push({
    id: 'spine-width',
    category: 'cover',
    name: 'Spine Width',
    description: `Calculated spine width based on page count and paper type`,
    status: spineStatus,
    message: spineMessage,
    suggestion: spineSuggestion,
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
    status: hasBleed ? (analysis.hasBleed ? 'pass' : 'warning') : (analysis.hasBleed ? 'safe' : 'pass'),
    message: hasBleed
      ? (analysis.hasBleed ? 'Bleed area detected on cover — looks good.' : 'Bleed is enabled but no bleed area detected. This is usually fine if artwork doesn\'t extend to the edges, but adding 0.125" bleed is recommended for maximum compatibility.')
      : (analysis.hasBleed ? 'No bleed is selected, but bleed area was detected. This won\'t cause problems.' : 'No bleed required, and none detected — all good.'),
    suggestion: hasBleed && !analysis.hasBleed ? 'Adding 0.125" bleed on each side of your cover ensures artwork extends properly for trimming. However, KDP commonly accepts covers without explicit bleed if edge content is minimal.' : undefined,
  };
  checks.push(bleedCheck);

  // 5. Resolution / DPI Check — Realistic assessment
  const dpiStatus: CheckStatus = analysis.dpi >= MIN_COVER_DPI ? 'pass' : analysis.dpi >= 200 ? 'warning' : analysis.dpi >= 150 ? 'warning' : 'risk';
  const dpiKdpRisk: KdpRiskLevel = analysis.dpi >= MIN_COVER_DPI ? 'safe' : analysis.dpi >= 200 ? 'probably-ok' : analysis.dpi >= 150 ? 'print-risk' : 'high-rejection';

  let dpiMessage: string;
  let dpiSuggestion: string | undefined;

  if (analysis.dpi >= MIN_COVER_DPI) {
    dpiMessage = `Cover resolution is ${analysis.dpi} DPI — excellent quality for printing.`;
  } else if (analysis.dpi >= 200) {
    dpiMessage = `Cover resolution is approximately ${analysis.dpi} DPI. This is below the recommended 300 DPI, but KDP typically accepts it. Print quality may be slightly softened on close inspection.`;
    dpiSuggestion = 'For the sharpest print results, use 300 DPI. However, 200+ DPI usually prints acceptably and KDP rarely rejects for this alone.';
  } else if (analysis.dpi >= 150) {
    dpiMessage = `Cover resolution is approximately ${analysis.dpi} DPI. This is noticeably below recommended quality and may appear blurry in print.`;
    dpiSuggestion = 'Increase resolution to at least 300 DPI for reliable print quality. At this DPI, text and fine details may appear soft.';
  } else {
    dpiMessage = `Cover resolution is very low at approximately ${analysis.dpi} DPI. This will likely produce visibly blurry printing and may result in KDP quality warnings.`;
    dpiSuggestion = 'Increase your cover resolution to at least 300 DPI. At this resolution, the cover will look noticeably pixelated in print.';
  }

  checks.push({
    id: 'cover-dpi',
    category: 'cover',
    name: 'Image Resolution',
    description: 'Cover resolution for quality printing',
    status: dpiStatus,
    message: dpiMessage,
    suggestion: dpiSuggestion,
    value: analysis.dpi,
    expected: MIN_COVER_DPI,
  });

  // 6. Transparency Check — Downgraded from risk to warning
  if (analysis.hasTransparency) {
    checks.push({
      id: 'cover-transparency',
      category: 'cover',
      name: 'Transparency',
      description: 'KDP does not support transparent elements in PDF covers',
      status: 'warning',
      message: 'Transparency detected in cover PDF. KDP may flatten this automatically, but results can be unpredictable.',
      suggestion: 'Flatten all transparency before uploading for the most predictable results. Export as a flattened PDF without layers.',
    });
  }

  // 7. Barcode Safe Zone — Informational, not alarming
  checks.push({
    id: 'barcode-zone',
    category: 'cover',
    name: 'Barcode Safe Zone',
    description: `Bottom-right ${BARCODE_AREA.width}" × ${BARCODE_AREA.height}" area for KDP barcode`,
    status: 'safe',
    message: `Ensure the bottom-right ${BARCODE_AREA.width}" × ${BARCODE_AREA.height}" area of your back cover is clear for the KDP barcode. Amazon adds this automatically during publishing.`,
    suggestion: 'Keep the bottom-right area free of important text or images. KDP will overlay the barcode here.',
  });

  // 8. Color Mode Check
  if (analysis.isGrayscale && config.interior !== 'black-white') {
    checks.push({
      id: 'cover-color-mode',
      category: 'cover',
      name: 'Color Mode',
      description: 'Cover appears to be grayscale but color interior is selected',
      status: 'warning',
      message: 'Your cover appears to be in grayscale, but you selected a color interior. This won\'t cause rejection, but a color cover typically sells better with color interiors.',
      suggestion: 'Consider using a color cover for better visual appeal. This is a marketing suggestion, not a technical requirement.',
    });
  }

  return checks;
}

// ---------------------------------------------------------------------------
// Manuscript Validation
// ---------------------------------------------------------------------------

export function validateManuscript(
  analysis: PDFAnalysisResult,
  config: BookConfig,
  measurements: CalculatedMeasurements
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // Calculate expected manuscript dimensions (bleed-aware!)
  const expected = getExpectedManuscriptDimensions(config, measurements);

  // 1. Trim Size Check (bleed-aware, realistic)
  const widthEval = evaluateDimension(analysis.widthIn, expected.widthIn);
  const heightEval = evaluateDimension(analysis.heightIn, expected.heightIn);

  const trimLabel = config.trimSize === 'custom'
    ? `${config.customWidth}" × ${config.customHeight}"`
    : config.trimSize.replace('x', '" × ') + '"';

  checks.push({
    id: 'manuscript-trim-width',
    category: 'manuscript',
    name: 'Page Width',
    description: `Manuscript page width${expected.includesBleed ? ' (including bleed)' : ''}`,
    status: widthEval.status,
    message: `Manuscript width is ${analysis.widthIn.toFixed(3)}", expected ${expected.widthIn.toFixed(3)}"${expected.includesBleed ? ` (trim ${measurements.trimWidthIn}" + bleed)` : ''}. ${widthEval.message}`,
    suggestion: widthEval.status === 'fail' || widthEval.status === 'risk'
      ? expected.includesBleed
        ? `Export your manuscript at ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}" for ${trimLabel} with bleed. This is the trim size (${measurements.trimWidthIn}" × ${measurements.trimHeightIn}") plus 0.125" bleed on each side.`
        : `Set your document page size to ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}" to match the KDP ${trimLabel} trim size.`
      : widthEval.status === 'warning'
      ? `For best compatibility, set page width to ${expected.widthIn.toFixed(3)}". KDP usually accepts small variances like this.`
      : undefined,
    value: analysis.widthIn,
    expected: expected.widthIn,
  });

  checks.push({
    id: 'manuscript-trim-height',
    category: 'manuscript',
    name: 'Page Height',
    description: `Manuscript page height${expected.includesBleed ? ' (including bleed)' : ''}`,
    status: heightEval.status,
    message: `Manuscript height is ${analysis.heightIn.toFixed(3)}", expected ${expected.heightIn.toFixed(3)}"${expected.includesBleed ? ` (trim ${measurements.trimHeightIn}" + bleed)` : ''}. ${heightEval.message}`,
    suggestion: heightEval.status === 'fail' || heightEval.status === 'risk'
      ? expected.includesBleed
        ? `Export your manuscript at ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}" for ${trimLabel} with bleed.`
        : `Set your document page size to ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}" to match the KDP ${trimLabel} trim size.`
      : heightEval.status === 'warning'
      ? `For best compatibility, set page height to ${expected.heightIn.toFixed(3)}". KDP usually accepts small variances like this.`
      : undefined,
    value: analysis.heightIn,
    expected: expected.heightIn,
  });

  // 2. Smart Export Detection
  const diagnosis = diagnoseExportIssue(
    analysis.widthIn,
    analysis.heightIn,
    expected.widthIn,
    expected.heightIn,
    expected.includesBleed,
    measurements.trimWidthIn,
    measurements.trimHeightIn,
  );
  if (diagnosis && (widthEval.status !== 'pass' || heightEval.status !== 'pass')) {
    checks.push({
      id: 'manuscript-export-diagnosis',
      category: 'manuscript',
      name: 'Export Settings',
      description: 'Smart analysis of detected vs expected dimensions',
      status: widthEval.status === 'fail' || heightEval.status === 'fail' ? 'risk' : 'warning',
      message: diagnosis.likelyCause,
      suggestion: `${diagnosis.fixHint}\n\nReal KDP behavior: ${diagnosis.kdpBehavior}`,
    });
  }

  // 3. Page Count Check — Realistic
  if (config.pageCount !== analysis.pageCount) {
    const diff = Math.abs(config.pageCount - analysis.pageCount);
    const status: CheckStatus = diff <= 2 ? 'safe' : diff <= 10 ? 'warning' : 'risk';
    checks.push({
      id: 'manuscript-page-count',
      category: 'manuscript',
      name: 'Page Count',
      description: 'Actual page count vs configured page count',
      status,
      message: `Manuscript has ${analysis.pageCount} pages, but you configured ${config.pageCount}. ${status === 'safe' ? 'This small difference is normal and won\'t cause issues.' : status === 'warning' ? 'This difference is noticeable but KDP will still accept the file. The spine width calculation may be slightly off.' : 'This large difference may cause significant spine width calculation errors.'}`,
      suggestion: status !== 'safe' ? `Update the page count in Book Setup to ${analysis.pageCount} for accurate spine calculation.` : undefined,
      value: analysis.pageCount,
      expected: config.pageCount,
    });
  }

  // 4. Bleed Consistency Check — Intelligent, not alarmist
  const hasBleed = config.bleed === 'bleed';
  if (hasBleed && !analysis.hasBleed) {
    const bleedAssessment = assessBleedIssue(
      analysis.widthIn, analysis.heightIn,
      expected.widthIn, expected.heightIn,
      true, measurements.trimWidthIn, measurements.trimHeightIn,
    );
    checks.push({
      id: 'manuscript-bleed',
      category: 'manuscript',
      name: 'Bleed Consistency',
      description: 'Manuscript bleed area analysis',
      status: bleedAssessment.kdpRisk === 'high-rejection' ? 'risk' : 'warning',
      message: `Bleed is enabled but manuscript pages don't appear to include bleed area. ${bleedAssessment.practicalRisk.split('\n')[0]}`,
      suggestion: `Add 0.125" bleed to each edge of your manuscript pages. Expected page size with bleed: ${(measurements.trimWidthIn + BLEED_SIZE_IN * 2).toFixed(3)}" × ${(measurements.trimHeightIn + BLEED_SIZE_IN * 2).toFixed(3)}".\n\nHowever, if your artwork doesn't extend to the page edges, KDP will likely still accept this file.`,
    });
  }

  // 5. Margin Safety Check — Informational only
  checks.push({
    id: 'manuscript-margins',
    category: 'manuscript',
    name: 'Margin Safety',
    description: `Content should stay within ${SAFE_AREA_IN}" from edges`,
    status: 'safe',
    message: `Keep all important content at least ${SAFE_AREA_IN}" from page edges. This is a general guideline — KDP doesn't reject files for tight margins alone.`,
    suggestion: undefined,
  });

  // 6. Blank Pages Check — Context-aware
  if (analysis.blankPages.length > 0) {
    const ratio = analysis.blankPages.length / analysis.pageCount;
    const status: CheckStatus = ratio < 0.05 ? 'safe' : ratio < 0.15 ? 'warning' : 'risk';
    checks.push({
      id: 'manuscript-blank-pages',
      category: 'manuscript',
      name: 'Blank Pages',
      description: 'Blank pages detected in manuscript',
      status,
      message: `${analysis.blankPages.length} blank page(s) out of ${analysis.pageCount} total. ${status === 'safe' ? 'This is completely normal — many professional book layouts have intentional blank pages.' : status === 'warning' ? 'A notable number of blank pages. This may be intentional (chapter starts on right-hand pages) or may indicate missing content.' : 'A high percentage of blank pages may indicate missing content or a formatting issue.'}`,
      suggestion: status !== 'safe' ? 'Review blank pages to ensure they are intentional.' : undefined,
      value: analysis.blankPages.length,
    });
  }

  // 7. Page Size Consistency
  const uniqueWidths = new Set(analysis.pageWidths.map(w => Math.round(w * 100)));
  const uniqueHeights = new Set(analysis.pageHeights.map(h => Math.round(h * 100)));
  if (uniqueWidths.size > 1 || uniqueHeights.size > 1) {
    checks.push({
      id: 'manuscript-size-consistency',
      category: 'manuscript',
      name: 'Page Size Consistency',
      description: 'All pages should have consistent dimensions',
      status: 'warning',
      message: 'Inconsistent page sizes detected. KDP may still process this, but it could cause alignment issues in the final print.',
      suggestion: 'Ensure all pages in your manuscript have the same dimensions for the most predictable results.',
    });
  }

  // 8. Resolution Check — Realistic
  const lowResPages = analysis.imageResolutions.filter(r => r.dpi < MIN_COVER_DPI);
  if (lowResPages.length > 0) {
    const veryLowRes = lowResPages.filter(r => r.dpi < 150);
    const status: CheckStatus = veryLowRes.length > 0 ? 'risk' : 'warning';
    checks.push({
      id: 'manuscript-resolution',
      category: 'manuscript',
      name: 'Image Resolution',
      description: 'Image quality check',
      status,
      message: `${lowResPages.length} page(s) with images below 300 DPI. ${veryLowRes.length > 0 ? `${veryLowRes.length} of these are significantly below 200 DPI and may appear blurry in print.` : 'While below the recommended 300 DPI, these images are usually acceptable for print — they may appear slightly soft on close inspection but KDP rarely rejects for this.'}`,
      suggestion: status === 'risk'
        ? 'Replace very low-resolution images (below 150 DPI) with higher-quality versions. These will be visibly blurry in print.'
        : 'Consider replacing with higher resolution images for the best print quality, but don\'t worry too much — KDP accepts these in most cases.',
    });
  }

  return checks;
}

// ---------------------------------------------------------------------------
// Simulate PDF analysis
// ---------------------------------------------------------------------------

export function analyzePDFDimensions(
  widthPx: number,
  heightPx: number,
  pageCount: number,
  fileName: string
): PDFAnalysisResult {
  const estimatedDPI = 300;
  const widthIn = widthPx / estimatedDPI;
  const heightIn = heightPx / estimatedDPI;

  return {
    widthIn,
    heightIn,
    pageCount,
    hasBleed: false,
    dpi: estimatedDPI,
    isGrayscale: false,
    hasTransparency: false,
    blankPages: [],
    pageWidths: Array(pageCount).fill(widthIn),
    pageHeights: Array(pageCount).fill(heightIn),
    imageResolutions: [],
  };
}

// ---------------------------------------------------------------------------
// Overall status from checks
// ---------------------------------------------------------------------------

export function getOverallStatus(checks: ValidationCheck[]): CheckStatus {
  const statusPriority: CheckStatus[] = ['fail', 'risk', 'warning', 'safe', 'pass'];
  for (const status of statusPriority) {
    if (checks.some(c => c.status === status)) return status;
  }
  return 'pass';
}

// ---------------------------------------------------------------------------
// Per-page issue analysis (bleed-aware, config-driven, KDP-realistic)
// ---------------------------------------------------------------------------

/**
 * Analyze pages and generate per-page issues for the preview UX.
 * ALWAYS uses active config + measurements as the source of truth.
 * Bleed-aware: when bleed is enabled, expected dimensions = trim + bleed*2.
 *
 * PHILOSOPHY: "Will this realistically cause problems on KDP?"
 */
export function analyzePagesForIssues(
  pdfAnalysis: PDFAnalysisResult,
  config: BookConfig,
  measurements: CalculatedMeasurements
): PageIssueExtended[] {
  const issues: PageIssueExtended[] = [];
  const { trimWidthIn, trimHeightIn, bleedIn, safeAreaIn, gutterIn } = measurements;

  // Calculate expected manuscript dimensions (bleed-aware)
  const expected = getExpectedManuscriptDimensions(config, measurements);
  const hasBleed = config.bleed === 'bleed';

  // Trim size label for context-aware suggestions
  const trimLabel = config.trimSize === 'custom'
    ? `${config.customWidth}" × ${config.customHeight}"`
    : config.trimSize.replace('x', '" × ') + '"';

  for (let i = 0; i < pdfAnalysis.pageCount; i++) {
    const pageNum = i + 1;

    // 1. Page size mismatch — BLEED-AWARE comparison with realistic tolerances
    const pageW = pdfAnalysis.pageWidths[i] ?? expected.widthIn;
    const pageH = pdfAnalysis.pageHeights[i] ?? expected.heightIn;
    const widthDiff = Math.abs(pageW - expected.widthIn);
    const heightDiff = Math.abs(pageH - expected.heightIn);

    if (widthDiff > TOLERANCE_OK_IN || heightDiff > TOLERANCE_OK_IN) {
      // Determine severity using KDP-realistic tolerances
      const maxDiff = Math.max(widthDiff, heightDiff);

      let severity: CheckStatus;
      let specAccuracy: 'exact' | 'slight-variance' | 'major-variance';
      let kdpRisk: KdpRiskLevel;
      let realWorldImpact: string;

      if (maxDiff <= TOLERANCE_WARNING_IN) {
        // Slight variance — KDP usually accepts
        severity = 'warning';
        specAccuracy = 'slight-variance';
        kdpRisk = 'probably-ok';
        realWorldImpact = 'KDP commonly accepts files with this level of dimensional variance. It\'s typically caused by export rounding in tools like Canva, Word, or InDesign. You likely don\'t need to fix this unless you want maximum precision.';
      } else if (maxDiff <= 0.5) {
        // Moderate variance — may cause issues
        severity = 'risk';
        specAccuracy = 'major-variance';
        kdpRisk = 'print-risk';
        realWorldImpact = 'This variance may cause KDP to apply scaling or show a warning during upload. The printed result may have slight dimensional inconsistencies.';
      } else {
        // Major variance — likely rejection
        severity = 'fail';
        specAccuracy = 'major-variance';
        kdpRisk = 'high-rejection';
        realWorldImpact = 'This large dimensional difference likely indicates wrong export settings. KDP may reject the file or apply significant unwanted scaling.';
      }

      // Smart export detection for this page
      const diagnosis = diagnoseExportIssue(
        pageW, pageH,
        expected.widthIn, expected.heightIn,
        hasBleed,
        trimWidthIn, trimHeightIn,
      );

      const contextHint = hasBleed
        ? ` for ${trimLabel} with bleed`
        : ` for ${trimLabel}`;

      let suggestion: string;
      if (diagnosis) {
        suggestion = diagnosis.fixHint;
        if (diagnosis.kdpBehavior) {
          suggestion += `\n\nReal KDP behavior: ${diagnosis.kdpBehavior}`;
        }
        // If diagnosis says this is probably OK, downgrade severity
        if (diagnosis.isPartialBleed && severity === 'risk') {
          severity = 'warning';
          kdpRisk = 'probably-ok';
        }
      } else {
        suggestion = maxDiff <= TOLERANCE_WARNING_IN
          ? `Resize to ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}"${contextHint} for maximum compatibility. However, this small variance is usually fine.`
          : `Resize page ${pageNum} to ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}"${contextHint}.`;
      }

      issues.push({
        id: `page-${pageNum}-size`,
        page: pageNum,
        type: 'inconsistent-size',
        severity,
        message: maxDiff <= TOLERANCE_WARNING_IN
          ? `Page ${pageNum} size is slightly off (${pageW.toFixed(3)}" × ${pageH.toFixed(3)}" vs expected ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}")`
          : `Page ${pageNum} size (${pageW.toFixed(3)}" × ${pageH.toFixed(3)}") doesn't match expected dimensions${contextHint}`,
        description: maxDiff <= TOLERANCE_WARNING_IN
          ? `Minor variance of ${maxDiff.toFixed(3)}" — commonly caused by export rounding`
          : `Expected ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}"${hasBleed ? ` (trim ${trimWidthIn}" × ${trimHeightIn}" + bleed)` : ''}`,
        category: 'size',
        actual: `${pageW.toFixed(3)}" × ${pageH.toFixed(3)}"`,
        expected: `${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}"`,
        region: { xIn: 0, yIn: 0, widthIn: pageW, heightIn: pageH },
        suggestion,
        specAccuracy,
        kdpRisk,
        realWorldImpact,
      });
    }

    // 2. Blank page detection — contextual
    if (pdfAnalysis.blankPages.includes(pageNum)) {
      const isFrontMatter = pageNum <= 2;
      const isChapterStart = pageNum > 2 && pageNum % 2 === 1;
      issues.push({
        id: `page-${pageNum}-blank`,
        page: pageNum,
        type: 'blank-page',
        severity: isFrontMatter ? 'safe' : 'warning',
        message: `Page ${pageNum} appears to be blank`,
        description: isFrontMatter
          ? 'Front matter blank pages are normal and expected'
          : isChapterStart
          ? 'Blank pages before chapter starts are common in professional layouts'
          : 'Unexpected blank page — may be intentional or may indicate missing content',
        category: 'interior',
        actual: 'No content detected',
        expected: isFrontMatter || isChapterStart
          ? 'Blank pages are acceptable here'
          : 'Content should typically be present',
        region: { xIn: 0, yIn: 0, widthIn: pageW, heightIn: pageH },
        suggestion: isFrontMatter || isChapterStart
          ? 'This is fine — blank pages in this position are standard practice in book publishing.'
          : 'Check if this blank page is intentional (e.g., chapter starts on a right-hand page). If not, add the missing content.',
        specAccuracy: 'exact',
        kdpRisk: 'safe',
        isInformational: isFrontMatter,
      });
    }

    // 3. Low resolution images — realistic assessment
    const lowRes = pdfAnalysis.imageResolutions.find(r => r.page === pageNum);
    if (lowRes && lowRes.dpi < MIN_COVER_DPI) {
      let severity: CheckStatus;
      let kdpRisk: KdpRiskLevel;
      let realWorldImpact: string;

      if (lowRes.dpi < 150) {
        severity = 'risk';
        kdpRisk = 'print-risk';
        realWorldImpact = 'At this resolution, images will appear noticeably blurry in print. However, KDP rarely rejects files for low DPI alone — they typically just print as-is.';
      } else if (lowRes.dpi < 200) {
        severity = 'warning';
        kdpRisk = 'probably-ok';
        realWorldImpact = 'Images below 200 DPI may appear slightly soft in print, but KDP accepts them. Most readers won\'t notice unless comparing side-by-side with a higher DPI version.';
      } else {
        severity = 'warning';
        kdpRisk = 'probably-ok';
        realWorldImpact = 'Images at this DPI are close enough to 300 DPI that the difference is barely visible in print. KDP accepts these routinely.';
      }

      const imgW = pageW * 0.6;
      const imgH = pageH * 0.6;
      const imgX = pageW * 0.2;
      const imgY = pageH * 0.2;
      issues.push({
        id: `page-${pageNum}-lowdpi`,
        page: pageNum,
        type: 'low-dpi',
        severity,
        message: `Page ${pageNum} has images at ${lowRes.dpi} DPI (recommended: 300 DPI)`,
        description: severity === 'risk'
          ? 'Significantly below recommended resolution — will appear blurry'
          : 'Below recommended but usually prints acceptably',
        category: 'dpi',
        actual: `${lowRes.dpi} DPI`,
        expected: '300 DPI recommended',
        region: { xIn: imgX, yIn: imgY, widthIn: imgW, heightIn: imgH },
        suggestion: lowRes.dpi < 150
          ? `Replace the image on page ${pageNum} with a higher resolution version if possible. At ${lowRes.dpi} DPI, the printed result will be noticeably blurry.`
          : `The image on page ${pageNum} is below 300 DPI but will likely print acceptably. Consider upgrading for best quality, but this isn't urgent.`,
        specAccuracy: 'slight-variance',
        kdpRisk,
        realWorldImpact,
      });
    }

    // 4. Bleed issues — INTELLIGENT, content-aware
    if (hasBleed) {
      const hasBleedArea = pdfAnalysis.hasBleed;
      if (!hasBleedArea && pageNum > 2) {
        // Missing bleed — but assess whether this is actually critical
        const bleedAssessment = assessBleedIssue(
          pageW, pageH,
          expected.widthIn, expected.heightIn,
          true, trimWidthIn, trimHeightIn,
        );

        issues.push({
          id: `page-${pageNum}-bleed`,
          page: pageNum,
          type: 'bleed-problem',
          severity: bleedAssessment.kdpRisk === 'high-rejection' ? 'risk' : 'warning',
          message: `Page ${pageNum}: No bleed area detected`,
          description: bleedAssessment.practicalRisk.split('\n')[0],
          category: 'bleed',
          actual: 'No bleed area detected',
          expected: `${bleedIn}" bleed on all sides`,
          region: { xIn: 0, yIn: 0, widthIn: pageW, heightIn: pageH },
          suggestion: `Extend artwork by ${bleedIn}" beyond the trim line on all sides for full bleed compatibility. For ${trimLabel} books, the full page with bleed should be ${expected.widthIn.toFixed(3)}" × ${expected.heightIn.toFixed(3)}".\n\nHowever, KDP may still accept this if your content doesn't extend to the page edges.`,
          specAccuracy: 'major-variance',
          kdpRisk: bleedAssessment.kdpRisk,
          realWorldImpact: bleedAssessment.practicalRisk,
        });
      }
      // Note: We DON'T add a "bleed OK" informational issue for every page
      // to reduce noise. Only show bleed issues when there's actually a problem.
    }

    // 5. Margin safety — Only warn when there's actual danger
    const estimatedMarginSafety = safeAreaIn;
    const marginDanger = estimatedMarginSafety < 0.125;
    if (marginDanger) {
      issues.push({
        id: `page-${pageNum}-margin`,
        page: pageNum,
        type: 'margin-danger',
        severity: 'warning',
        message: `Page ${pageNum}: Content may be close to the trim edge`,
        description: 'Content near the trim edge could be cut during printing',
        category: 'margin',
        actual: `${estimatedMarginSafety.toFixed(3)}" from trim edge`,
        expected: `Minimum ${SAFE_AREA_IN}"`,
        region: {
          xIn: safeAreaIn,
          yIn: safeAreaIn,
          widthIn: pageW - safeAreaIn * 2,
          heightIn: pageH - safeAreaIn * 2,
        },
        suggestion: `Move content on page ${pageNum} at least ${SAFE_AREA_IN}" inward from page edges to ensure it's not trimmed during printing. However, KDP rarely rejects files for tight margins — this is more of a print quality concern.`,
        specAccuracy: 'slight-variance',
        kdpRisk: 'probably-ok',
        realWorldImpact: 'Tight margins may result in content being slightly cut off during printing, but KDP typically accepts these files. The risk is primarily visual quality.',
      });
    }

    // 6. Gutter — Informational, not alarming
    // Only show if gutter is notably tight; skip informational "safe" gutter entries
    const isLeftPage = pageNum % 2 === 0;
    if (gutterIn > 0 && gutterIn < 0.1) {
      const gutterSide = isLeftPage ? 'left' : 'right';
      const gutterEdgeX = isLeftPage ? pageW - gutterIn : 0;
      issues.push({
        id: `page-${pageNum}-gutter`,
        page: pageNum,
        type: 'margin-danger',
        severity: 'warning',
        message: `Page ${pageNum}: Tight gutter margin on ${gutterSide} side`,
        description: 'Text near the gutter may be harder to read when the book is bound',
        category: 'gutter',
        actual: `${(gutterIn * 100).toFixed(0)} mils from gutter`,
        expected: '0.1" minimum recommended',
        region: {
          xIn: gutterEdgeX,
          yIn: 0,
          widthIn: gutterIn,
          heightIn: pageH,
        },
        suggestion: `Consider increasing the inner margin on page ${pageNum}. Text in the gutter can be harder to read, but KDP doesn't reject files for this — it's a readability improvement.`,
        specAccuracy: 'slight-variance',
        kdpRisk: 'probably-ok',
        realWorldImpact: 'Content in the gutter area may be difficult to read when the book is open, but this won\'t cause KDP rejection.',
      });
    }

    // 7. Trim danger — INFORMATIONAL ONLY (de-emphasized)
    // We only add this if there are no other size issues for this page,
    // and we mark it as informational so the UI can de-emphasize it
    if (widthDiff <= TOLERANCE_OK_IN && heightDiff <= TOLERANCE_OK_IN) {
      // Page size is correct, but add a soft informational about trim safe area
      // ONLY if there are no other issues for this page already
      const hasOtherIssues = issues.some(iss => iss.page === pageNum && iss.id !== `page-${pageNum}-trim`);
      if (!hasOtherIssues) {
        issues.push({
          id: `page-${pageNum}-trim`,
          page: pageNum,
          type: 'trim-risk',
          severity: 'safe',
          message: `Page ${pageNum}: Content within ${safeAreaIn}" safe area`,
          description: 'Content should stay within the safe area for best print results',
          category: 'margin',
          actual: `Safe area is ${safeAreaIn}" from trim`,
          expected: `Minimum ${SAFE_AREA_IN}" safe area`,
          region: {
            xIn: safeAreaIn,
            yIn: safeAreaIn,
            widthIn: pageW - safeAreaIn * 2,
            heightIn: pageH - safeAreaIn * 2,
          },
          suggestion: `Keep important text and images at least ${safeAreaIn}" from every edge. This is a general best practice — not a strict KDP requirement.`,
          specAccuracy: 'exact',
          kdpRisk: 'safe',
          isInformational: true,
        });
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Compute validation summary
// ---------------------------------------------------------------------------

export function computeValidationSummary(issues: PageIssueExtended[]): ValidationSummary {
  const categories: IssueCategory[] = ['cover', 'interior', 'bleed', 'dpi', 'font', 'gutter', 'margin', 'size'];
  const byCategory: Record<IssueCategory, number> = {} as Record<IssueCategory, number>;
  for (const cat of categories) {
    byCategory[cat] = 0;
  }

  let fail = 0;
  let risk = 0;
  let warning = 0;
  let safe = 0;
  let pass = 0;

  // Count non-informational issues for summary (informational ones are de-emphasized)
  const significantIssues = issues.filter(i => !i.isInformational);

  for (const issue of significantIssues) {
    switch (issue.severity) {
      case 'fail': fail++; break;
      case 'risk': risk++; break;
      case 'warning': warning++; break;
      case 'safe': safe++; break;
      case 'pass': pass++; break;
    }
    if (byCategory[issue.category] !== undefined) {
      byCategory[issue.category]++;
    }
  }

  const total = significantIssues.length;

  let overallStatus: CheckStatus = 'pass';
  if (fail > 0) overallStatus = 'fail';
  else if (risk > 0) overallStatus = 'risk';
  else if (warning > 0) overallStatus = 'warning';
  else if (safe > 0) overallStatus = 'safe';

  // isReady = true when there are no rejection-risk issues
  const isReady = fail === 0 && risk === 0;

  return {
    total,
    fail,
    risk,
    warning,
    safe,
    pass,
    byCategory,
    overallStatus,
    isReady,
  };
}

// ---------------------------------------------------------------------------
// Generate summary text — Calm, realistic, publisher-friendly
// ---------------------------------------------------------------------------

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
    return `All ${total} checks passed. Your file looks ready for KDP upload — no issues detected.`;
  } else if (counts.fail > 0) {
    return `${counts.fail} critical issue(s) found that may cause KDP rejection. ${counts.risk + counts.warning} other items to review. ${good} checks passed.`;
  } else if (counts.risk > 0) {
    return `${counts.risk} issue(s) that may cause print inconsistencies. ${counts.warning} minor items worth reviewing. ${good} checks passed.`;
  } else {
    return `${counts.warning} minor item(s) found. These are commonly accepted by KDP but worth reviewing for best results. ${good} checks passed.`;
  }
}
