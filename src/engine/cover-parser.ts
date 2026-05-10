/**
 * Cover PDF Parser — Splits KDP cover spreads into front/spine/back textures.
 *
 * KDP cover PDFs contain a single spread:
 *   [BACK COVER | SPINE | FRONT COVER]
 *
 * This module dynamically calculates regions based on trim size + spine width + bleed,
 * then slices the rendered PDF into separate textures for 3D mesh mapping.
 */

import { CalculatedMeasurements } from '@/types/kdp';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoverSegments {
  /** Full cover spread data URL (as rendered from PDF) */
  fullDataUrl: string;
  /** Full pixel width of the rendered cover spread */
  fullWidth: number;
  /** Full pixel height of the rendered cover spread */
  fullHeight: number;

  /** Front cover texture data URL */
  frontDataUrl: string;
  /** Back cover texture data URL */
  backDataUrl: string;
  /** Spine texture data URL */
  spineDataUrl: string;

  /** Pixel regions for each segment (x, y, width, height) */
  frontRegion: CoverRegion;
  spineRegion: CoverRegion;
  backRegion: CoverRegion;

  /** Whether this was a full spread or just a front cover image */
  isFullSpread: boolean;
}

export interface CoverRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Cover Layout Calculator
// ---------------------------------------------------------------------------

export interface CoverLayoutParams {
  trimWidthIn: number;
  trimHeightIn: number;
  spineWidthIn: number;
  bleedIn: number;
  wrapAroundIn: number;
  isHardcover: boolean;
  hingeIn: number;
}

/**
 * Calculate the pixel regions for back/spine/front on a full cover spread.
 *
 * KDP full cover layout (left to right):
 *   [wrap] [back+bleed] [spine] [front+bleed] [wrap]
 *
 * More precisely:
 *   [wrap] [backBleed] [backTrim] [spine] [frontTrim] [frontBleed] [wrap]
 *
 * For hardcover, hinge areas are inside the cover between spine and each board.
 */
export function calculateCoverRegions(
  params: CoverLayoutParams,
  renderedWidth: number,
  renderedHeight: number,
): {
  backRegion: CoverRegion;
  spineRegion: CoverRegion;
  frontRegion: CoverRegion;
  isFullSpread: boolean;
} {
  const {
    trimWidthIn,
    spineWidthIn,
    bleedIn,
    wrapAroundIn,
    isHardcover,
    hingeIn,
  } = params;

  // Calculate full cover dimensions in inches
  const fullWidthIn = wrapAroundIn + bleedIn + trimWidthIn + spineWidthIn + trimWidthIn + bleedIn + wrapAroundIn;
  const fullHeightIn = wrapAroundIn + bleedIn + params.trimHeightIn + bleedIn + wrapAroundIn;

  // Pixels per inch based on the rendered image
  const ppi = renderedWidth / fullWidthIn;

  // Determine if this image looks like a full spread
  // A full spread should be roughly 2x the trim width (plus spine + bleed)
  const expectedSpreadRatio = fullWidthIn / trimWidthIn;
  const actualRatio = renderedWidth / renderedHeight;
  const trimRatio = trimWidthIn / params.trimHeightIn;
  const isFullSpread = actualRatio > trimRatio * 1.3; // If width is much more than trim ratio, it's likely a spread

  if (!isFullSpread) {
    // This is just a front cover image — use it as-is for front only
    return {
      frontRegion: { x: 0, y: 0, width: renderedWidth, height: renderedHeight },
      spineRegion: { x: 0, y: 0, width: 1, height: renderedHeight }, // 1px placeholder
      backRegion: { x: 0, y: 0, width: renderedWidth, height: renderedHeight }, // mirror front for back
      isFullSpread: false,
    };
  }

  // Full spread: calculate regions left-to-right
  let xOffset = 0;

  // Wrap (left)
  xOffset += wrapAroundIn * ppi;

  // Back cover (includes bleed on both sides)
  const backX = xOffset;
  const backWidth = (bleedIn + trimWidthIn + bleedIn) * ppi;
  xOffset += backWidth;

  // Spine
  const spineX = xOffset;
  const spineWidth = Math.max(spineWidthIn * ppi, 2); // At least 2px
  xOffset += spineWidth;

  // Front cover (includes bleed on both sides)
  const frontX = xOffset;
  const frontWidth = (bleedIn + trimWidthIn + bleedIn) * ppi;

  // Vertically: full height (wrap + bleed + trim + bleed + wrap)
  const y = 0;

  return {
    backRegion: {
      x: Math.round(backX),
      y: Math.round(y),
      width: Math.round(backWidth),
      height: renderedHeight,
    },
    spineRegion: {
      x: Math.round(spineX),
      y: Math.round(y),
      width: Math.round(spineWidth),
      height: renderedHeight,
    },
    frontRegion: {
      x: Math.round(frontX),
      y: Math.round(y),
      width: Math.round(frontWidth),
      height: renderedHeight,
    },
    isFullSpread: true,
  };
}

