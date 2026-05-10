// KDP Book Types and Constants

// 3D Preview flow steps
export type PreviewFlowStep = 'import' | 'config' | 'generate' | 'preview';

// Camera preset views for 3D preview
export type CameraPreset = 'front' | 'back' | 'spine' | 'open-spread' | 'page-detail' | 'free';

// Auto-detected configuration from uploaded files
export interface DetectedConfig {
  trimSize?: TrimSizeKey;
  customWidth?: number;
  customHeight?: number;
  bleed?: BleedType;
  pageCount?: number;
  bookType?: BookType;
  paper?: PaperType;
  confidence: number; // 0-1
}

export type TrimSizeKey = '5x8' | '5.25x8' | '5.5x8.5' | '6x9' | '7x10' | '7.44x9.69' | '8x10' | '8.25x6' | '8.25x8.25' | '8.5x8.5' | '8.5x11' | 'custom';

export type BleedType = 'bleed' | 'no-bleed';

export type PaperType = 'white' | 'cream' | 'premium-color';

export type InteriorType = 'black-white' | 'standard-color' | 'premium-color';

export type BindingType = 'paperback' | 'hardcover';

export type CheckStatus = 'pass' | 'safe' | 'warning' | 'risk' | 'fail';

// Generation step for progressive 3D preview generation
export type GenerationPhase =
  | 'idle'
  | 'analyzing'
  | 'preparing-structure'
  | 'rendering-interior'
  | 'building-cover'
  | 'optimizing'
  | 'complete'
  | 'error';

export interface GenerationProgress {
  phase: GenerationPhase;
  phaseLabel: string;
  phaseIcon: string;
  progress: number; // 0-100
  details?: string;
}

/** Real KDP risk level — how likely is this to cause problems on actual KDP? */
export type KdpRiskLevel =
  | 'safe'              // 🟢 Safe for KDP — no practical concern
  | 'probably-ok'       // 🟡 Probably acceptable, but improvement recommended
  | 'print-risk'        // 🟠 May cause print inconsistencies
  | 'high-rejection';   // 🔴 High rejection risk

// Book type for the checker workflow
export type BookType = 'kindle' | 'paperback' | 'hardcover';

// Checker workflow steps
export type CheckerStep = 'import' | 'config' | 'preview';

// Preview view modes
export type PreviewViewMode = 'single' | 'spread';

// Preview content modes — 'book' is the unified flow
export type PreviewContentMode = 'book' | 'cover' | 'manuscript';

// Book page section types for unified preview
export type BookSection = 'blank' | 'full-cover' | 'interior';

// Single entry in the unified book model
export interface BookPage {
  id: string;                        // unique: 'blank', 'cover', 'p1'...'pN'
  section: BookSection;              // which part of the book
  label: string;                     // display label: 'Blank', 'Full Cover', 'Page 1', etc.
  manuscriptIndex?: number;          // 1-based page number in manuscript PDF (interior only)
  dataUrl?: string;                  // rendered page image
  isBlank: boolean;                  // blank placeholder page
  isCoverPage: boolean;              // true for the full cover spread
  coverSide?: 'front' | 'back' | 'spine'; // which part of cover wrap (kept for compatibility)
  widthIn?: number;                  // page width in inches (cover is wider than interior)
  heightIn?: number;                 // page height in inches
}

// Overlay toggle types
export type OverlayType = 'bleed' | 'trim' | 'safe-area' | 'gutter' | 'hinge' | 'crop' | 'spine' | 'barcode';

// Page analysis intelligence
export type PageContentType = 'text' | 'image-heavy' | 'blank' | 'mixed';

export interface PageIssue {
  id: string;
  page: number;
  type: 'margin-danger' | 'trim-risk' | 'low-dpi' | 'clipped-artwork' | 'font-issue' | 'bleed-problem' | 'blank-page' | 'duplicate-page' | 'upside-down' | 'low-contrast' | 'oversized-image' | 'inconsistent-size';
  severity: CheckStatus;
  message: string;
  description?: string;
}

export interface PageAnalysis {
  index: number;
  widthIn: number;
  heightIn: number;
  dpi: number;
  imageCount: number;
  contentType: PageContentType;
  isBlank: boolean;
  isDuplicate: boolean;
  isUpsideDown: boolean;
  hasClippedContent: boolean;
  hasLowContrast: boolean;
  hasBleedIssue: boolean;
  marginSafety: 'safe' | 'caution' | 'danger';
  colorCoverage: number;
  issues: PageIssue[];
  dataUrl?: string;
}

export interface TrimSize {
  key: TrimSizeKey;
  label: string;
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  widthPx: number;
  heightPx: number;
}

export type ReadingDirection = 'ltr' | 'rtl';
export type CoverFinish = 'matte' | 'glossy';

export interface BookConfig {
  trimSize: TrimSizeKey;
  customWidth?: number;
  customHeight?: number;
  bleed: BleedType;
  paper: PaperType;
  interior: InteriorType;
  pageCount: number;
  binding: BindingType;
  bookType: BookType;
  readingDirection?: ReadingDirection;
  coverFinish?: CoverFinish;
}

