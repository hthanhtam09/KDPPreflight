import { TrimSize, TrimSizeKey, BleedType, PaperType, InteriorType, BookConfig, CalculatedMeasurements } from '@/types/kdp';

// KDP Standard Trim Sizes
export const TRIM_SIZES: Record<TrimSizeKey, TrimSize> = {
  '5x8': { key: '5x8', label: '5" × 8"', widthIn: 5, heightIn: 8, widthCm: 12.7, heightCm: 20.32, widthPx: 1500, heightPx: 2400 },
  '5.25x8': { key: '5.25x8', label: '5.25" × 8"', widthIn: 5.25, heightIn: 8, widthCm: 13.34, heightCm: 20.32, widthPx: 1575, heightPx: 2400 },
  '5.5x8.5': { key: '5.5x8.5', label: '5.5" × 8.5"', widthIn: 5.5, heightIn: 8.5, widthCm: 13.97, heightCm: 21.59, widthPx: 1650, heightPx: 2550 },
  '6x9': { key: '6x9', label: '6" × 9"', widthIn: 6, heightIn: 9, widthCm: 15.24, heightCm: 22.86, widthPx: 1800, heightPx: 2700 },
  '7x10': { key: '7x10', label: '7" × 10"', widthIn: 7, heightIn: 10, widthCm: 17.78, heightCm: 25.4, widthPx: 2100, heightPx: 3000 },
  '7.44x9.69': { key: '7.44x9.69', label: '7.44" × 9.69"', widthIn: 7.44, heightIn: 9.69, widthCm: 18.9, heightCm: 24.61, widthPx: 2232, heightPx: 2907 },
  '8x10': { key: '8x10', label: '8" × 10"', widthIn: 8, heightIn: 10, widthCm: 20.32, heightCm: 25.4, widthPx: 2400, heightPx: 3000 },
  '8.25x6': { key: '8.25x6', label: '8.25" × 6"', widthIn: 8.25, heightIn: 6, widthCm: 20.96, heightCm: 15.24, widthPx: 2475, heightPx: 1800 },
  '8.25x8.25': { key: '8.25x8.25', label: '8.25" × 8.25"', widthIn: 8.25, heightIn: 8.25, widthCm: 20.96, heightCm: 20.96, widthPx: 2475, heightPx: 2475 },
  '8.5x8.5': { key: '8.5x8.5', label: '8.5" × 8.5"', widthIn: 8.5, heightIn: 8.5, widthCm: 21.59, heightCm: 21.59, widthPx: 2550, heightPx: 2550 },
  '8.5x11': { key: '8.5x11', label: '8.5" × 11"', widthIn: 8.5, heightIn: 11, widthCm: 21.59, heightCm: 27.94, widthPx: 2550, heightPx: 3300 },
  'custom': { key: 'custom', label: 'Custom', widthIn: 0, heightIn: 0, widthCm: 0, heightCm: 0, widthPx: 0, heightPx: 0 },
};

// Bleed settings
export const BLEED_SIZE_IN = 0.125; // 1/8 inch on each side
export const NO_BLEED_SIZE_IN = 0;

// Spine width calculation factors per paper type (inches per page)
export const SPINE_WIDTH_FACTORS: Record<PaperType, number> = {
  'white': 0.002252,     // ~0.002252 in/page for white paper
  'cream': 0.0025,       // ~0.0025 in/page for cream paper
  'premium-color': 0.0025, // ~0.0025 in/page for premium color
};

// Safe area margins
export const SAFE_AREA_IN = 0.25; // 1/4 inch
export const BARCODE_AREA = { x: 0, y: 0, width: 2, height: 1.2 }; // inches from bottom-right

// Wrap-around for full cover
export const WRAP_AROUND_IN = 0.0625; // 1/16 inch each side

// DPI standards
export const MIN_COVER_DPI = 300;
export const MIN_INTERIOR_DPI = 300;
export const RECOMMENDED_DPI = 300;