// ---------------------------------------------------------------------------
// Texture Slicing
// ---------------------------------------------------------------------------

/**
 * Slice a full cover spread image into separate front/spine/back textures.
 * Uses OffscreenCanvas for efficient GPU-friendly texture generation.
 */
export async function sliceCoverTextures(
  fullDataUrl: string,
  measurements: CalculatedMeasurements,
  bookType: 'paperback' | 'hardcover',
): Promise<CoverSegments> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const renderedWidth = img.naturalWidth;
        const renderedHeight = img.naturalHeight;

        const isHardcover = bookType === 'hardcover';

        const regions = calculateCoverRegions(
          {
            trimWidthIn: measurements.trimWidthIn,
            trimHeightIn: measurements.trimHeightIn,
            spineWidthIn: measurements.spineWidthIn,
            bleedIn: measurements.bleedIn,
            wrapAroundIn: measurements.wrapAroundIn,
            isHardcover,
            hingeIn: measurements.hingeIn,
          },
          renderedWidth,
          renderedHeight,
        );

        // Slice textures using canvas
        const frontDataUrl = sliceRegion(img, regions.frontRegion);
        const spineDataUrl = sliceRegion(img, regions.spineRegion);
        const backDataUrl = regions.isFullSpread
          ? sliceRegion(img, regions.backRegion)
          : generateBackCover(renderedWidth, renderedHeight);

        resolve({
          fullDataUrl,
          fullWidth: renderedWidth,
          fullHeight: renderedHeight,
          frontDataUrl,
          backDataUrl,
          spineDataUrl,
          frontRegion: regions.frontRegion,
          spineRegion: regions.spineRegion,
          backRegion: regions.backRegion,
          isFullSpread: regions.isFullSpread,
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load cover image for slicing'));
    img.src = fullDataUrl;
  });
}

/**
 * Slice a region from the source image and return as data URL.
 */
function sliceRegion(sourceImg: HTMLImageElement, region: CoverRegion): string {
  const canvas = document.createElement('canvas');
  // Clamp dimensions to avoid NaN or zero
  const w = Math.max(1, Math.min(region.width, sourceImg.naturalWidth - region.x));
  const h = Math.max(1, Math.min(region.height, sourceImg.naturalHeight - region.y));
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    sourceImg,
    region.x, region.y, w, h,  // source rect
    0, 0, w, h,                 // dest rect
  );

  return canvas.toDataURL('image/png');
}

/**
 * Generate a plain back cover texture when we only have a front cover image.
 * Creates a dark solid color matching typical KDP back covers.
 */
function generateBackCover(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext('2d')!;
  // Dark background typical of printed book back covers
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle barcode placeholder area
  const barcodeW = Math.min(canvas.width * 0.25, 200);
  const barcodeH = Math.min(canvas.height * 0.08, 80);
  const barcodeX = canvas.width - barcodeW - canvas.width * 0.08;
  const barcodeY = canvas.height - barcodeH - canvas.height * 0.04;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.1;
  ctx.fillRect(barcodeX, barcodeY, barcodeW, barcodeH);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}

// ---------------------------------------------------------------------------
// Convenience: Parse + Slice from File
// ---------------------------------------------------------------------------

/**
 * High-level function: takes a cover File (PDF or image), renders it,
 * then slices into front/spine/back textures.
 */
export async function parseCoverFile(
  file: File,
  measurements: CalculatedMeasurements,
  bookType: 'paperback' | 'hardcover',
  renderPdfFn: (file: File, opts: { maxPages: number; renderScale: number }) => Promise<{
    pages: { dataUrl: string }[];
    widthIn: number;
    heightIn: number;
  }>,
): Promise<CoverSegments> {
  let fullDataUrl: string;
  let fullWidth: number;
  let fullHeight: number;

  if (file.type === 'application/pdf') {
    // Render PDF first page as high-res image
    const result = await renderPdfFn(file, { maxPages: 1, renderScale: 2.5 });
    if (!result.pages.length || !result.pages[0].dataUrl) {
      throw new Error('Cover PDF has no renderable pages');
    }
    fullDataUrl = result.pages[0].dataUrl;

    // Get pixel dimensions from the rendered image
    const dims = await getImageDimensions(fullDataUrl);
    fullWidth = dims.width;
    fullHeight = dims.height;
  } else {
    // Image file — read as data URL
    const result = await readFileAsDataUrl(file);
    fullDataUrl = result;
    const dims = await getImageDimensions(fullDataUrl);
    fullWidth = dims.width;
    fullHeight = dims.height;
  }

  // Now slice the cover
  return sliceCoverTextures(fullDataUrl, measurements, bookType);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to get image dimensions'));
    img.src = dataUrl;
  });
}
