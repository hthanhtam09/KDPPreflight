'use client'

import { getOrLoadPdfDoc } from '@/engine/pdf-processor'
import type { KRFixOperationType } from './fix-capabilities'

export type { KRFixOperationType }

export interface FixProgress {
  phase: 'loading' | 'rendering' | 'encoding' | 'done' | 'error'
  current: number
  total: number
  message: string
}

export interface FixResultData {
  blob: Blob
  originalSizeMb: number
  fixedSizeMb: number
  pagesProcessed: number
  operationsApplied: string[]
}

export interface PageFixPreview {
  dataUrl: string
  widthPt: number
  heightPt: number
}

export interface PageFixPlan {
  pageNumber: number
  operations: KRFixOperationType[]
  options?: FixExportOptions
  label: string
}

export interface FixExportOptions {
  bleedMode?: 'mirror' | 'solid'
  normalizeMode?: 'fit' | 'fill' | 'center'
  targetWidthPt?: number
  targetHeightPt?: number
  quality?: number
  brightness?: number
  contrast?: number
}

// ── Minimal PDF-from-JPEG encoder ─────────────────────────────────────────────
//
// Builds a valid PDF 1.4 file from an array of JPEG images (one per page).
// Each page is placed as a JPEG XObject filling the MediaBox exactly.
// Object layout:
//   1         = Catalog
//   2         = Pages
//   3..n+2    = Page objects
//   n+3..2n+2 = Content streams
//   2n+3..3n+2= Image XObjects

