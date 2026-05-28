'use client';

import { PDFAnalysisResult } from './validator';

// Lazy-loaded PDF.js
let pdfjsLib: typeof import('pdfjs-dist') | null = null;
let pdfjsLoading: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  if (pdfjsLoading) return pdfjsLoading;
  
  pdfjsLoading = (async () => {
    const lib = await import('pdfjs-dist');
    lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    pdfjsLib = lib;
    return lib;
  })();
  
  return pdfjsLoading;
}

export interface PDFPageInfo {
  index: number;
  width: number;
  height: number;
  boxes?: PDFPageBoxes;
  dataUrl: string;
  isBlank: boolean;
}

export interface PDFBoxInfo {
  widthPt: number;
  heightPt: number;
  widthIn: number;
  heightIn: number;
  source: 'pdfjs-view' | 'unavailable';
}

export interface PDFPageBoxes {
  pageNumber: number;
  mediaBox: PDFBoxInfo | null;
  cropBox: PDFBoxInfo | null;
  trimBox: PDFBoxInfo | null;
  bleedBox: PDFBoxInfo | null;
  printBox: PDFBoxInfo;
  printBoxUsed: 'trimBox' | 'bleedBox' | 'cropBox' | 'mediaBox' | 'pdfjs-view';
}

export interface PDFPageColorStats {
  analyzed: boolean;
  hasColor: boolean;
  meaningfulColor: boolean;
  colorPixelRatio: number;
  saturatedColorPixelRatio: number;
  saturationScore: number;
  averageSaturation: number;
  maxColorDelta: number;
  totalPixelsSampled: number;
  colorLikePixels: number;
  isMostlyGrayscale: boolean;
  isDark: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasonCode: 'MEANINGFUL_COLOR_DETECTED' | 'ONLY_TINY_COLOR_NOISE' | 'GRAYSCALE_PAGE' | 'COLOR_ANALYSIS_FAILED';
  threshold: {
    colorDelta: number;
    saturation: number;
    hasColorRatio: number;
    meaningfulRatio: number;
  };
}

export interface PDFColorAnalysisResult {
  colorPageIndices: number[];
  grayscalePageIndices: number[];
  pageColorStatsByPage: Record<number, PDFPageColorStats>;
  darkPageIndices: number[];
  blurryPageIndices: number[];
}

const DEFAULT_COLOR_ANALYSIS = {
  validationScale: 0.72,
  maxPixelsSampled: 240_000,
  colorDeltaThreshold: 10,
  saturationThreshold: 0.06,
  hasColorRatio: 0.001,
  meaningfulRatio: 0.003,
};

// ---------------------------------------------------------------------------
// Cache System — render once, reuse textures
// ---------------------------------------------------------------------------

// In-memory cache for rendered page data URLs
const pageCache = new Map<string, string>(); // key: `${fileId}:${pageIndex}:${scale}`
// In-memory cache for PDF document objects
const pdfDocCache = new Map<string, any>(); // key: file fingerprint
// In-flight loading promises — prevents concurrent duplicate loads for the same file
const pdfDocLoadingPromises = new Map<string, Promise<any>>()

function getFileFingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function getCacheKey(fileId: string, pageIndex: number, scale: number): string {
  return `${fileId}:${pageIndex}:${scale}`;
}

function boxFromView(view: number[], userUnit: number): PDFBoxInfo {
  const POINTS_PER_INCH = 72;
  const widthPt = Math.abs(view[2] - view[0]) * userUnit;
  const heightPt = Math.abs(view[3] - view[1]) * userUnit;
  return {
    widthPt,
    heightPt,
    widthIn: widthPt / POINTS_PER_INCH,
    heightIn: heightPt / POINTS_PER_INCH,
    source: 'pdfjs-view',
  };
}

