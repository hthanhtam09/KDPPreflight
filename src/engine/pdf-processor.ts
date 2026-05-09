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
    // Point to the worker file we copied to /public
    // This avoids the "No GlobalWorkerOptions.workerSrc" error
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
  dataUrl: string;
  isBlank: boolean;
}

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
  
  // PDF uses 72 points per inch
  const POINTS_PER_INCH = 72;
  
  for (let i = 1; i <= Math.min(pageCount, 50); i++) { // Limit to first 50 pages for performance
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    
    if (i === 1) {
      firstPageWidth = viewport.width / POINTS_PER_INCH;
      firstPageHeight = viewport.height / POINTS_PER_INCH;
    }
    
    // Render page at 1.5x scale for decent quality
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
    
    // Check if page is blank (sample pixels)
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
  
  // If more than 50 pages, add placeholder entries for the rest
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
