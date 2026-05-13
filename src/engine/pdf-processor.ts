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
    lib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
    pdfjsLib = lib;
    return lib;
  })();
  
  return pdfjsLoading;
}

export interface PDFPageInfo {
  index: number;
  width: number;
  height: number;
  dataUrl: string;
  isBlank: boolean;
}

// ---------------------------------------------------------------------------
// Cache System — render once, reuse textures
// ---------------------------------------------------------------------------

// In-memory cache for rendered page data URLs
const pageCache = new Map<string, string>(); // key: `${fileId}:${pageIndex}:${scale}`
// In-memory cache for PDF document objects
const pdfDocCache = new Map<string, any>(); // key: file fingerprint

function getFileFingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function getCacheKey(fileId: string, pageIndex: number, scale: number): string {
  return `${fileId}:${pageIndex}:${scale}`;
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

export async function loadPDF(file: File, options?: { maxPages?: number; renderScale?: number }): Promise<{
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
  
  const POINTS_PER_INCH = 72;
  
  for (let i = 1; i <= Math.min(pageCount, maxPages); i++) {
    const cacheKey = getCacheKey(fileId, i, renderScale);
    const cached = pageCache.get(cacheKey);
    
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    
    if (i === 1) {
      firstPageWidth = viewport.width / POINTS_PER_INCH;
      firstPageHeight = viewport.height / POINTS_PER_INCH;
    }
    
    if (cached) {
      // Use cached texture
      pages.push({
        index: i,
        width: viewport.width / POINTS_PER_INCH,
        height: viewport.height / POINTS_PER_INCH,
        dataUrl: cached,
        isBlank: false, // Already checked when cached
      });
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
    
    pages.push({
      index: i,
      width: viewport.width / POINTS_PER_INCH,
      height: viewport.height / POINTS_PER_INCH,
      dataUrl,
      isBlank,
    });
  }
  
  // Placeholder entries for pages beyond maxPages
  for (let i = maxPages + 1; i <= pageCount; i++) {
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

// ---------------------------------------------------------------------------
// Render a single page — lazy loading with caching
// ---------------------------------------------------------------------------

export async function renderSinglePage(
  file: File,
  pageIndex: number,
  scale: number = 2.0
): Promise<{ dataUrl: string; widthIn: number; heightIn: number }> {
  const pdfjs = await getPdfjs();
  const POINTS_PER_INCH = 72;
  
  const fileId = getFileFingerprint(file);
  const cacheKey = getCacheKey(fileId, pageIndex, scale);
  
  // Check cache first
  const cached = pageCache.get(cacheKey);
  if (cached) {
    // We still need dimensions; try to get from doc cache
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
  canvas.width = renderViewport.width;
  canvas.height = renderViewport.height;
  const ctx = canvas.getContext('2d')!;
  
  await page.render({
    canvasContext: ctx,
    viewport: renderViewport,
  }).promise;
  
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  
  // Cache the result
  pageCache.set(cacheKey, dataUrl);
  
  // Also cache thumbnail
  const thumbKey = `${fileId}:${pageIndex}:thumb`;
  if (!thumbnailCache.has(thumbKey)) {
    thumbnailCache.set(thumbKey, canvas.toDataURL('image/jpeg', 0.5));
  }
  
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