function getPageBoxes(page: any, pageNumber: number): PDFPageBoxes {
  // PDF.js public API exposes `view`, which is the visible page box used for
  // rendering (CropBox intersected with MediaBox). It does not expose TrimBox
  // or BleedBox directly in the browser API, so those are marked unavailable
  // here instead of guessed. Validation uses this print-like box to avoid
  // comparing against rendered canvas pixels.
  const printBox = boxFromView(page.view, page.userUnit ?? 1);
  return {
    pageNumber,
    mediaBox: printBox,
    cropBox: printBox,
    trimBox: null,
    bleedBox: null,
    printBox,
    printBoxUsed: 'pdfjs-view',
  };
}

export function clearPageCache() {
  pageCache.clear();
}

export function clearPdfDocCache() {
  pdfDocCache.clear();
}

export function clearAllCaches() {
  pageCache.clear();
  pdfDocCache.clear();
  pdfDocLoadingPromises.clear();
}

export async function getOrLoadPdfDoc(file: File): Promise<any> {
  const pdfjs = await getPdfjs();
  const fileId = getFileFingerprint(file);

  const cached = pdfDocCache.get(fileId);
  if (cached) return cached;

  const inFlight = pdfDocLoadingPromises.get(fileId);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    }).promise;
    pdfDocCache.set(fileId, doc);
    pdfDocLoadingPromises.delete(fileId);
    return doc;
  })();

  pdfDocLoadingPromises.set(fileId, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Thumbnail cache — pre-rendered thumbnails for sidebar
// ---------------------------------------------------------------------------

const thumbnailCache = new Map<string, string>(); // key: `${fileId}:${pageIndex}:thumb`

export function getThumbnailCache() {
  return thumbnailCache;
}

export function clearThumbnailCache() {
  thumbnailCache.clear();
}

// ---------------------------------------------------------------------------
// Load PDF — parse and render pages with caching
// ---------------------------------------------------------------------------

export async function loadPDF(file: File, options?: {
  maxPages?: number;
  renderScale?: number;
  onProgress?: (current: number, total: number) => void;
  isCancelled?: () => boolean;
}): Promise<{
  pageCount: number;
  pages: PDFPageInfo[];
  widthIn: number;
  heightIn: number;
}> {
  const pdfjs = await getPdfjs();
  const maxPages = options?.maxPages ?? 50;
  const renderScale = options?.renderScale ?? 1.5;
  
  const fileId = getFileFingerprint(file);
  const arrayBuffer = await file.arrayBuffer();
  
  // Check document cache
  let pdf = pdfDocCache.get(fileId);
  if (!pdf) {
    pdf = await pdfjs.getDocument({ 
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    }).promise;
    pdfDocCache.set(fileId, pdf);
  }
  
  const pageCount = pdf.numPages;
  const pages: PDFPageInfo[] = [];
  let firstPageWidth = 0;
  let firstPageHeight = 0;
  
  for (let i = 1; i <= Math.min(pageCount, maxPages); i++) {
    if (options?.isCancelled?.()) break;

    // Yield to the UI thread every 5 pages so the browser can paint frames
    if (i > 1 && i % 5 === 0) await new Promise<void>((r) => setTimeout(r, 0));

    const cacheKey = getCacheKey(fileId, i, renderScale);
    const cached = pageCache.get(cacheKey);

    const page = await pdf.getPage(i);
    const boxes = getPageBoxes(page, i);

    if (i === 1) {
      firstPageWidth = boxes.printBox.widthIn;
      firstPageHeight = boxes.printBox.heightIn;
    }

    if (cached) {
      // Use cached texture
      pages.push({
        index: i,
        width: boxes.printBox.widthIn,
        height: boxes.printBox.heightIn,
        boxes,
        dataUrl: cached,
        isBlank: false, // Already checked when cached
      });
      options?.onProgress?.(i, pageCount);
      continue;
    }

    // Render page at specified scale
    const renderViewport = page.getViewport({ scale: renderScale });

    const canvas = document.createElement('canvas');
    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({
      canvasContext: ctx,
      viewport: renderViewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    // Cache the rendered page
    pageCache.set(cacheKey, dataUrl);

    // Also generate a thumbnail (lower quality, smaller)
    const thumbKey = `${fileId}:${i}:thumb`;
    if (!thumbnailCache.has(thumbKey)) {
      thumbnailCache.set(thumbKey, canvas.toDataURL('image/jpeg', 0.5));
    }

    // Check if page is blank
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isBlank = isImageBlank(imageData);

    // Release GPU canvas memory
    canvas.width = 0; canvas.height = 0;

    pages.push({
      index: i,
      width: boxes.printBox.widthIn,
      height: boxes.printBox.heightIn,
      boxes,
      dataUrl,
      isBlank,
    });

    options?.onProgress?.(i, pageCount);
  }
  
  // Non-rendered entries for pages beyond maxPages. We still read PDF page
  // boxes for every page so Preflight validates print dimensions from PDF
  // metadata, not from rendered preview pixels or first-page placeholders.
  for (let i = maxPages + 1; i <= pageCount; i++) {
    // Yield every 10 pages so UI stays responsive during large doc metadata reads
    if (i % 10 === 0) await new Promise<void>((r) => setTimeout(r, 0));
    const page = await pdf.getPage(i);
    const boxes = getPageBoxes(page, i);
    pages.push({
      index: i,
      width: boxes.printBox.widthIn,
      height: boxes.printBox.heightIn,
      boxes,
      dataUrl: '',
      isBlank: false,
    });
    page.cleanup();
  }
  
  return {
    pageCount,
    pages,
    widthIn: firstPageWidth,
    heightIn: firstPageHeight,
  };
}

function analyzeColorImageData(
  imageData: ImageData,
  thresholds = DEFAULT_COLOR_ANALYSIS
): PDFPageColorStats {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const pixelStride = Math.max(1, Math.floor(totalPixels / thresholds.maxPixelsSampled));
  let totalPixelsSampled = 0;
  let colorLikePixels = 0;
  let totalSaturation = 0;
  let totalBrightness = 0;
  let maxColorDelta = 0;

  for (let pixel = 0; pixel < totalPixels; pixel += pixelStride) {
    const offset = pixel * 4;
    const alpha = data[offset + 3];
    if (alpha < 16) continue;

    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const delta = maxChannel - minChannel;
    const saturation = delta / Math.max(maxChannel, 1);

    totalPixelsSampled += 1;
    totalSaturation += saturation;
    totalBrightness += (r + g + b) / 3;
    maxColorDelta = Math.max(maxColorDelta, delta);

    if (
      delta >= thresholds.colorDeltaThreshold &&
      saturation >= thresholds.saturationThreshold
    ) {
      colorLikePixels += 1;
    }
  }

  const saturatedColorPixelRatio = totalPixelsSampled > 0 ? colorLikePixels / totalPixelsSampled : 0;
  const averageSaturation = totalPixelsSampled > 0 ? totalSaturation / totalPixelsSampled : 0;
  const averageBrightness = totalPixelsSampled > 0 ? totalBrightness / totalPixelsSampled : 255;
  const hasColor = saturatedColorPixelRatio >= thresholds.hasColorRatio;
  const meaningfulColor = saturatedColorPixelRatio >= thresholds.meaningfulRatio;
  const reasonCode = meaningfulColor
    ? 'MEANINGFUL_COLOR_DETECTED'
    : hasColor
      ? 'ONLY_TINY_COLOR_NOISE'
      : 'GRAYSCALE_PAGE';

  return {
    analyzed: true,
    hasColor,
    meaningfulColor,
    colorPixelRatio: saturatedColorPixelRatio,
    saturatedColorPixelRatio,
    saturationScore: averageSaturation,
    averageSaturation,
    maxColorDelta,
    totalPixelsSampled,
    colorLikePixels,
    isMostlyGrayscale: !hasColor,
    isDark: averageBrightness / 255 < 0.22,
    confidence: totalPixelsSampled > 0 ? 'high' : 'low',
    reasonCode,
    threshold: {
      colorDelta: thresholds.colorDeltaThreshold,
      saturation: thresholds.saturationThreshold,
      hasColorRatio: thresholds.hasColorRatio,
      meaningfulRatio: thresholds.meaningfulRatio,
    },
  };
}

function analyzeQualityImageData(imageData: ImageData): { lowSharpness: boolean; lowContrast: boolean } {
  const { data, width, height } = imageData;
  const sampleStep = Math.max(1, Math.floor(Math.sqrt((width * height) / 12_000)));
  let samples = 0;
  let sum = 0;
  let sumSquares = 0;
  let edgeTotal = 0;
  let edgeCount = 0;

  const grayAt = (x: number, y: number) => {
    const offset = (y * width + x) * 4;
    return 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
  };

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const gray = grayAt(x, y);
      sum += gray;
      sumSquares += gray * gray;
      samples += 1;
    }
  }

  for (let y = sampleStep; y < height - sampleStep; y += sampleStep) {
    for (let x = sampleStep; x < width - sampleStep; x += sampleStep) {
      const gx = Math.abs(grayAt(x + sampleStep, y) - grayAt(x - sampleStep, y));
      const gy = Math.abs(grayAt(x, y + sampleStep) - grayAt(x, y - sampleStep));
      edgeTotal += gx + gy;
      edgeCount += 1;
    }
  }

  const mean = samples > 0 ? sum / samples : 255;
  const variance = samples > 0 ? Math.max(0, sumSquares / samples - mean * mean) : 0;
  const contrastScore = Math.sqrt(variance);
  const edgeScore = edgeCount > 0 ? edgeTotal / edgeCount : 0;

  return {
    lowSharpness: edgeScore < 4.2 && contrastScore < 58,
    lowContrast: contrastScore < 28,
  };
}

export async function analyzePdfPageColors(file: File, options?: {
  validationScale?: number;
  onProgress?: (current: number, total: number) => void;
  isCancelled?: () => boolean;
  colorDeltaThreshold?: number;
  saturationThreshold?: number;
  hasColorRatio?: number;
  meaningfulRatio?: number;
}): Promise<PDFColorAnalysisResult> {
  const pdfjs = await getPdfjs();
  const fileId = getFileFingerprint(file);
  const arrayBuffer = await file.arrayBuffer();
  let pdf = pdfDocCache.get(fileId);
  if (!pdf) {
    pdf = await pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    }).promise;
    pdfDocCache.set(fileId, pdf);
  }

  const thresholds = {
    ...DEFAULT_COLOR_ANALYSIS,
    validationScale: options?.validationScale ?? DEFAULT_COLOR_ANALYSIS.validationScale,
    colorDeltaThreshold: options?.colorDeltaThreshold ?? DEFAULT_COLOR_ANALYSIS.colorDeltaThreshold,
    saturationThreshold: options?.saturationThreshold ?? DEFAULT_COLOR_ANALYSIS.saturationThreshold,
    hasColorRatio: options?.hasColorRatio ?? DEFAULT_COLOR_ANALYSIS.hasColorRatio,
    meaningfulRatio: options?.meaningfulRatio ?? DEFAULT_COLOR_ANALYSIS.meaningfulRatio,
  };

  const pageColorStatsByPage: Record<number, PDFPageColorStats> = {};
  const colorPageIndices: number[] = [];
  const grayscalePageIndices: number[] = [];
  const darkPageIndices: number[] = [];
  const blurryPageIndices: number[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    if (options?.isCancelled?.()) break;
    if (pageNumber > 1 && pageNumber % 3 === 0) await new Promise<void>((r) => setTimeout(r, 0));

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: thresholds.validationScale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({
        canvasContext: ctx,
        viewport,
        background: 'rgb(255,255,255)',
      }).promise;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colorStats = analyzeColorImageData(imageData, thresholds);
      const qualityStats = analyzeQualityImageData(imageData);
      pageColorStatsByPage[pageNumber] = colorStats;

      if (colorStats.meaningfulColor) colorPageIndices.push(pageNumber);
      else grayscalePageIndices.push(pageNumber);
      if (colorStats.isDark) darkPageIndices.push(pageNumber);
      if (qualityStats.lowSharpness || qualityStats.lowContrast) blurryPageIndices.push(pageNumber);

      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
    } catch {
      pageColorStatsByPage[pageNumber] = {
        analyzed: false,
        hasColor: false,
        meaningfulColor: false,
        colorPixelRatio: 0,
        saturatedColorPixelRatio: 0,
        saturationScore: 0,
        averageSaturation: 0,
        maxColorDelta: 0,
        totalPixelsSampled: 0,
        colorLikePixels: 0,
        isMostlyGrayscale: true,
        isDark: false,
        confidence: 'low',
        reasonCode: 'COLOR_ANALYSIS_FAILED',
        threshold: {
          colorDelta: thresholds.colorDeltaThreshold,
          saturation: thresholds.saturationThreshold,
          hasColorRatio: thresholds.hasColorRatio,
          meaningfulRatio: thresholds.meaningfulRatio,
        },
      };
    }

    options?.onProgress?.(pageNumber, pdf.numPages);
  }

  return {
    colorPageIndices,
    grayscalePageIndices,
    pageColorStatsByPage,
    darkPageIndices,
    blurryPageIndices,
  };
}