export interface CalculatedMeasurements {
  trimWidthIn: number;
  trimHeightIn: number;
  bleedIn: number;
  spineWidthIn: number;
  fullCoverWidthIn: number;
  fullCoverHeightIn: number;
  safeAreaIn: number;
  barcodeAreaIn: { x: number; y: number; width: number; height: number };
  wrapAroundIn: number;
  gutterIn: number;
  hingeIn: number;
}

export interface ValidationCheck {
  id: string;
  category: 'cover' | 'manuscript' | 'general' | 'kindle';
  name: string;
  description: string;
  status: CheckStatus;
  message: string;
  suggestion?: string;
  value?: number;
  expected?: number;
  tolerance?: number;
  page?: number;
}

export interface ValidationReport {
  fileId: string;
  fileName: string;
  fileType: 'cover' | 'manuscript' | 'kindle';
  checks: ValidationCheck[];
  overallStatus: CheckStatus;
  summary: string;
  timestamp: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  pageCount?: number;
  dimensions?: { width: number; height: number };
  dataUrl?: string;
}

export interface PageTexture {
  index: number;
  texture: string; // data URL or canvas
  width: number;
  height: number;
}

export type AppView = 'landing' | 'setup' | 'checker' | 'preview';

export interface AppState {
  view: AppView;
  bookConfig: BookConfig;
  measurements: CalculatedMeasurements | null;
  uploadedCover: UploadedFile | null;
  uploadedManuscript: UploadedFile | null;
  validationReports: ValidationReport[];
  coverTextures: PageTexture[];
  manuscriptTextures: PageTexture[];
  isProcessing: boolean;
  processingMessage: string;
}

// Auto-detection result from import analysis
export interface ImportAnalysis {
  bookType: BookType;
  trimSize: TrimSizeKey;
  customWidth?: number;
  customHeight?: number;
  bleed: BleedType;
  paper: PaperType;
  interior: InteriorType;
  pageCount: number;
  binding: BindingType;
  orientation: 'portrait' | 'landscape';
  detectedDpi: number;
  hasEmbeddedFonts: boolean;
  colorProfile: string;
  confidence: number; // 0-1 how confident the detection is
}

// Processing step for animated states
export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}

// Preview asset cache — built during import, used instantly in preview
export interface PreviewAssetCache {
  pages: Map<number, string>;        // manuscript page index → data URL
  thumbnails: Map<number, string>;   // page index → thumbnail data URL
  coverDataUrl: string;              // cover image data URL
  coverThumbnail: string;            // cover thumbnail
  spreads: SpreadInfo[];             // pre-computed spread layout
  issueMap: Map<number, PageIssue[]>;// page index → issues
  pageAnalyses: PageAnalysis[];      // per-page analysis results
  metadata: PreviewMetadata;
  status: ProcessingStatus;
}

export interface SpreadInfo {
  leftPageIndex: number | null;  // index into bookPages array
  rightPageIndex: number | null;
  isSingle: boolean;
  label: string;
}

export interface PreviewMetadata {
  totalBookPages: number;
  manuscriptPages: number;
  hasCover: boolean;
  bookType: BookType;
  trimWidthIn: number;
  trimHeightIn: number;
  fullCoverWidthIn: number;
  fullCoverHeightIn: number;
  dpi: number;
  createdAt: number;
}

export type ProcessingStatus = 'idle' | 'parsing' | 'rendering' | 'analyzing' | 'ready' | 'error';

// Issue filter types
export type IssueSeverityFilter = 'all' | 'fail' | 'risk' | 'warning' | 'safe' | 'pass';
export type IssueCategoryFilter = 'all' | 'cover' | 'interior' | 'bleed' | 'dpi' | 'font' | 'gutter' | 'margin' | 'size';

export interface IssueFilter {
  severity: IssueSeverityFilter;
  category: IssueCategoryFilter;
  search: string;
}

// Issue category for grouping and filtering
export type IssueCategory = 'cover' | 'interior' | 'bleed' | 'dpi' | 'font' | 'gutter' | 'margin' | 'size';

// Enhanced PageIssue with position info for overlay highlights
export interface PageIssueExtended extends PageIssue {
  category: IssueCategory;
  actual: string;
  expected: string;
  region?: {
    xIn: number;  // position in inches from left
    yIn: number;  // position in inches from top
    widthIn: number;
    heightIn: number;
  };
  suggestion: string;
  /** How far from spec? (spec accuracy dimension) */
  specAccuracy?: 'exact' | 'slight-variance' | 'major-variance';
  /** Real-world KDP risk assessment */
  kdpRisk?: KdpRiskLevel;
  /** Human-readable explanation of WHY this matters in practice */
  realWorldImpact?: string;
  /** Is this issue just informational (safe) and should be de-emphasized? */
  isInformational?: boolean;
}

// Spread model for book preview
export interface SpreadModel {
  id: string;
  leftPageIndex: number | null;  // index into bookPages array
  rightPageIndex: number | null;
  isSingle: boolean;
  label: string;
  spreadIndex: number;
}

// Validation summary computed from PageIssueExtended[]
export interface ValidationSummary {
  total: number;
  fail: number;
  risk: number;
  warning: number;
  safe: number;
  pass: number;
  byCategory: Record<IssueCategory, number>;
  overallStatus: CheckStatus;
  isReady: boolean; // true when no fail/risk issues
}
