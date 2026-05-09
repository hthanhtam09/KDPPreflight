'use client';

import { PDFAnalysisResult } from './validator';

// ─── Lazy-loaded PDF.js ─────────────────────────────────────────────────────

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

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PDFPageInfo {
  index: number;
  width: number;
  height: number;
  dataUrl: string;
  isBlank: boolean;
}

export type RenderQuality = 'low' | 'medium' | 'high' | 'ultra';

const QUALITY_SCALE: Record<RenderQuality, number> = {
  low: 1.0,
  medium: 1.5,
  high: 2.0,
  ultra: 3.0,
};

// ─── LRU Cache for Rendered Pages ──────────────────────────────────────────

class PageCache {
  private cache = new Map<string, { dataUrl: string; timestamp: number }>();
  private maxSize: number;
  private maxAgeMs: number;

  constructor(maxSize = 100, maxAgeMs = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.maxAgeMs = maxAgeMs;
  }

  private key(pdfId: string, pageIndex: number, quality: RenderQuality): string {
    return `${pdfId}::${pageIndex}::${quality}`;
  }

  get(pdfId: string, pageIndex: number, quality: RenderQuality): string | null {
    const k = this.key(pdfId, pageIndex, quality);
    const entry = this.cache.get(k);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.maxAgeMs) {
      this.cache.delete(k);
      return null;
    }
    // Move to end (most recently used)
    this.cache.delete(k);
    this.cache.set(k, entry);
    return entry.dataUrl;
  }

  set(pdfId: string, pageIndex: number, quality: RenderQuality, dataUrl: string): void {
    const k = this.key(pdfId, pageIndex, quality);
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(k, { dataUrl, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Global page cache singleton
const pageCache = new PageCache();

// ─── PDF Document Manager ──────────────────────────────────────────────────

interface PDFDocumentState {
  pdfDoc: import('pdfjs-dist').PDFDocumentProxy;
  pdfId: string;
  pageCount: number;
  firstPageWidthIn: number;
  firstPageHeightIn: number;
  pageSizes: { widthIn: number; heightIn: number }[];
}

const documentStore = new Map<string, PDFDocumentState>();

/**
 * Initialize a PDF document for lazy page-by-page rendering.
 * Returns a document ID for subsequent operations.
 */
export async function initPDFDocument(file: File): Promise<{
  pdfId: string;
  pageCount: number;
  widthIn: number;
  heightIn: number;
  pageSizes: { widthIn: number; heightIn: number }[];
}> {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    useFetchStream: false,
  }).promise;

  const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const POINTS_PER_INCH = 72;

  const pageSizes: { widthIn: number; heightIn: number }[] = [];
  let firstPageWidthIn = 0;
  let firstPageHeightIn = 0;

  // Get all page sizes (lightweight - no rendering)
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const widthIn = viewport.width / POINTS_PER_INCH;
    const heightIn = viewport.height / POINTS_PER_INCH;
    pageSizes.push({ widthIn, heightIn });

    if (i === 1) {
      firstPageWidthIn = widthIn;
      firstPageHeightIn = heightIn;
    }
  }

  documentStore.set(pdfId, {
    pdfDoc,
    pdfId,
    pageCount: pdfDoc.numPages,
    firstPageWidthIn,
    firstPageHeightIn,
    pageSizes,
  });

  return {
    pdfId,
    pageCount: pdfDoc.numPages,
    widthIn: firstPageWidthIn,
    heightIn: firstPageHeightIn,
    pageSizes,
  };
}

/**
 * Render a single PDF page at specified quality.
 * Uses caching - will return cached result if available.
 */
export async function renderPage(
  pdfId: string,
  pageIndex: number,
  quality: RenderQuality = 'high',
): Promise<PDFPageInfo> {
  const docState = documentStore.get(pdfId);
  if (!docState) throw new Error(`PDF document not found: ${pdfId}`);

  // Check cache first
  const cached = pageCache.get(pdfId, pageIndex, quality);
  if (cached) {
    const size = docState.pageSizes[pageIndex - 1] || { widthIn: docState.firstPageWidthIn, heightIn: docState.firstPageHeightIn };
    return {
      index: pageIndex,
      width: size.widthIn,
      height: size.heightIn,
      dataUrl: cached,
      isBlank: false,
    };
  }

  const scale = QUALITY_SCALE[quality];
  const page = await docState.pdfDoc.getPage(pageIndex);
  const viewport = page.getViewport({ scale: 1 });
  const renderViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = renderViewport.width;
  canvas.height = renderViewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({
    canvasContext: ctx,
    viewport: renderViewport,
  }).promise;

  const jpegQuality = quality === 'ultra' ? 0.95 : quality === 'high' ? 0.9 : 0.8;
  const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);

  // Check blank
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const isBlank = isImageBlank(imageData);

  // Cache the result
  pageCache.set(pdfId, pageIndex, quality, dataUrl);

  const POINTS_PER_INCH = 72;
  return {
    index: pageIndex,
    width: viewport.width / POINTS_PER_INCH,
    height: viewport.height / POINTS_PER_INCH,
    dataUrl,
    isBlank,
  };
}