function buildPDFFromImages(pages: ReadonlyArray<{
  jpegBytes: Uint8Array
  pixelWidth: number
  pixelHeight: number
  widthPt: number
  heightPt: number
}>): Uint8Array {
  const enc = new TextEncoder()
  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let pos = 0

  const append = (s: string): void => {
    const b = enc.encode(s)
    chunks.push(b)
    pos += b.length
  }
  const appendBin = (b: Uint8Array): void => {
    chunks.push(b)
    pos += b.length
  }

  const n = pages.length

  // PDF header + binary comment so tools recognise it as binary
  append('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')

  // Object 1: Catalog
  offsets[1] = pos
  append('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')

  // Object 2: Pages
  const kids = Array.from({ length: n }, (_, i) => `${i + 3} 0 R`).join(' ')
  offsets[2] = pos
  append(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${n} >>\nendobj\n`)

  // Objects 3..n+2: Page dictionaries
  for (let i = 0; i < n; i++) {
    const { widthPt, heightPt } = pages[i]
    const pageNum    = 3 + i
    const contentNum = 3 + n + i
    const imgNum     = 3 + 2 * n + i
    offsets[pageNum] = pos
    append(
      `${pageNum} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R ` +
      `/MediaBox [0 0 ${widthPt.toFixed(3)} ${heightPt.toFixed(3)}] ` +
      `/Contents ${contentNum} 0 R ` +
      `/Resources << /XObject << /Im${i} ${imgNum} 0 R >> >> ` +
      `>>\nendobj\n`
    )
  }

  // Objects n+3..2n+2: Content streams (draw image full-page)
  for (let i = 0; i < n; i++) {
    const { widthPt, heightPt } = pages[i]
    const contentNum = 3 + n + i
    const stream = enc.encode(
      `q ${widthPt.toFixed(3)} 0 0 ${heightPt.toFixed(3)} 0 0 cm /Im${i} Do Q\n`
    )
    offsets[contentNum] = pos
    append(`${contentNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n`)
    appendBin(stream)
    append('\nendstream\nendobj\n')
  }

  // Objects 2n+3..3n+2: JPEG Image XObjects
  for (let i = 0; i < n; i++) {
    const { jpegBytes, pixelWidth, pixelHeight } = pages[i]
    const imgNum = 3 + 2 * n + i
    offsets[imgNum] = pos
    append(
      `${imgNum} 0 obj\n` +
      `<< /Type /XObject /Subtype /Image ` +
      `/Width ${pixelWidth} /Height ${pixelHeight} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 ` +
      `/Filter /DCTDecode /Length ${jpegBytes.length} ` +
      `>>\nstream\n`
    )
    appendBin(jpegBytes)
    append('\nendstream\nendobj\n')
  }

  // Cross-reference table
  const totalObjs = 3 * n + 3
  const xrefPos = pos
  append(`xref\n0 ${totalObjs}\n`)
  append('0000000000 65535 f \n')
  for (let i = 1; i < totalObjs; i++) {
    append(`${String(offsets[i] ?? 0).padStart(10, '0')} 00000 n \n`)
  }
  append(`trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`)

  // Flatten chunks into a single Uint8Array
  let total = 0
  for (const c of chunks) total += c.length
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) { out.set(c, offset); offset += c.length }
  return out
}

// ── Grayscale conversion (ITU-R BT.601 luma) ─────────────────────────────────

function toGrayscale(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imgData = ctx.getImageData(0, 0, w, h)
  const px = imgData.data
  for (let i = 0; i < px.length; i += 4) {
    const g = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2])
    px[i] = g; px[i + 1] = g; px[i + 2] = g
  }
  ctx.putImageData(imgData, 0, 0)
}

function adjustPrintTone(ctx: CanvasRenderingContext2D, w: number, h: number, brightness = 8, contrast = 6): void {
  const imgData = ctx.getImageData(0, 0, w, h)
  const px = imgData.data
  const c = (259 * (contrast + 255)) / (255 * (259 - contrast))
  for (let i = 0; i < px.length; i += 4) {
    px[i]     = Math.max(0, Math.min(255, c * (px[i] - 128) + 128 + brightness))
    px[i + 1] = Math.max(0, Math.min(255, c * (px[i + 1] - 128) + 128 + brightness))
    px[i + 2] = Math.max(0, Math.min(255, c * (px[i + 2] - 128) + 128 + brightness))
  }
  ctx.putImageData(imgData, 0, 0)
}

function coverCropMarkZones(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const zone = Math.max(18, Math.round(Math.min(w, h) * 0.035))
  ctx.save()
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, zone, zone)
  ctx.fillRect(w - zone, 0, zone, zone)
  ctx.fillRect(0, h - zone, zone, zone)
  ctx.fillRect(w - zone, h - zone, zone, zone)
  ctx.restore()
}

function addBleedCanvas(source: HTMLCanvasElement, mode: 'mirror' | 'solid'): HTMLCanvasElement {
  const bleedPx = Math.max(12, Math.round(Math.min(source.width, source.height) * 0.014))
  const out = document.createElement('canvas')
  out.width = source.width + bleedPx * 2
  out.height = source.height + bleedPx * 2
  const ctx = out.getContext('2d')!

  if (mode === 'mirror') {
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(source, 0, 0, bleedPx, source.height, -bleedPx, bleedPx, bleedPx, source.height)
    ctx.drawImage(source, source.width - bleedPx, 0, bleedPx, source.height, -out.width, bleedPx, bleedPx, source.height)
    ctx.restore()

    ctx.save()
    ctx.scale(1, -1)
    ctx.drawImage(source, 0, 0, source.width, bleedPx, bleedPx, -bleedPx, source.width, bleedPx)
    ctx.drawImage(source, 0, source.height - bleedPx, source.width, bleedPx, bleedPx, -out.height, source.width, bleedPx)
    ctx.restore()
  } else {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, out.width, out.height)
  }

  ctx.drawImage(source, bleedPx, bleedPx)
  return out
}

function normalizeCanvas(
  source: HTMLCanvasElement,
  targetWidthPt: number,
  targetHeightPt: number,
  sourceWidthPt: number,
  sourceHeightPt: number,
  mode: 'fit' | 'fill' | 'center',
): { canvas: HTMLCanvasElement; widthPt: number; heightPt: number } {
  const targetPixelWidth = Math.max(1, Math.round(source.width * (targetWidthPt / sourceWidthPt)))
  const targetPixelHeight = Math.max(1, Math.round(source.height * (targetHeightPt / sourceHeightPt)))
  const out = document.createElement('canvas')
  out.width = targetPixelWidth
  out.height = targetPixelHeight
  const ctx = out.getContext('2d')!
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, out.width, out.height)

  const scale = mode === 'center'
    ? 1
    : mode === 'fill'
      ? Math.max(out.width / source.width, out.height / source.height)
      : Math.min(out.width / source.width, out.height / source.height)
  const drawW = source.width * scale
  const drawH = source.height * scale
  ctx.drawImage(source, (out.width - drawW) / 2, (out.height - drawH) / 2, drawW, drawH)

  return { canvas: out, widthPt: targetWidthPt, heightPt: targetHeightPt }
}

// ── Canvas → JPEG bytes ───────────────────────────────────────────────────────

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Uint8Array {
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function applyOperationsToCanvas(
  canvas: HTMLCanvasElement,
  viewportWidthPt: number,
  viewportHeightPt: number,
  operations: KRFixOperationType[],
  options: FixExportOptions,
): { canvas: HTMLCanvasElement; widthPt: number; heightPt: number } {
  const ctx = canvas.getContext('2d')!
  if (operations.includes('cleanup-crop-marks')) coverCropMarkZones(ctx, canvas.width, canvas.height)
  if (operations.includes('print-color-adjust')) adjustPrintTone(ctx, canvas.width, canvas.height, options.brightness, options.contrast)
  if (operations.includes('grayscale-pdf')) toGrayscale(ctx, canvas.width, canvas.height)

  let outputCanvas = canvas
  let outputWidthPt = viewportWidthPt
  let outputHeightPt = viewportHeightPt

  if (operations.includes('normalize-page-size') && options.targetWidthPt && options.targetHeightPt) {
    const normalized = normalizeCanvas(
      outputCanvas,
      options.targetWidthPt,
      options.targetHeightPt,
      viewportWidthPt,
      viewportHeightPt,
      options.normalizeMode ?? 'fit',
    )
    outputCanvas = normalized.canvas
    outputWidthPt = normalized.widthPt
    outputHeightPt = normalized.heightPt
  }

  if (operations.includes('add-bleed')) {
    const bleedCanvas = addBleedCanvas(outputCanvas, options.bleedMode ?? 'mirror')
    if (outputCanvas !== canvas) {
      outputCanvas.width = 0
      outputCanvas.height = 0
    }
    outputCanvas = bleedCanvas
    outputWidthPt += 18
    outputHeightPt += 18
  }

  return { canvas: outputCanvas, widthPt: outputWidthPt, heightPt: outputHeightPt }
}

export async function renderPageFixPreview(
  file: File,
  plan: PageFixPlan,
  onProgress?: (p: FixProgress) => void,
  shouldCancel?: () => boolean,
): Promise<PageFixPreview> {
  onProgress?.({ phase: 'loading', current: 0, total: 3, message: 'Loading page...' })
  const doc = await getOrLoadPdfDoc(file)

  if (shouldCancel?.()) throw new Error('Fix cancelled')
  onProgress?.({ phase: 'rendering', current: 1, total: 3, message: 'Rendering fixed preview...' })
  const page = await doc.getPage(plan.pageNumber)
  const viewport1 = page.getViewport({ scale: 1 })
  const renderViewport = page.getViewport({ scale: 220 / 72 })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(renderViewport.width)
  canvas.height = Math.round(renderViewport.height)
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport: renderViewport } as Parameters<typeof page.render>[0]).promise

  if (shouldCancel?.()) throw new Error('Fix cancelled')
  onProgress?.({ phase: 'encoding', current: 2, total: 3, message: 'Preparing comparison...' })
  const output = applyOperationsToCanvas(canvas, viewport1.width, viewport1.height, plan.operations, plan.options ?? {})
  const dataUrl = output.canvas.toDataURL('image/png')

  if (output.canvas !== canvas) {
    output.canvas.width = 0
    output.canvas.height = 0
  }
  canvas.width = 0
  canvas.height = 0
  page.cleanup()
  onProgress?.({ phase: 'done', current: 3, total: 3, message: 'Preview ready.' })
  return { dataUrl, widthPt: output.widthPt, heightPt: output.heightPt }
}

export async function applyPageFixes(
  file: File,
  fixes: PageFixPlan[],
  onProgress: (p: FixProgress) => void,
  shouldCancel?: () => boolean,
  globalOpts?: { grayscale?: boolean },
): Promise<FixResultData> {
  const originalSizeMb = file.size / 1048576
  const fixMap = new Map<number, PageFixPlan>()
  for (const fix of fixes) fixMap.set(fix.pageNumber, fix)
  const hasOptimize = fixes.some(f => f.operations.includes('optimize-pdf'))
  const targetDpi = hasOptimize ? (originalSizeMb > 200 ? 150 : 200) : 220
  const renderScale = targetDpi / 72

  onProgress({ phase: 'loading', current: 0, total: 1, message: 'Loading original PDF...' })
  const doc = await getOrLoadPdfDoc(file)
  const pageCount = doc.numPages

  interface RenderedPage {
    jpegBytes: Uint8Array
    pixelWidth: number
    pixelHeight: number
    widthPt: number
    heightPt: number
  }
  const renderedPages: RenderedPage[] = []

  for (let i = 1; i <= pageCount; i++) {
    if (shouldCancel?.()) throw new Error('Fix cancelled')
    const plan = fixMap.get(i)
    onProgress({
      phase: 'rendering',
      current: i,
      total: pageCount,
      message: plan ? `Merging fixed page ${i} of ${pageCount}...` : `Keeping page ${i} of ${pageCount}...`,
    })

    const page = await doc.getPage(i)
    const viewport1 = page.getViewport({ scale: 1 })
    const renderViewport = page.getViewport({ scale: renderScale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(renderViewport.width)
    canvas.height = Math.round(renderViewport.height)
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport: renderViewport } as Parameters<typeof page.render>[0]).promise

    const output = plan
      ? applyOperationsToCanvas(canvas, viewport1.width, viewport1.height, plan.operations, plan.options ?? {})
      : { canvas, widthPt: viewport1.width, heightPt: viewport1.height }

    if (globalOpts?.grayscale && !plan?.operations.includes('grayscale-pdf')) {
      toGrayscale(output.canvas.getContext('2d')!, output.canvas.width, output.canvas.height)
    }

    const quality = plan?.options?.quality ?? (hasOptimize ? 0.76 : 0.92)

    renderedPages.push({
      jpegBytes: canvasToJpeg(output.canvas, quality),
      pixelWidth: output.canvas.width,
      pixelHeight: output.canvas.height,
      widthPt: output.widthPt,
      heightPt: output.heightPt,
    })

    if (output.canvas !== canvas) {
      output.canvas.width = 0
      output.canvas.height = 0
    }
    canvas.width = 0
    canvas.height = 0
    page.cleanup()
    await new Promise<void>(r => setTimeout(r, 0))
  }

  onProgress({ phase: 'encoding', current: pageCount, total: pageCount, message: 'Creating download...' })
  const pdfBytes = buildPDFFromImages(renderedPages)
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const fixedSizeMb = blob.size / 1048576
  onProgress({ phase: 'done', current: pageCount, total: pageCount, message: 'Done!' })

  return {
    blob,
    originalSizeMb,
    fixedSizeMb,
    pagesProcessed: pageCount,
    operationsApplied: fixes.map(f => `Page ${f.pageNumber}: ${f.label}`),
  }
}

// ── Main fix orchestrator ─────────────────────────────────────────────────────

export async function applyAutoFixes(
  file: File,
  operations: KRFixOperationType[],
  onProgress: (p: FixProgress) => void,
  options: FixExportOptions = {},
  shouldCancel?: () => boolean,
): Promise<FixResultData> {
  const originalSizeMb = file.size / 1048576

  const doGrayscale    = operations.includes('grayscale-pdf')
  const doOptimize     = operations.includes('optimize-pdf')
  const doAddBlankPage = operations.includes('add-blank-page')
  const doAddBleed     = operations.includes('add-bleed')
  const doNormalize    = operations.includes('normalize-page-size')
  const doCropCleanup  = operations.includes('cleanup-crop-marks')
  const doPrintAdjust  = operations.includes('print-color-adjust')

  // Choose render DPI and JPEG quality based on the operations requested
  let targetDpi: number
  let jpegQuality: number

  if (doOptimize) {
    if (originalSizeMb > 200) {
      targetDpi = 150; jpegQuality = 0.72
    } else {
      targetDpi = 200; jpegQuality = 0.78
    }
  } else {
    // Non-optimization fixes still need good quality
    targetDpi = 250; jpegQuality = 0.85
  }
  if (typeof options.quality === 'number') jpegQuality = options.quality

  onProgress({ phase: 'loading', current: 0, total: 1, message: 'Loading PDF…' })

  const doc = await getOrLoadPdfDoc(file)
  const pageCount = doc.numPages

  const POINTS_PER_INCH = 72
  const renderScale = targetDpi / POINTS_PER_INCH

  interface RenderedPage {
    jpegBytes: Uint8Array
    pixelWidth: number
    pixelHeight: number
    widthPt: number
    heightPt: number
  }

  const renderedPages: RenderedPage[] = []

  for (let i = 1; i <= pageCount; i++) {
    if (shouldCancel?.()) throw new Error('Fix cancelled')
    onProgress({
      phase: 'rendering',
      current: i,
      total: pageCount,
      message: `Rendering page ${i} of ${pageCount}…`,
    })

    const page = await doc.getPage(i)
    const viewport1      = page.getViewport({ scale: 1 })
    const renderViewport = page.getViewport({ scale: renderScale })

    const canvas = document.createElement('canvas')
    canvas.width  = Math.round(renderViewport.width)
    canvas.height = Math.round(renderViewport.height)
    const ctx = canvas.getContext('2d')!

    await page.render(
      { canvasContext: ctx, viewport: renderViewport } as Parameters<typeof page.render>[0]
    ).promise

    if (doCropCleanup) coverCropMarkZones(ctx, canvas.width, canvas.height)
    if (doPrintAdjust) adjustPrintTone(ctx, canvas.width, canvas.height, options.brightness, options.contrast)
    if (doGrayscale) toGrayscale(ctx, canvas.width, canvas.height)

    let outputCanvas = canvas
    let outputWidthPt = viewport1.width
    let outputHeightPt = viewport1.height

    if (doNormalize && options.targetWidthPt && options.targetHeightPt) {
      const normalized = normalizeCanvas(
        outputCanvas,
        options.targetWidthPt,
        options.targetHeightPt,
        viewport1.width,
        viewport1.height,
        options.normalizeMode ?? 'fit',
      )
      outputCanvas = normalized.canvas
      outputWidthPt = normalized.widthPt
      outputHeightPt = normalized.heightPt
    }

    if (doAddBleed) {
      const bleedCanvas = addBleedCanvas(outputCanvas, options.bleedMode ?? 'mirror')
      if (outputCanvas !== canvas) {
        outputCanvas.width = 0
        outputCanvas.height = 0
      }
      outputCanvas = bleedCanvas
      outputWidthPt += 18
      outputHeightPt += 18
    }

    renderedPages.push({
      jpegBytes:   canvasToJpeg(outputCanvas, jpegQuality),
      pixelWidth:  outputCanvas.width,
      pixelHeight: outputCanvas.height,
      widthPt:     outputWidthPt,
      heightPt:    outputHeightPt,
    })

    // Release canvas memory immediately
    if (outputCanvas !== canvas) {
      outputCanvas.width = 0
      outputCanvas.height = 0
    }
    canvas.width  = 0
    canvas.height = 0
    page.cleanup()

    // Yield to event loop so progress updates are painted between pages
    await new Promise<void>(r => setTimeout(r, 0))
  }

  // Append a blank page if requested
  if (doAddBlankPage) {
    const ref = renderedPages[renderedPages.length - 1]
    const blank = document.createElement('canvas')
    blank.width  = ref.pixelWidth
    blank.height = ref.pixelHeight
    const ctx = blank.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, blank.width, blank.height)
    renderedPages.push({
      jpegBytes:   canvasToJpeg(blank, 0.9),
      pixelWidth:  ref.pixelWidth,
      pixelHeight: ref.pixelHeight,
      widthPt:     ref.widthPt,
      heightPt:    ref.heightPt,
    })
    blank.width = 0
    blank.height = 0
  }

  onProgress({ phase: 'encoding', current: 0, total: 1, message: 'Building corrected PDF…' })

  const pdfBytes = buildPDFFromImages(renderedPages)
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const fixedSizeMb = blob.size / 1048576

  onProgress({ phase: 'done', current: 1, total: 1, message: 'Done!' })

  const operationsApplied: string[] = []
  if (doOptimize)
    operationsApplied.push(
      `PDF size reduced: ${originalSizeMb.toFixed(0)} MB → ${fixedSizeMb.toFixed(0)} MB`
    )
  if (doGrayscale)
    operationsApplied.push('Converted to grayscale')
  if (doAddBlankPage)
    operationsApplied.push('Added blank final page')
  if (doAddBleed)
    operationsApplied.push(`Added 0.125" bleed using ${options.bleedMode === 'solid' ? 'solid-fill' : 'mirrored-edge'} extension`)
  if (operations.includes('normalize-page-size'))
    operationsApplied.push('Normalized page boxes for KDP consistency')
  if (doCropCleanup)
    operationsApplied.push('Cleaned likely crop-mark zones')
  if (doPrintAdjust)
    operationsApplied.push('Adjusted approximate print brightness and contrast')

  return {
    blob,
    originalSizeMb,
    fixedSizeMb,
    pagesProcessed: renderedPages.length,
    operationsApplied,
  }
}