// ---------------------------------------------------------------------------
// Render a single page — lazy loading with caching
// ---------------------------------------------------------------------------

export async function renderSinglePage(
  file: File,
  pageIndex: number,
  scale: number = 2.0,
  options?: { imageType?: 'image/png' | 'image/jpeg'; quality?: number; isCancelled?: () => boolean }
): Promise<{ dataUrl: string; widthIn: number; heightIn: number }> {
  const pdfjs = await getPdfjs();
  const POINTS_PER_INCH = 72;

  const fileId = getFileFingerprint(file);
  const cacheKey = getCacheKey(fileId, pageIndex, scale);

  // Check cache first
  const cached = pageCache.get(cacheKey);
  if (cached) {
    let pdf = pdfDocCache.get(fileId);
    if (!pdf) {
      const arrayBuffer = await file.arrayBuffer();
      pdf = await pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      }).promise;
      pdfDocCache.set(fileId, pdf);
    }
    const page = await pdf.getPage(pageIndex);
    const viewport = page.getViewport({ scale: 1 });
    return {
      dataUrl: cached,
      widthIn: viewport.width / POINTS_PER_INCH,
      heightIn: viewport.height / POINTS_PER_INCH,
    };
  }

  // Not cached — render now
  const arrayBuffer = await file.arrayBuffer();
  let pdf = pdfDocCache.get(fileId);
  if (!pdf) {
    pdf = await pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    }).promise;
    pdfDocCache.set(fileId, pdf);
  }

  const page = await pdf.getPage(pageIndex);
  const viewport = page.getViewport({ scale: 1 });
  const renderViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(renderViewport.width);
  canvas.height = Math.round(renderViewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const renderTask = page.render({ canvasContext: ctx, viewport: renderViewport });
  try {
    await renderTask.promise;
  } catch {
    canvas.width = 0; canvas.height = 0;
    throw new Error('Render cancelled');
  }

  // Skip toDataURL entirely if the caller already unmounted — avoids main-thread
  // blocking from reading a large canvas (especially at HQ scale 2-3x).
  if (options?.isCancelled?.()) {
    canvas.width = 0; canvas.height = 0;
    throw new Error('Render cancelled');
  }

  const dataUrl = options?.imageType === 'image/png'
    ? canvas.toDataURL('image/png')
    : canvas.toDataURL('image/jpeg', options?.quality ?? 0.85);

  pageCache.set(cacheKey, dataUrl);

  // Thumbnail side-cache: only on small-scale renders to avoid a second toDataURL
  // on large HQ canvases (which is expensive and redundant).
  const thumbKey = `${fileId}:${pageIndex}:thumb`;
  if (!thumbnailCache.has(thumbKey) && scale <= 1.2) {
    thumbnailCache.set(thumbKey, canvas.toDataURL('image/jpeg', 0.5));
  }

  // Release GPU canvas memory immediately after encoding.
  canvas.width = 0; canvas.height = 0;

  return {
    dataUrl,
    widthIn: viewport.width / POINTS_PER_INCH,
    heightIn: viewport.height / POINTS_PER_INCH,
  };
}