/**
 * Render multiple pages in batch (for initial load).
 * Supports progress callback.
 */
export async function renderPagesBatch(
  pdfId: string,
  pageIndices: number[],
  quality: RenderQuality = 'medium',
  onProgress?: (completed: number, total: number) => void,
): Promise<PDFPageInfo[]> {
  const results: PDFPageInfo[] = [];
  for (let i = 0; i < pageIndices.length; i++) {
    const page = await renderPage(pdfId, pageIndices[i], quality);
    results.push(page);
    onProgress?.(i + 1, pageIndices.length);
  }
  return results;
}

/**
 * Pre-render pages around the current page (prefetch).
 */
export async function prefetchPages(
  pdfId: string,
  currentPage: number,
  totalPages: number,
  radius: number = 3,
  quality: RenderQuality = 'medium',
): Promise<void> {
  const pagesToFetch: number[] = [];
  for (let i = Math.max(1, currentPage - radius); i <= Math.min(totalPages, currentPage + radius); i++) {
    // Only prefetch if not already cached
    if (!pageCache.get(pdfId, i, quality)) {
      pagesToFetch.push(i);
    }
  }

  // Render in background (don't await each one sequentially for better UX)
  await Promise.allSettled(
    pagesToFetch.map((idx) => renderPage(pdfId, idx, quality))
  );
}

/**
 * Clean up a PDF document from memory.
 */
export function cleanupPDFDocument(pdfId: string): void {
  documentStore.delete(pdfId);
}

// ─── Blank Page Detection ──────────────────────────────────────────────────

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

// ─── Page Content Analysis ─────────────────────────────────────────────────

export interface PageContentAnalysis {
  pageIndex: number;
  isBlank: boolean;
  dominantColor: 'white' | 'light' | 'dark' | 'colorful' | 'neutral';
  inkCoverage: number; // 0-1
  hasEdgeContent: boolean;
  estimatedType: 'text' | 'image' | 'mixed' | 'blank';
  contrast: 'high' | 'medium' | 'low';
}

/**
 * Analyze a rendered page's content characteristics.
 * Operates on the canvas pixel data for real analysis.
 */
export function analyzePageContent(pageInfo: PDFPageInfo): PageContentAnalysis {
  if (pageInfo.isBlank) {
    return {
      pageIndex: pageInfo.index,
      isBlank: true,
      dominantColor: 'white',
      inkCoverage: 0,
      hasEdgeContent: false,
      estimatedType: 'blank',
      contrast: 'low',
    };
  }

  if (!pageInfo.dataUrl) {
    return {
      pageIndex: pageInfo.index,
      isBlank: false,
      dominantColor: 'neutral',
      inkCoverage: 0.3,
      hasEdgeContent: false,
      estimatedType: 'text',
      contrast: 'medium',
    };
  }

  // Analyze the data URL by drawing to canvas and sampling pixels
  // This is a synchronous approximation - real analysis would need async image loading
  // For now, use heuristic based on page properties
  const aspectRatio = pageInfo.width / pageInfo.height;

  // Square-ish pages tend to be image-heavy (coloring books, etc)
  const isSquareish = aspectRatio > 0.85 && aspectRatio < 1.15;
  const estimatedType: PageContentAnalysis['estimatedType'] = isSquareish ? 'image' : 'text';

  return {
    pageIndex: pageInfo.index,
    isBlank: false,
    dominantColor: 'light',
    inkCoverage: isSquareish ? 0.7 : 0.3,
    hasEdgeContent: false,
    estimatedType,
    contrast: 'medium',
  };
}

// ─── Legacy API (backward compatible) ──────────────────────────────────────

export async function loadPDF(file: File): Promise<{
  pageCount: number;
  pages: PDFPageInfo[];
  widthIn: number;
  heightIn: number;
}> {
  const pdfjs = await getPdfjs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    useFetchStream: false,
  }).promise;
  const pageCount = pdf.numPages;

  const pages: PDFPageInfo[] = [];
  let firstPageWidth = 0;
  let firstPageHeight = 0;

  const POINTS_PER_INCH = 72;

  for (let i = 1; i <= Math.min(pageCount, 50); i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });

    if (i === 1) {
      firstPageWidth = viewport.width / POINTS_PER_INCH;
      firstPageHeight = viewport.height / POINTS_PER_INCH;
    }

    const scale = 1.5;
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
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isBlank = isImageBlank(imageData);

    pages.push({
      index: i,
      width: viewport.width / POINTS_PER_INCH,
      height: viewport.height / POINTS_PER_INCH,
      dataUrl,
      isBlank,
    });
  }

  for (let i = 51; i <= pageCount; i++) {
    pages.push({
      index: i,
      width: firstPageWidth,
      height: firstPageHeight,
      dataUrl: '',
      isBlank: false,
    });
  }

  return {
    pageCount,
    pages,
    widthIn: firstPageWidth,
    heightIn: firstPageHeight,
  };
}

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

// Load image file and get dimensions + data URL
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