// KDP tolerance
export const DIMENSION_TOLERANCE_IN = 0.02; // ±0.02 inch acceptable variance
export const SPINE_TOLERANCE_IN = 0.01; // ±0.01 inch spine tolerance

// Page count limits
export const MIN_PAGE_COUNT = 24;
export const MAX_PAGE_COUNT_PAPERBACK = 828;
export const MAX_PAGE_COUNT_HARDCOVER = 550;

// File size limits
export const MAX_FILE_SIZE_MB = 650;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Supported file types
export const SUPPORTED_COVER_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
export const SUPPORTED_MANUSCRIPT_TYPES = ['application/pdf'];
export const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

// Default book config
export const DEFAULT_BOOK_CONFIG: BookConfig = {
  trimSize: '6x9',
  bleed: 'no-bleed',
  paper: 'white',
  interior: 'black-white',
  pageCount: 100,
  binding: 'paperback',
};

// Calculate all measurements from config
export function calculateMeasurements(config: BookConfig): CalculatedMeasurements {
  const trim = TRIM_SIZES[config.trimSize];
  const trimWidthIn = config.trimSize === 'custom' ? (config.customWidth || 6) : trim.widthIn;
  const trimHeightIn = config.trimSize === 'custom' ? (config.customHeight || 9) : trim.heightIn;
  
  const bleedIn = config.bleed === 'bleed' ? BLEED_SIZE_IN : 0;
  const spineWidthIn = config.pageCount * SPINE_WIDTH_FACTORS[config.paper];
  
  const fullCoverWidthIn = trimWidthIn + bleedIn + spineWidthIn + bleedIn + trimWidthIn + (WRAP_AROUND_IN * 2);
  const fullCoverHeightIn = trimHeightIn + (bleedIn * 2) + (WRAP_AROUND_IN * 2);
  
  const barcodeAreaIn = {
    x: trimWidthIn - BARCODE_AREA.width - SAFE_AREA_IN,
    y: trimHeightIn - BARCODE_AREA.height - SAFE_AREA_IN,
    width: BARCODE_AREA.width,
    height: BARCODE_AREA.height,
  };

  return {
    trimWidthIn,
    trimHeightIn,
    bleedIn,
    spineWidthIn: Math.round(spineWidthIn * 1000) / 1000,
    fullCoverWidthIn: Math.round(fullCoverWidthIn * 1000) / 1000,
    fullCoverHeightIn: Math.round(fullCoverHeightIn * 1000) / 1000,
    safeAreaIn: SAFE_AREA_IN,
    barcodeAreaIn,
    wrapAroundIn: WRAP_AROUND_IN,
  };
}

// Convert inches to pixels at given DPI
export function inchesToPixels(inches: number, dpi: number = 300): number {
  return Math.round(inches * dpi);
}

// Convert pixels to inches
export function pixelsToInches(pixels: number, dpi: number = 300): number {
  return pixels / dpi;
}

// Format inches for display
export function formatInches(value: number): string {
  return `${value.toFixed(3)}"`;
}

// Format mm for display
export function inchesToMm(inches: number): number {
  return inches * 25.4;
}

// Get check status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pass': return 'text-emerald-400';
    case 'safe': return 'text-green-400';
    case 'warning': return 'text-amber-400';
    case 'risk': return 'text-orange-400';
    case 'fail': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'pass': return 'bg-emerald-400/10 border-emerald-400/20';
    case 'safe': return 'bg-green-400/10 border-green-400/20';
    case 'warning': return 'bg-amber-400/10 border-amber-400/20';
    case 'risk': return 'bg-orange-400/10 border-orange-400/20';
    case 'fail': return 'bg-red-400/10 border-red-400/20';
    default: return 'bg-gray-400/10 border-gray-400/20';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pass': return '✓';
    case 'safe': return '✓';
    case 'warning': return '⚠';
    case 'risk': return '▲';
    case 'fail': return '✗';
    default: return '●';
  }
}