// ---------------------------------------------------------------------------
// Pre-render pages in background (for import pipeline)
// ---------------------------------------------------------------------------

export async function preRenderPages(
  file: File,
  options?: { 
    startPage?: number;
    endPage?: number;
    scale?: number;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<void> {
  const pdfjs = await getPdfjs();
  const fileId = getFileFingerprint(file);
  const startPage = options?.startPage ?? 1;
  const scale = options?.scale ?? 1.5;
  
  const arrayBuffer = await file.arrayBuffer();
  let pdf = pdfDocCache.get(fileId);
  if (!pdf) {
    pdf = await pdfjs.getDocument({ 
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    }).promise;
    pdfDocCache.set(fileId, pdf);
  }
  
  const endPage = options?.endPage ?? pdf.numPages;
  
  for (let i = startPage; i <= endPage; i++) {
    const cacheKey = getCacheKey(fileId, i, scale);
    if (pageCache.has(cacheKey)) {
      options?.onProgress?.(i, endPage);
      continue; // Already cached
    }
    
    try {
      const page = await pdf.getPage(i);
      const renderViewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      const ctx = canvas.getContext('2d')!;
      
      await page.render({
        canvasContext: ctx,
        viewport: renderViewport,
      }).promise;
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      pageCache.set(cacheKey, dataUrl);
      
      // Thumbnail
      const thumbKey = `${fileId}:${i}:thumb`;
      if (!thumbnailCache.has(thumbKey)) {
        thumbnailCache.set(thumbKey, canvas.toDataURL('image/jpeg', 0.5));
      }
      
      options?.onProgress?.(i, endPage);
    } catch {
      // Skip pages that fail
    }
  }
}

// ---------------------------------------------------------------------------
// Blank page detection
// ---------------------------------------------------------------------------

function isImageBlank(imageData: ImageData): boolean {
  const data = imageData.data;
  const sampleStep = Math.max(1, Math.floor(data.length / (4 * 500)));
  let totalVariation = 0;
  let samples = 0;
  
  let prevR = data[0], prevG = data[1], prevB = data[2];
  for (let i = 4 * sampleStep; i < data.length; i += 4 * sampleStep) {
    const cr = data[i], cg = data[i + 1], cb = data[i + 2];
    totalVariation += Math.abs(cr - prevR) + Math.abs(cg - prevG) + Math.abs(cb - prevB);
    prevR = cr; prevG = cg; prevB = cb;
    samples++;
  }
  
  if (samples === 0) return true;
  const avgVariation = totalVariation / samples;
  return avgVariation < 5;
}

// ---------------------------------------------------------------------------
// PDF Analysis
// ---------------------------------------------------------------------------

export function analyzePDF(
  widthIn: number,
  heightIn: number,
  pageCount: number,
  pages: PDFPageInfo[]
): PDFAnalysisResult {
  const blankPages = pages.filter(p => p.isBlank).map(p => p.index);
  const pageWidths = pages.map(p => p.width);
  const pageHeights = pages.map(p => p.height);
  
  return {
    widthIn,
    heightIn,
    pageCount,
    hasBleed: false,
    dpi: 300,
    isGrayscale: false,
    hasTransparency: false,
    blankPages,
    pageWidths,
    pageHeights,
    imageResolutions: [],
  };
}

// ---------------------------------------------------------------------------
// Load image file — dimensions + data URL
// ---------------------------------------------------------------------------

export async function loadImage(file: File): Promise<{
  width: number;
  height: number;
  dataUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          dataUrl: e.target?.result as string,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Pre-render everything for instant preview during import step
// ---------------------------------------------------------------------------

/**
 * Pre-render everything needed for instant preview during import step.
 * This runs in background while user is on Import/Config steps.
 */
export async function preRenderAllForPreview(
  coverFile: File | null,
  manuscriptFile: File | null,
  options: {
    renderScale?: number;
    onProgress?: (status: string, progress: number) => void;
  } = {}
): Promise<{
  pages: Map<number, string>;
  thumbnails: Map<number, string>;
  coverDataUrl: string;
  coverThumbnail: string;
  pageCount: number;
  widthIn: number;
  heightIn: number;
  blankPages: number[];
}> {
  const renderScale = options.renderScale ?? 1.5;
  const pages = new Map<number, string>();
  const thumbnails = new Map<number, string>();
  let coverDataUrl = '';
  let coverThumbnail = '';
  let pageCount = 0;
  let widthIn = 0;
  let heightIn = 0;
  const blankPages: number[] = [];

  // Process cover
  if (coverFile) {
    options.onProgress?.('processing-cover', 0.1);
    try {
      if (coverFile.type === 'application/pdf') {
        const result = await loadPDF(coverFile, { maxPages: 1, renderScale: 2.0 });
        if (result.pages.length > 0) {
          coverDataUrl = result.pages[0].dataUrl;
          const thumbKey = `cover:thumb`;
          thumbnailCache.set(thumbKey, result.pages[0].dataUrl);
          coverThumbnail = result.pages[0].dataUrl;
        }
      } else {
        // Image file
        const img = await loadImage(coverFile);
        coverDataUrl = img.dataUrl;
        coverThumbnail = img.dataUrl;
      }
    } catch (err) {
      console.error('Failed to process cover:', err);
    }
  }

  // Process manuscript
  if (manuscriptFile) {
    options.onProgress?.('processing-manuscript', 0.2);
    try {
      const pdfjs = await getPdfjs();
      const fileId = getFileFingerprint(manuscriptFile);
      const arrayBuffer = await manuscriptFile.arrayBuffer();

      let pdf = pdfDocCache.get(fileId);
      if (!pdf) {
        pdf = await pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true,
        }).promise;
        pdfDocCache.set(fileId, pdf);
      }

      pageCount = pdf.numPages;
      const POINTS_PER_INCH = 72;

      for (let i = 1; i <= pageCount; i++) {
        const cacheKey = getCacheKey(fileId, i, renderScale);
        const thumbKey = `${fileId}:${i}:thumb`;

        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });

          if (i === 1) {
            widthIn = viewport.width / POINTS_PER_INCH;
            heightIn = viewport.height / POINTS_PER_INCH;
          }

          // Check cache first
          const cachedPage = pageCache.get(cacheKey);
          const cachedThumb = thumbnailCache.get(thumbKey);

          if (cachedPage) {
            pages.set(i, cachedPage);
          } else {
            const renderViewport = page.getViewport({ scale: renderScale });
            const canvas = document.createElement('canvas');
            canvas.width = renderViewport.width;
            canvas.height = renderViewport.height;
            const ctx = canvas.getContext('2d')!;

            await page.render({
              canvasContext: ctx,
              viewport: renderViewport,
            }).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            pageCache.set(cacheKey, dataUrl);
            pages.set(i, dataUrl);

            // Generate thumbnail
            if (!cachedThumb) {
              const thumbDataUrl = canvas.toDataURL('image/jpeg', 0.5);
              thumbnailCache.set(thumbKey, thumbDataUrl);
              thumbnails.set(i, thumbDataUrl);
            } else {
              thumbnails.set(i, cachedThumb);
            }

            // Blank detection
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (isImageBlank(imageData)) {
              blankPages.push(i);
            }
          }

          if (cachedPage && cachedThumb) {
            thumbnails.set(i, cachedThumb);
          }

          options.onProgress?.('rendering-pages', 0.2 + 0.7 * (i / pageCount));
        } catch {
          // Skip pages that fail
        }
      }
    } catch (err) {
      console.error('Failed to process manuscript:', err);
    }
  }

  options.onProgress?.('complete', 1.0);

  return {
    pages,
    thumbnails,
    coverDataUrl,
    coverThumbnail,
    pageCount,
    widthIn,
    heightIn,
    blankPages,
  };
}
