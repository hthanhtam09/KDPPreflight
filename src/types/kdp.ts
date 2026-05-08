// KDP Book Types and Constants

export type TrimSizeKey = '5x8' | '5.25x8' | '5.5x8.5' | '6x9' | '7x10' | '7.44x9.69' | '8x10' | '8.25x6' | '8.25x8.25' | '8.5x8.5' | '8.5x11' | 'custom';

export type BleedType = 'bleed' | 'no-bleed';

export type PaperType = 'white' | 'cream' | 'premium-color';

export type InteriorType = 'black-white' | 'standard-color' | 'premium-color';

export type BindingType = 'paperback' | 'hardcover';

export type CheckStatus = 'pass' | 'safe' | 'warning' | 'risk' | 'fail';

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

export interface BookConfig {
  trimSize: TrimSizeKey;
  customWidth?: number;
  customHeight?: number;
  bleed: BleedType;
  paper: PaperType;
  interior: InteriorType;
  pageCount: number;
  binding: BindingType;
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
}

export interface ValidationCheck {
  id: string;
  category: 'cover' | 'manuscript' | 'general';
  name: string;
  description: string;
  status: CheckStatus;
  message: string;
  suggestion?: string;
  value?: number;
  expected?: number;
  tolerance?: number;
}

export interface ValidationReport {
  fileId: string;
  fileName: string;
  fileType: 'cover' | 'manuscript';
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
