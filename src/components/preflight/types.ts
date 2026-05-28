import type { BookType, TrimSizeKey, BleedType, PaperType, InteriorType } from '@/types/kdp'

export type KRStep = 'upload' | 'confirm' | 'issues' | 'fix' | 'export'
export type KRConfidence = 'high' | 'medium' | 'low'
export type KRConfigSource = 'detected' | 'user'
export type KRIssueCat = 'must-fix' | 'should-fix' | 'looks-good' | 'info'
export type KRFixability = 'auto-fix' | 'manual-review' | 'info-only'
export type KRIssueSeverity = 'critical' | 'warning' | 'info'
export type KRIssueStatus = 'blocking' | 'warning' | 'print_advisory' | 'cost_advisory' | 'info' | 'skipped'
export type KRIssueSource = 'official-kdp' | 'derived-from-kdp-formula' | 'best-effort' | 'missing-metadata'
export type KRIssueClassification =
  | 'blockingIssue'
  | 'warningIssue'
  | 'advisoryIssue'
  | 'costAdvisory'
  | 'skippedCheck'
  | 'passedCheck'

export type ValidationScope = 'page' | 'cover' | 'spread' | 'setup' | 'book' | 'spine' | 'technical'
export type KRIssueScope = ValidationScope

export type KRIssueType =
  | 'bleed-missing'
  | 'size-mismatch'
  | 'page-count-low'
  | 'page-count-high'
  | 'inconsistent-pages'
  | 'blank-pages'
  | 'pdf-too-large'
  | 'oversized-file-risk'
  | 'odd-even-pages'
  | 'spine-width-risk'
  | 'color-in-bw-book'
  | 'bw-in-color-book'
  | 'dark-background-risk'
  | 'blurry-page-risk'
  | 'cover-size-mismatch'
  | 'cover-bleed-missing'
  | 'spine-text-risk'
  | 'cover-barcode-conflict'
  | 'cover-low-quality'
  | 'unsupported-combination'
  | 'metadata-skipped'
  | 'margin-gutter-risk'
  | 'cover-page-count'
  | 'cover-production-artifact'
  | 'locked-pdf'
  | 'pdf-annotations'
  | 'pdf-form-fields'
  | 'pdf-transparency'
  | 'pdf-layers'
  | 'crop-marks'
  | 'trim-marks'
  | 'printer-marks'
  | 'two-page-spreads'
  | 'mixed-orientation'
  | 'fonts-not-embedded'
  | 'pagination-sequence'
  | 'kindle-out-of-scope'
  | 'color-detection-skipped'

export interface KRDetectedSettings {
  configSource: KRConfigSource
  configLocked: boolean
  lastUpdated: number
  validationConfigHash?: string
  bookType: BookType
  trimSize: TrimSizeKey
  bleed: BleedType
  paper: PaperType
  interior: InteriorType
  pageCount: number
  widthIn: number
  heightIn: number
  orientation: 'portrait' | 'landscape'
  confidence: {
    trimSize: KRConfidence
    bleed: KRConfidence
  }
}

export interface KRIssue {
  id: string
  category: KRIssueCat
  fixability: KRFixability
  severity?: KRIssueSeverity
  status?: KRIssueStatus
  title: string
  whyMatters: string
  where: string
  howToFix: string
  pageRefs: number[]
  issueType: KRIssueType
  scope: KRIssueScope
  confidence?: KRConfidence
  source?: KRIssueSource
  classification?: KRIssueClassification
  affectedPageCount?: number
  totalPageCount?: number
  evidence?: {
    actual?: unknown
    expected?: unknown
    rule?: string
    payloadFieldsUsed?: string[]
    notes?: string
  }
  fixActions?: Array<{
    actionId: string
    label: string
    description: string
    riskLevel: 'low' | 'medium' | 'high'
    requiresUserConfirmation: true
    rerunAnalysisAfterFix: true
  }>
}

export interface KRSkippedCheck {
  checkId: string
  reason: string
  missingMetadata: string[]
  source: 'missing-metadata'
  status: 'skipped'
}

export interface KRPageDiagnostics {
  pageSize: {
    actualWidthIn: number | null
    actualHeightIn: number | null
    expectedWidthIn: number | null
    expectedHeightIn: number | null
    passed: boolean
    reasonCode: string
  }
  color: {
    analyzed: boolean
    hasColor: boolean
    meaningfulColor: boolean
    totalPixelsSampled?: number
    colorLikePixels?: number
    colorPixelRatio: number | null
    saturatedColorPixelRatio?: number
    averageSaturation?: number
    saturationScore?: number
    maxColorDelta?: number
    threshold?: {
      colorDelta: number
      saturation: number
      hasColorRatio?: number
      meaningfulRatio: number
    }
    confidence: KRConfidence
    reasonCode: string
  }
  margin: {
    analyzed: boolean
    skippedReason: string | null
    passed: boolean | null
    reasonCode: string
  }
  finalStatus: {
    hasRealIssue: boolean
    hasIncompleteRequiredChecks?: boolean
    canShowOk?: boolean
    criticalCount: number
    warningCount: number
    advisoryCount: number
    skippedCount: number
  }
}

export interface KRScanState {
  phase: 'idle' | 'reading' | 'detecting' | 'scanning' | 'analyzing' | 'done' | 'error' | 'cancelled'
  pagesScanned: number
  totalPages: number
  errorMessage: string | null
}

export interface KRScanData {
  widthIn: number
  heightIn: number
  pageCount: number
  pageWidths: number[]
  pageHeights: number[]
  pageBoxes: KRPageBoxDebug[]
  blankPageIndices: number[]
  firstPageDataUrl: string | null
  colorPageIndices: number[]
  grayscalePageIndices?: number[]
  pageColorStatsByPage?: Record<number, {
    analyzed?: boolean
    hasColor: boolean
    meaningfulColor?: boolean
    colorPixelRatio?: number
    saturatedColorPixelRatio?: number
    saturationScore?: number
    averageSaturation?: number
    maxColorDelta?: number
    totalPixelsSampled?: number
    colorLikePixels?: number
    isMostlyGrayscale?: boolean
    confidence?: KRConfidence
    reasonCode?: string
    threshold?: {
      colorDelta: number
      saturation: number
      hasColorRatio?: number
      meaningfulRatio: number
    }
  }>
  darkPageIndices: number[]
  blurryPageIndices: number[]
  fileSizeMb: number
}

export interface KRBoxSize {
  widthPt: number
  heightPt: number
  widthIn: number
  heightIn: number
  source: 'pdfjs-view' | 'unavailable'
}

export interface KRPageBoxDebug {
  pageNumber: number
  mediaBox: KRBoxSize | null
  cropBox: KRBoxSize | null
  trimBox: KRBoxSize | null
  bleedBox: KRBoxSize | null
  printBox: KRBoxSize
  printBoxUsed: 'trimBox' | 'bleedBox' | 'cropBox' | 'mediaBox' | 'pdfjs-view'
  expectedWidthIn: number | null
  expectedHeightIn: number | null
  diffWidthIn: number | null
  diffHeightIn: number | null
  validationResult: 'ok' | 'should-check' | 'must-fix'
  reasonCode: string
  dominantWidthIn?: number | null
  dominantHeightIn?: number | null
  dominantDiffWidthIn?: number | null
  dominantDiffHeightIn?: number | null
  validationSource?: 'document-level' | 'page-level' | 'setup-level'
}

export interface KRColorRisk {
  colorPageCount: number
  darkPageCount: number
  colorPageIndices: number[]
  darkPageIndices: number[]
  riskLevel: 'low' | 'medium' | 'high'
  riskSummary: string
}

export interface KRCoverData {
  widthIn: number
  heightIn: number
  dataUrl: string | null
  expectedFullWidthIn: number
  expectedFullHeightIn: number
  spineWidthIn: number
  trimWidthIn: number
  trimHeightIn: number
  bleedIn: number
}

export interface KRResult {
  fileFingerprint: string
  validationConfigHash: string
  cacheKey: string
  score: number
  verdict: string
  verdictLevel: 'good' | 'caution' | 'danger'
  issues: KRIssue[]
  settings: KRDetectedSettings
  fileNames: { manuscript: string; cover: string | null }
  fileSize: number
  fileSizeMb: number
  colorRisk: KRColorRisk | null
  spineWidthIn: number | null
  pageBoxes: KRPageBoxDebug[]
  coverData: KRCoverData | null
  checksPerformed?: string[]
  checksSkipped?: KRSkippedCheck[]
  missingMetadata?: string[]
  globalDiagnostics?: KRIssue[]
  internalDiagnostics?: unknown[]
  pageDiagnostics?: Record<number, KRPageDiagnostics>
  ruleVersion?: string
  officialSourcesUsed?: string[]
}

export interface KRExportResult {
  blob: Blob | null
  originalSizeMb: number
  fixedSizeMb: number | null
  operationsApplied: string[]
  pagesProcessed: number
  issuesFixed: number
}
