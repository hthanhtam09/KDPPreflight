'use client'

import { TRIM_SIZES } from '@/engine/kdp-constants'
import { renderSinglePage } from '@/engine/pdf-processor'
import { toast } from '@/hooks/use-toast'
import type { BleedType, InteriorType, PaperType, TrimSizeKey } from '@/types/kdp'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crop,
  Download,
  FileText,
  ImageDown,
  Loader2,
  Maximize2,
  Move,
  Scan,
  SlidersHorizontal,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  applyAutoFixes,
  applyPageFixes,
  renderPageFixPreview,
  type FixExportOptions,
  type FixProgress,
  type PageFixPlan,
  type PageFixPreview,
} from './autofix-engine'
import { FIX_CAPABILITIES, issueFixability, type KRFixOperationType } from './fix-capabilities'
import type {
  KRCoverData,
  KRDetectedSettings,
  KRFixability,
  KRIssue,
  KRIssueType,
  KRPageBoxDebug,
  KRPageDiagnostics,
  KRResult,
} from './types'

type PageTab = 'problem' | 'all'
type PreviewMode = 'original' | 'fixed' | 'compare'
type ViewMode = 'single' | 'spread'
type RenderMode = 'fast' | 'hq'
type QualityMode = 'high' | 'balanced' | 'small'
type PageStatus = 'ok' | 'issue' | 'fixed' | 'unchecked'
type ViewContext = 'manuscript' | 'cover'
type CoverTab = 'spread' | 'front' | 'spine' | 'back'
type FixMode = 'fit' | 'fill' | 'center'

interface PageIssue {
  pageNumber: number
  issues: KRIssue[]
}

interface SpreadItem {
  key: string
  left: number | null
  right: number | null
  pages: number[]
  label: string
}

interface CoverZoneItem {
  key: CoverTab
  label: string
  issues: KRIssue[]
}

interface FixedPage {
  pageNumber: number
  plan: PageFixPlan
  preview: PageFixPreview
  issueId: string
  appliedAt: number
  message: string
}

interface DownloadAsset {
  readonly blob: Blob
  readonly fileName: string
}

interface LastDownload {
  readonly blob: Blob
  readonly fileName: string
}

interface DraftFixPreview {
  pageNumber: number
  issueId: string
  mode: FixMode
  plan: PageFixPlan
  preview: PageFixPreview
}

interface PageFixState {
  readonly mode: FixMode
  readonly previewMode: PreviewMode
}

// ── Config drawer constants ───────────────────────────────────────────────────

const DRAWER_TRIM_OPTIONS = Object.entries(TRIM_SIZES)
  .filter(([k]) => k !== 'custom')
  .map(([k, v]) => ({ value: k as TrimSizeKey, label: v.label }))

const DRAWER_BLEED_OPTIONS: { value: BleedType; label: string }[] = [
  { value: 'no-bleed', label: 'No bleed (white margins only)' },
  { value: 'bleed', label: 'Bleed enabled (0.125" on each side)' },
]

const DRAWER_PAPER_OPTIONS: { value: PaperType; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'cream', label: 'Cream' },
  { value: 'premium-color', label: 'Premium Color' },
]

const DRAWER_INTERIOR_OPTIONS: { value: InteriorType; label: string }[] = [
  { value: 'black-white', label: 'Black & White' },
  { value: 'standard-color', label: 'Standard Color' },
  { value: 'premium-color', label: 'Premium Color' },
]

const DRAWER_PAPER_THICKNESS: Record<PaperType, number> = {
  white: 0.002252,
  cream: 0.0025,
  'premium-color': 0.003,
}

// ── Config drawer component ───────────────────────────────────────────────────

interface ConfigDrawerProps {
  readonly open: boolean
  readonly settings: KRDetectedSettings
  readonly files?: { manuscript: File | null; cover: File | null }
  readonly onClose: () => void
  readonly onApply: (settings: KRDetectedSettings) => void
}

function ConfigDrawer({ open, settings, files, onClose, onApply }: ConfigDrawerProps) {
  const [s, setS] = useState<KRDetectedSettings>(settings)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setS(settings)
    })
    return () => {
      cancelled = true
    }
  }, [open, settings])

  const update = <K extends keyof KRDetectedSettings>(k: K, v: KRDetectedSettings[K]) => {
    setS((prev) => ({
      ...prev,
      [k]: v,
      configSource: 'user' as const,
      configLocked: true,
      lastUpdated: Date.now(),
    }))
  }

  const isPrint = s.bookType !== 'kindle'
  const spineIn = s.pageCount * (DRAWER_PAPER_THICKNESS[s.paper] ?? DRAWER_PAPER_THICKNESS.white)
  const fmt = (b: number) => `${(b / 1048576).toFixed(1)} MB`

  return (
    <>
      {open && <div className="absolute inset-0 z-40 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />}
      <div
        className={[
          'absolute inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-black/10 bg-[#f6f8fb] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-black/8 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">Book Config</h3>
            <p className="text-xs text-black/40">
              {s.configSource === 'user' ? 'User edited' : 'Auto-detected'}
              {s.configLocked && ' · Locked'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/6 text-black/45 hover:text-black/65"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black/55">Trim size</label>
            <select
              value={s.trimSize}
              onChange={(e) => update('trimSize', e.target.value as TrimSizeKey)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#0f172a] outline-none focus:border-[#df8e51]/60 focus:ring-2 focus:ring-[#df8e51]/20"
            >
              {DRAWER_TRIM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {isPrint && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/55">Bleed</label>
              <select
                value={s.bleed}
                onChange={(e) => update('bleed', e.target.value as BleedType)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#0f172a] outline-none focus:border-[#df8e51]/60 focus:ring-2 focus:ring-[#df8e51]/20"
              >
                {DRAWER_BLEED_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isPrint && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/55">Interior type</label>
              <div className="space-y-2">
                {DRAWER_INTERIOR_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="config-drawer-interior"
                      value={opt.value}
                      checked={s.interior === opt.value}
                      onChange={() => update('interior', opt.value as InteriorType)}
                      className="accent-[#df8e51]"
                    />
                    <span className="text-sm font-medium text-[#0f172a]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {isPrint && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/55">Paper type</label>
              <select
                value={s.paper}
                onChange={(e) => update('paper', e.target.value as PaperType)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#0f172a] outline-none focus:border-[#df8e51]/60 focus:ring-2 focus:ring-[#df8e51]/20"
              >
                {DRAWER_PAPER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black/55">Page count</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={s.pageCount}
              onChange={(e) => update('pageCount', Math.max(1, Number.parseInt(e.target.value) || 1))}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#0f172a] outline-none focus:border-[#df8e51]/60 focus:ring-2 focus:ring-[#df8e51]/20"
            />
          </div>

          {isPrint && (
            <div className="rounded-xl border border-black/8 bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black/35">Est. spine width</p>
              <p className="mt-1 text-sm font-bold text-[#0f172a]">
                {spineIn.toFixed(3)}"
                <span className="ml-1.5 text-xs font-normal text-black/40">
                  {spineIn < 0.13 ? '· Too narrow for spine text' : spineIn < 0.5 ? '· Small spine' : '· Room for text'}
                </span>
              </p>
            </div>
          )}

          {(files?.manuscript || files?.cover) && (
            <div className="rounded-xl border border-black/8 bg-white p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">Uploaded files</p>
              {files?.manuscript && (
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-black/60">{files.manuscript.name}</span>
                  <span className="shrink-0 text-xs text-black/35">{fmt(files.manuscript.size)}</span>
                </div>
              )}
              {files?.cover && (
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-black/60">{files.cover.name}</span>
                  <span className="shrink-0 text-xs text-black/35">{fmt(files.cover.size)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-black/8 p-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              onApply(s)
              onClose()
            }}
            className="w-full rounded-xl bg-[#df8e51] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#c2410c] active:scale-[0.98]"
          >
            Apply changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-black/10 py-2.5 text-sm font-semibold text-black/55 hover:bg-black/3"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

const QUALITY: Record<QualityMode, { label: string; value: number }> = {
  high: { label: 'High quality', value: 0.86 },
  balanced: { label: 'Balanced', value: 0.76 },
  small: { label: 'Smaller file', value: 0.66 },
}

const FALLBACK_PAGE = { widthIn: 6, heightIn: 9 }
const SAFE_MARGIN_IN = 0.25
const BLEED_MARGIN_IN = 0.125
const FIX_ALL_SAFE_TYPES = new Set<KRIssueType>([
  'bleed-missing',
  'size-mismatch',
  'color-in-bw-book',
  'pdf-too-large',
  'oversized-file-risk',
  'blurry-page-risk',
])

interface FixAllConfirmState {
  pages: number[]
  fixLabel: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pageBoxSize(debug?: KRPageBoxDebug | null): { widthIn: number; heightIn: number } {
  const box = debug?.cropBox ?? debug?.mediaBox ?? debug?.printBox
  if (!box || box.widthIn <= 0 || box.heightIn <= 0) return FALLBACK_PAGE
  return { widthIn: box.widthIn, heightIn: box.heightIn }
}

function guideInsets(
  debug: KRPageBoxDebug | undefined,
  bleed: string
): {
  bleed: CSSProperties
  trim: CSSProperties
  safe: CSSProperties
} {
  const { widthIn, heightIn } = pageBoxSize(debug)
  const trimX = bleed === 'bleed' ? Math.min((BLEED_MARGIN_IN / widthIn) * 100, 12) : 0
  const trimY = bleed === 'bleed' ? Math.min((BLEED_MARGIN_IN / heightIn) * 100, 12) : 0
  const safeX = Math.min(trimX + (SAFE_MARGIN_IN / widthIn) * 100, 24)
  const safeY = Math.min(trimY + (SAFE_MARGIN_IN / heightIn) * 100, 24)
  return {
    bleed: { left: '0%', right: '0%', top: '0%', bottom: '0%' },
    trim: { left: `${trimX}%`, right: `${trimX}%`, top: `${trimY}%`, bottom: `${trimY}%` },
    safe: { left: `${safeX}%`, right: `${safeX}%`, top: `${safeY}%`, bottom: `${safeY}%` },
  }
}

function spreadFor(pageNumber: number, pageCount: number): [number | null, number | null] {
  if (pageNumber <= 1) return [null, 1]
  const left = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1
  return [left, left + 1 <= pageCount ? left + 1 : null]
}

function pageRangeLabel(viewMode: ViewMode, selectedPage: number, pageCount: number): string {
  if (viewMode === 'single') return `Page ${selectedPage} of ${pageCount}`
  const [left, right] = spreadFor(selectedPage, pageCount)
  if (!left && right) return `Pages blank–1 of ${pageCount}`
  if (left && right) return `Pages ${left}–${right} of ${pageCount}`
  return `Page ${left ?? right ?? selectedPage} of ${pageCount}`
}

function allSpreads(pageCount: number): SpreadItem[] {
  const spreads: SpreadItem[] = [{ key: 'blank-1', left: null, right: 1, pages: [1], label: 'Blank + Page 1' }]
  for (let page = 2; page <= pageCount; page += 2) {
    const right = page + 1 <= pageCount ? page + 1 : null
    spreads.push({
      key: `${page}-${right ?? 'blank'}`,
      left: page,
      right,
      pages: right ? [page, right] : [page],
      label: right ? `Pages ${page}–${right}` : `Page ${page}`,
    })
  }
  return spreads
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer())
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function u16(n: number): number[] {
  return [n & 255, (n >>> 8) & 255]
}
function u32(n: number): number[] {
  return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]
}

function dosDateTime(date = new Date()): { time: number; day: number } {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, day }
}

async function buildZip(assets: DownloadAsset[]): Promise<Blob> {
  const enc = new TextEncoder()
  const chunks: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  const { time, day } = dosDateTime()

  const concat = (parts: Uint8Array[]) => {
    const total = parts.reduce((sum, part) => sum + part.length, 0)
    const out = new Uint8Array(total)
    let pos = 0
    for (const part of parts) {
      out.set(part, pos)
      pos += part.length
    }
    return out
  }

  for (const asset of assets) {
    const bytes = await blobToBytes(asset.blob)
    const name = enc.encode(asset.fileName)
    const crc = crc32(bytes)
    const localOffset = offset
    const local = concat([
      new Uint8Array([
        ...u32(0x04034b50),
        ...u16(20),
        ...u16(0),
        ...u16(0),
        ...u16(time),
        ...u16(day),
        ...u32(crc),
        ...u32(bytes.length),
        ...u32(bytes.length),
        ...u16(name.length),
        ...u16(0),
      ]),
      name,
      bytes,
    ])
    chunks.push(local)
    offset += local.length

    central.push(
      concat([
        new Uint8Array([
          ...u32(0x02014b50),
          ...u16(20),
          ...u16(20),
          ...u16(0),
          ...u16(0),
          ...u16(time),
          ...u16(day),
          ...u32(crc),
          ...u32(bytes.length),
          ...u32(bytes.length),
          ...u16(name.length),
          ...u16(0),
          ...u16(0),
          ...u16(0),
          ...u16(0),
          ...u32(0),
          ...u32(localOffset),
        ]),
        name,
      ])
    )
  }

  const centralStart = offset
  const centralBlob = concat(central)
  chunks.push(centralBlob)
  chunks.push(
    new Uint8Array([
      ...u32(0x06054b50),
      ...u16(0),
      ...u16(0),
      ...u16(assets.length),
      ...u16(assets.length),
      ...u32(centralBlob.length),
      ...u32(centralStart),
      ...u16(0),
    ])
  )

  return new Blob(chunks as BlobPart[], { type: 'application/zip' })
}

async function buildDownloadAsset(assets: DownloadAsset[]): Promise<LastDownload> {
  if (assets.length === 1) return { blob: assets[0].blob, fileName: assets[0].fileName }
  return { blob: await buildZip(assets), fileName: 'preflight-package.zip' }
}

function isSupported(issue: KRIssue): boolean {
  return !!FIX_CAPABILITIES[issue.issueType]
}

function operationFor(issue: KRIssue): KRFixOperationType {
  return FIX_CAPABILITIES[issue.issueType]?.operationType ?? 'optimize-pdf'
}

function issueCopy(issue: KRIssue | null): {
  problem: string
  cause: string
  risk: string
  method: string
  originalLabel: string
  fixedLabel: string
} {
  if (!issue)
    return {
      problem: 'Page looks OK',
      cause: 'No KDP upload issue detected on this page.',
      risk: 'No immediate upload risk.',
      method: 'No fix needed.',
      originalLabel: 'Original page',
      fixedLabel: 'No fix needed',
    }
  switch (issue.issueType) {
    case 'bleed-missing':
      return {
        problem: 'This page is missing bleed.',
        cause: 'Your setup expects bleed, but the page is still trim-sized.',
        risk: 'KDP may reject the file or white borders may appear after trimming.',
        method: 'Expand this page by 0.125" on each side using the selected extension style.',
        originalLabel: 'No bleed area',
        fixedLabel: 'Bleed added',
      }
    case 'size-mismatch':
    case 'inconsistent-pages':
      return {
        problem:
          issue.id === 'size-slight' ? 'Page setup may not match trim size.' : 'Page size may not match your setup.',
        cause: 'The PDF page box differs from the confirmed KDP setup.',
        risk:
          issue.id === 'size-slight'
            ? 'Close to expected size — may be accepted by KDP.'
            : 'KDP may scale the page, add borders, or reject the upload.',
        method: 'Create a corrected page at the selected trim size and center the original content.',
        originalLabel: issue.id === 'size-slight' ? 'Needs review' : 'Size check',
        fixedLabel: 'Normalized page size',
      }
    case 'color-in-bw-book':
      return {
        problem: 'Color detected on a Black & White page.',
        cause: 'The confirmed interior is B&W but this page contains color.',
        risk: 'KDP will auto-convert, which may print muddy or washed out.',
        method: 'Convert this page to grayscale before export.',
        originalLabel: 'Color detected',
        fixedLabel: 'Converted to grayscale',
      }
    case 'pdf-too-large':
    case 'oversized-file-risk':
      return {
        problem: 'File is larger than recommended.',
        cause: 'Large page images slow KDP upload and processing.',
        risk: 'KDP upload may time out or reject very large files.',
        method: 'Recompress images during export.',
        originalLabel: 'Large page image',
        fixedLabel: 'Compressed preview',
      }
    case 'blurry-page-risk':
      return {
        problem: 'Page may appear blurry when printed.',
        cause: 'Low-resolution, low-contrast, or heavily compressed raster content detected.',
        risk: 'Printed text or images may look soft or difficult to read.',
        method:
          'Replace low-resolution source images with 300 DPI originals in your design app, then re-export the PDF. No in-app fix can recover missing resolution.',
        originalLabel: 'Quality risk',
        fixedLabel: 'Manual fix needed',
      }
    case 'dark-background-risk':
      return {
        problem: issue.title,
        cause: issue.where,
        risk: issue.whyMatters,
        method:
          'Order a physical proof copy before publishing. If the print looks too muddy, slightly lighten the background or increase contrast.',
        originalLabel: 'Dark print-heavy page',
        fixedLabel: 'Recommendation only',
      }
    case 'cover-size-mismatch':
      return {
        problem: 'Cover size does not match book setup.',
        cause: 'The cover PDF dimensions differ from the KDP-required full spread size.',
        risk: 'KDP will reject the cover file.',
        method: 'Download the KDP Cover Calculator template and re-export at the exact required size.',
        originalLabel: 'Size mismatch',
        fixedLabel: 'Manual fix needed',
      }
    case 'cover-bleed-missing':
      return {
        problem: 'Cover is missing bleed.',
        cause: 'KDP requires 0.125" bleed on all sides of the cover spread.',
        risk: 'White edges may appear after trimming.',
        method: 'Add 0.125" bleed on all four sides and extend background artwork to the edge.',
        originalLabel: 'No bleed',
        fixedLabel: 'Manual fix needed',
      }
    case 'cover-low-quality':
      return {
        problem: 'Cover may print blurry.',
        cause: 'This cover appears to contain low-resolution or over-compressed artwork.',
        risk: 'Images may appear blurry or pixelated in the printed book.',
        method: 'Replace raster images with high-resolution originals and re-export at 300 DPI or higher.',
        originalLabel: 'Quality risk',
        fixedLabel: 'Manual fix needed',
      }
    case 'spine-width-risk':
    case 'spine-text-risk':
      return {
        problem: 'Spine is narrow — text may be hard to read.',
        cause: 'Your page count and paper type result in a thin spine.',
        risk: 'KDP may not allow spine text on very narrow spines.',
        method: 'Use large, bold font centered on the spine. Leave spine blank if too narrow.',
        originalLabel: 'Spine risk',
        fixedLabel: 'Manual fix needed',
      }
    default:
      return {
        problem: issue.title,
        cause: issue.where,
        risk: issue.whyMatters,
        method: issue.howToFix,
        originalLabel: 'Problem highlighted',
        fixedLabel: 'Fixed preview',
      }
  }
}

function buildPageIssues(issues: KRIssue[], pageCount: number): PageIssue[] {
  const map = new Map<number, KRIssue[]>()
  for (const issue of issues) {
    if (issue.status === 'skipped' || issue.classification === 'skippedCheck') continue
    const refs = issue.pageRefs.length > 0 ? issue.pageRefs : Array.from({ length: pageCount }, (_, i) => i + 1)
    for (const ref of refs) {
      const page = Math.max(1, Math.min(pageCount, ref))
      map.set(page, [...(map.get(page) ?? []), issue])
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([pageNumber, pageIssues]) => ({ pageNumber, issues: pageIssues }))
}

function issueHighlight(issue: KRIssue | null): { label: string; style: CSSProperties } | null {
  if (!issue) return null
  switch (issue.issueType) {
    case 'bleed-missing':
      return { label: 'Missing bleed', style: { inset: '0%' } }
    case 'color-in-bw-book':
      return { label: 'Color detected', style: { inset: '8%' } }
    case 'dark-background-risk':
      return { label: 'Dark print risk', style: { inset: '8%' } }
    default:
      return null
  }
}

function fitModeTransform(issue: KRIssue | null, mode: 'fit' | 'fill' | 'center'): string | undefined {
  if (!issue || (issue.issueType !== 'size-mismatch' && issue.issueType !== 'inconsistent-pages')) return undefined
  if (mode === 'fill') return 'scale(1.08)'
  if (mode === 'center') return 'scale(1)'
  return 'scale(0.96)'
}

function fixKey(pageNumber: number, issueId: string | undefined | null): string {
  return `${pageNumber}:${issueId ?? 'page'}`
}

function recommendedFixMode(issue: KRIssue | null, debug?: KRPageBoxDebug | null): FixMode {
  if (!issue) return 'fit'
  if (issue.id === 'size-slight') return 'center'
  if (issue.issueType === 'bleed-missing') return 'fill'
  if (issue.issueType === 'size-mismatch' || issue.issueType === 'inconsistent-pages') {
    const maxDiff = Math.max(debug?.diffWidthIn ?? 0, debug?.diffHeightIn ?? 0)
    return maxDiff > 0 && maxDiff <= 0.08 ? 'center' : 'fit'
  }
  return 'fit'
}

function fixModeCopy(mode: FixMode): { label: string; explanation: string } {
  if (mode === 'fill') return { label: 'Fill & Crop', explanation: 'Fill the entire trim area. May crop edges.' }
  if (mode === 'center') return { label: 'Center', explanation: 'Keep original size and center page.' }
  return { label: 'Fit Inside', explanation: 'Preserve all content. Adds margins if needed.' }
}

function fixModeMeta(mode: FixMode) {
  const copy = fixModeCopy(mode)
  const Icon = mode === 'fill' ? Crop : mode === 'center' ? Move : Scan
  return { ...copy, Icon }
}

function fixModeScaleLabel(mode: FixMode, debug?: KRPageBoxDebug | null): string {
  if (mode === 'center') return 'Scale 100%'
  if (
    !debug?.expectedWidthIn ||
    !debug.expectedHeightIn ||
    debug.printBox.widthIn <= 0 ||
    debug.printBox.heightIn <= 0
  ) {
    return mode === 'fill' ? 'Scale to fill' : 'Scale to fit'
  }
  const widthScale = debug.expectedWidthIn / debug.printBox.widthIn
  const heightScale = debug.expectedHeightIn / debug.printBox.heightIn
  const scale = mode === 'fill' ? Math.max(widthScale, heightScale) : Math.min(widthScale, heightScale)
  return `Scale ${Math.round(scale * 100)}%`
}

// ── Cover zone helpers ────────────────────────────────────────────────────────

function coverZoneHighlight(tab: CoverTab, data: KRCoverData): CSSProperties | null {
  if (tab === 'spread') return null
  const { widthIn, trimWidthIn, spineWidthIn, bleedIn } = data
  const backRight = ((bleedIn + trimWidthIn) / widthIn) * 100
  const spineRight = ((bleedIn + trimWidthIn + spineWidthIn) / widthIn) * 100
  if (tab === 'back') return { left: '0%', right: `${100 - backRight}%`, top: '0%', bottom: '0%' }
  if (tab === 'spine') return { left: `${backRight}%`, right: `${100 - spineRight}%`, top: '0%', bottom: '0%' }
  return { left: `${spineRight}%`, right: '0%', top: '0%', bottom: '0%' }
}

const COVER_TAB_LABELS: Record<CoverTab, string> = {
  spread: 'Full Spread',
  front: 'Front',
  spine: 'Spine',
  back: 'Back',
}

function isSpineIssue(issue: Pick<KRIssue, 'issueType'>): boolean {
  return issue.issueType === 'spine-width-risk' || issue.issueType === 'spine-text-risk'
}

function coverIssueZones(issue: KRIssue): CoverTab[] {
  switch (issue.issueType) {
    case 'spine-width-risk':
    case 'spine-text-risk':
      return ['spine']
    case 'cover-barcode-conflict':
      return ['back']
    case 'cover-size-mismatch':
    case 'cover-bleed-missing':
    case 'cover-low-quality':
    default:
      return ['spread']
  }
}

function buildCoverZones(issues: KRIssue[]): CoverZoneItem[] {
  const order: CoverTab[] = ['front', 'spine', 'back', 'spread']
  return order.map((key) => ({
    key,
    label: COVER_TAB_LABELS[key],
    issues: issues.filter((issue) => coverIssueZones(issue).includes(key)),
  }))
}

// ── Issue color theme ─────────────────────────────────────────────────────────

type IssueColorKey = 'green' | 'amber' | 'red' | 'blue'

const ISSUE_COLORS: Record<
  IssueColorKey,
  {
    ring: string
    text: string
    dot: string
    cardBorder: string
    cardBg: string
    badgeBg: string
  }
> = {
  green: {
    ring: 'ring-emerald-400/55',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    cardBorder: 'border-emerald-200',
    cardBg: 'bg-emerald-50',
    badgeBg: 'bg-emerald-500',
  },
  amber: {
    ring: 'ring-amber-400/55',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    cardBorder: 'border-amber-200',
    cardBg: 'bg-amber-50',
    badgeBg: 'bg-amber-500',
  },
  red: {
    ring: 'ring-red-400/55',
    text: 'text-red-700',
    dot: 'bg-red-400',
    cardBorder: 'border-red-200',
    cardBg: 'bg-red-50',
    badgeBg: 'bg-red-500',
  },
  blue: {
    ring: 'ring-blue-400/50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
    cardBorder: 'border-blue-200',
    cardBg: 'bg-blue-50',
    badgeBg: 'bg-blue-500',
  },
}

function isPrintAdvisory(issue: KRIssue): boolean {
  return issue.status !== 'skipped' && (issue.status === 'print_advisory' || issue.severity === 'info' || issue.category === 'info')
}

function isValidationProblem(issue: KRIssue): boolean {
  return !isPrintAdvisory(issue) && (issue.category === 'must-fix' || issue.category === 'should-fix')
}

function canDecoratePagePreview(issue: KRIssue | null): issue is KRIssue {
  return !!issue && issue.scope === 'page' && isValidationProblem(issue)
}

function issueColorKey(issue: KRIssue | null): IssueColorKey {
  if (!issue) return 'green'
  if (isPrintAdvisory(issue)) return 'blue'
  return issue.category === 'must-fix' ? 'red' : 'amber'
}

// ── Severity status system ────────────────────────────────────────────────────

type StatusSeverity = 'ok' | 'info' | 'warning' | 'error' | 'fixed' | 'unchecked'

const STATUS_COLORS: Record<
  StatusSeverity,
  {
    dot: string
    text: string
    label: string
    badgeBg: string
    badgeText: string
    icon: string
    hover: string
  }
> = {
  ok: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-600',
    label: 'OK',
    badgeBg: 'bg-emerald-500/80',
    badgeText: 'text-white',
    icon: '✓',
    hover: 'hover:border-l-emerald-300 hover:bg-emerald-50/55',
  },
  info: {
    dot: 'bg-blue-400',
    text: 'text-blue-600',
    label: 'Info',
    badgeBg: 'bg-blue-500/80',
    badgeText: 'text-white',
    icon: 'ⓘ',
    hover: 'hover:border-l-blue-300 hover:bg-blue-50/55',
  },
  warning: {
    dot: 'bg-amber-400',
    text: 'text-amber-600',
    label: 'Review',
    badgeBg: 'bg-amber-500/80',
    badgeText: 'text-white',
    icon: '⚠',
    hover: 'hover:border-l-amber-300 hover:bg-amber-50/55',
  },
  error: {
    dot: 'bg-red-400',
    text: 'text-red-600',
    label: 'Error',
    badgeBg: 'bg-red-500/80',
    badgeText: 'text-white',
    icon: '✕',
    hover: 'hover:border-l-red-300 hover:bg-red-50/55',
  },
  fixed: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-600',
    label: 'Fixed',
    badgeBg: 'bg-emerald-500/80',
    badgeText: 'text-white',
    icon: '✓',
    hover: 'hover:border-l-emerald-300 hover:bg-emerald-50/55',
  },
  unchecked: {
    dot: 'bg-slate-300',
    text: 'text-slate-500',
    label: 'Not checked',
    badgeBg: 'bg-slate-500/75',
    badgeText: 'text-white',
    icon: '-',
    hover: 'hover:border-l-slate-300 hover:bg-slate-50/70',
  },
}

function hasIncompleteRequiredPageChecks(diag?: KRPageDiagnostics): boolean {
  return !!diag?.finalStatus.hasIncompleteRequiredChecks
}

function pageSeverity(pageIssues: KRIssue[] | undefined, isFixed: boolean, diag?: KRPageDiagnostics): StatusSeverity {
  if (isFixed) return 'fixed'
  if (hasIncompleteRequiredPageChecks(diag) && (!pageIssues || pageIssues.length === 0)) return 'unchecked'
  if (!pageIssues || pageIssues.length === 0) return 'ok'
  if (pageIssues.every(isPrintAdvisory)) return 'info'
  if (pageIssues.some((i) => i.category === 'must-fix')) return 'error'
  return 'warning'
}

function issueSeverityLabel(issue: KRIssue): string {
  if (isPrintAdvisory(issue)) return 'Advisory'
  return issue.category === 'must-fix' ? 'Critical' : 'Warning'
}

function fixabilityLabel(issue: KRIssue): string {
  const fixability = issueFixability(issue)
  if (fixability === 'auto-fix') return 'Auto fix available'
  if (fixability === 'manual-review') return 'Manual fix'
  return 'No automated fix'
}

function issueDetectedDebug(issue: KRIssue, debug?: KRPageBoxDebug | null): string | null {
  if (!debug || (issue.issueType !== 'size-mismatch' && issue.issueType !== 'inconsistent-pages')) return null
  const actual = `${debug.printBox.widthIn.toFixed(3)}" × ${debug.printBox.heightIn.toFixed(3)}"`
  const expected =
    debug.expectedWidthIn && debug.expectedHeightIn
      ? `${debug.expectedWidthIn.toFixed(3)}" × ${debug.expectedHeightIn.toFixed(3)}"`
      : null
  const dominant =
    debug.dominantWidthIn && debug.dominantHeightIn
      ? `${debug.dominantWidthIn.toFixed(3)}" × ${debug.dominantHeightIn.toFixed(3)}"`
      : null
  return [actual && `Actual ${actual}`, expected && `Expected ${expected}`, dominant && `Dominant ${dominant}`]
    .filter(Boolean)
    .join(' · ')
}

// ── Progress modal ────────────────────────────────────────────────────────────

function ProgressModal({
  title,
  progress,
  onCancel,
}: {
  readonly title: string
  readonly progress: FixProgress | null
  readonly onCancel: () => void
}) {
  const pct = progress
    ? progress.phase === 'rendering'
      ? Math.round((progress.current / Math.max(progress.total, 1)) * 82)
      : progress.phase === 'encoding'
        ? 94
        : progress.phase === 'done'
          ? 100
          : 8
    : 8
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 grid place-items-center bg-[#0f172a]/45 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mt-4 text-lg font-bold text-[#0f172a]">{title}</h3>
        <p className="mt-1 text-sm text-black/50">{progress?.message ?? 'Starting...'}</p>
        <div className="mt-5 overflow-hidden rounded-full bg-black/7">
          <div className="h-2 rounded-full bg-[#df8e51] transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-right text-xs text-black/35">{pct}%</p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 w-full rounded-xl border border-black/10 py-2.5 text-sm font-semibold text-black/55 hover:bg-black/3"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )
}

// ── Page surface ──────────────────────────────────────────────────────────────

function PageSurface({
  pageNumber,
  imageUrl,
  debug,
  bleed,
  previewMode,
  interior,
  issue,
  copy,
  showGuides,
  showAdvancedGuides,
  fitMode,
  isFocusPage,
}: {
  readonly pageNumber: number | null
  readonly imageUrl?: string
  readonly debug?: KRPageBoxDebug
  readonly bleed: string
  readonly previewMode: PreviewMode
  readonly interior: string
  readonly issue: KRIssue | null
  readonly copy: ReturnType<typeof issueCopy>
  readonly showGuides: boolean
  readonly showAdvancedGuides: boolean
  readonly fitMode: 'fit' | 'fill' | 'center'
  readonly isFocusPage: boolean
}) {
  const size = pageBoxSize(debug)
  const guides = guideInsets(debug, bleed)
  const isFixed = previewMode === 'fixed'

  const imageFilter = (() => {
    if (interior === 'black-white') return 'grayscale(1)'
    if (isFixed && issue?.issueType === 'color-in-bw-book') return 'grayscale(1)'
    return undefined
  })()

  const canShowValidationOutline = isFocusPage && canDecoratePagePreview(issue)
  const highlight = canShowValidationOutline ? issueHighlight(issue) : null

  if (pageNumber === null) {
    return (
      <div className="relative flex h-full shrink-0 flex-col justify-end">
        <div
          className="relative grid max-h-full place-items-center rounded-lg border border-dashed border-black/12 bg-white/45 text-xs font-semibold text-black/30 shadow-[0_20px_64px_-42px_rgba(15,23,42,0.45)]"
          style={{ aspectRatio: `${size.widthIn} / ${size.heightIn}`, height: 'calc(100% - 1.5rem)' }}
        >
          Blank
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full shrink-0 flex-col justify-end">
      <div
        className={[
          'relative max-h-full overflow-hidden rounded-lg bg-white shadow-[0_34px_90px_-42px_rgba(15,23,42,0.55)]',
          canShowValidationOutline ? `ring-2 ${ISSUE_COLORS[issueColorKey(issue)].ring}` : undefined,
        ].join(' ')}
        style={{ aspectRatio: `${size.widthIn} / ${size.heightIn}`, height: 'calc(100% - 1.5rem)' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Page ${pageNumber}`}
            className="absolute inset-0 h-full w-full object-contain transition-all duration-300"
            style={{
              filter: imageFilter,
              transform:
                isFixed && (issue?.issueType === 'size-mismatch' || issue?.issueType === 'inconsistent-pages')
                  ? fitModeTransform(issue, fitMode)
                  : undefined,
            }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-black/25">
            <FileText className="h-10 w-10" />
          </div>
        )}

        {showGuides && (
          <>
            {showAdvancedGuides && (
              <>
                <div
                  className="pointer-events-none absolute border border-dashed border-red-400/60"
                  style={guides.bleed}
                  title="Bleed edge"
                />
                <div
                  className="pointer-events-none absolute border border-dashed border-orange-400/70"
                  style={guides.trim}
                  title="Trim line"
                />
              </>
            )}
            <div
              className="pointer-events-none absolute border-2 border-dashed border-slate-400/45"
              style={guides.safe}
              title="Safe area"
            />
          </>
        )}

        {highlight && (
          <div
            className="pointer-events-none absolute rounded border-2 border-dashed border-[#df8e51]/75 shadow-[0_0_0_3px_rgba(223,142,81,0.07)]"
            style={highlight.style}
            aria-label={highlight.label}
          />
        )}

        {isFixed && issue && (issue.issueType === 'size-mismatch' || issue.issueType === 'inconsistent-pages') && (
          <>
            {fitMode === 'fit' && (
              <div
                className="pointer-events-none absolute inset-x-[7%] inset-y-0 border-x-[10px] border-emerald-400/25"
                aria-label="Added margin area"
              />
            )}
            {fitMode === 'fill' && (
              <div
                className="pointer-events-none absolute inset-0 border-[14px] border-red-500/20 shadow-[inset_0_0_0_2px_rgba(239,68,68,0.35)]"
                aria-label="Crop risk area"
              />
            )}
            {fitMode === 'center' && (
              <div
                className="pointer-events-none absolute inset-[8%] rounded border border-dashed border-blue-500/45"
                aria-label="Centered original area"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PagePreviewFrame({
  title,
  status,
  children,
}: {
  readonly title: string
  readonly status?: string
  readonly children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex h-8 shrink-0 items-center justify-between rounded-xl border border-black/8 bg-white/90 px-3 shadow-sm">
        <p className="text-xs font-bold text-[#0f172a]">{title}</p>
        {status && <p className="text-[11px] font-semibold text-black/45">{status}</p>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}

// ── Cover surface ─────────────────────────────────────────────────────────────

function CoverSurface({
  coverData,
  coverTab,
  hqImage,
  issue,
  hasCoverFile,
}: {
  readonly coverData: KRCoverData | null
  readonly coverTab: CoverTab
  readonly hqImage: string | null
  readonly issue: KRIssue | null
  readonly hasCoverFile: boolean
}) {
  if (!hasCoverFile) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <BookOpen className="h-14 w-14 text-black/18" />
        <p className="text-sm font-semibold text-black/40">No cover uploaded</p>
        <p className="text-xs text-black/28">Upload a cover PDF on the Upload step to see a cover preview.</p>
      </div>
    )
  }

  const imgSrc = hqImage ?? coverData?.dataUrl ?? null

  if (!coverData && !imgSrc) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <BookOpen className="h-14 w-14 text-black/18" />
        <p className="text-sm font-semibold text-black/40">Unable to render cover preview</p>
        <p className="text-xs text-black/28">The cover file may be too complex to preview in-browser.</p>
      </div>
    )
  }

  const {
    widthIn = 0,
    heightIn = 0,
    expectedFullWidthIn = 0,
    expectedFullHeightIn = 0,
    trimWidthIn = 0,
    spineWidthIn = 0,
    bleedIn = 0,
  } = coverData ?? {}
  const valid = widthIn > 0 && heightIn > 0 && expectedFullWidthIn > 0 && expectedFullHeightIn > 0

  // Zone boundaries as fractions of full cover width, ensuring the spine is perfectly centered
  const backEnd = valid ? (widthIn - spineWidthIn) / (2 * widthIn) : 0.49
  const frontStart = valid ? (widthIn + spineWidthIn) / (2 * widthIn) : 0.51

  const zone = (() => {
    if (coverTab === 'spread') return null
    if (coverTab === 'back') return { l: 0, r: backEnd }
    if (coverTab === 'spine') return { l: backEnd, r: frontStart }
    return { l: frontStart, r: 1 } // front
  })()

  // Use the standard expected size to compute standard aspect ratio for each tab, ensuring clean and consistent scaling
  const expectedZoneW = (() => {
    if (coverTab === 'spread') return expectedFullWidthIn
    if (coverTab === 'back') return trimWidthIn + bleedIn
    if (coverTab === 'spine') return spineWidthIn
    return trimWidthIn + bleedIn // front
  })()

  const viewAR = valid ? expectedZoneW / expectedFullHeightIn : coverTab === 'spread' ? 1.55 : coverTab === 'spine' ? 0.02 : 0.77

  // For cropped tabs: position full-width image so only the zone is visible
  // image_width% = 100 / zoneW   |   image_left% = -(zone.l / zoneW) * 100
  const zoneW = zone ? zone.r - zone.l : 1
  const cropImgStyle: CSSProperties | undefined = zone
    ? {
      position: 'absolute',
      top: 0,
      height: '100%',
      width: `${(100 / zoneW).toFixed(2)}%`,
      left: `${(-(zone.l / zoneW) * 100).toFixed(2)}%`,
      maxWidth: 'none',
    }
    : undefined

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 pb-2 pt-14">
      {issue && coverTab === 'spread' && (
        <div className="shrink-0 rounded-xl border border-black/8 bg-white/90 px-3 py-2 text-xs font-semibold text-[#0f172a] shadow-sm">
          {issue.title}
        </div>
      )}
      <div
        className="relative overflow-hidden rounded-xl bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.55)] ring-1 ring-black/8"
        style={{
          aspectRatio: `${viewAR}`,
          // Portrait (front, back, spine): height fills 100%, width follows AR
          // Landscape (spread): width fills 100%, height follows AR (capped at maxHeight, with maxWidth preventing wide stretching)
          width: viewAR < 1 ? 'auto' : '100%',
          height: viewAR < 1 ? (issue && coverTab === 'spread' ? 'calc(100% - 2.75rem)' : '100%') : 'auto',
          maxHeight: issue && coverTab === 'spread' ? 'calc(100% - 2.75rem)' : '100%',
          maxWidth: viewAR >= 1 ? `calc((100dvh - ${issue && coverTab === 'spread' ? '10.25rem' : '7.5rem'}) * ${viewAR})` : '100%',
        }}
      >
        {imgSrc ? (
          zone ? (
            // Cropped zone view
            <div className="absolute inset-0 overflow-hidden">
              <img src={imgSrc} alt={`Cover — ${COVER_TAB_LABELS[coverTab]}`} style={cropImgStyle} />
            </div>
          ) : (
            // Full spread — object-fill since container AR == image AR (both from PDF dimensions)
            <img src={imgSrc} alt="Cover spread" className="absolute inset-0 h-full w-full" style={{ objectFit: 'fill' }} />
          )
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Loader2 className="h-8 w-8 animate-spin text-black/25" />
          </div>
        )}

        {/* Spine divider guides — spread only */}
        {coverTab === 'spread' && valid && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 border-l border-dashed border-orange-300/65"
              style={{ left: `${backEnd * 100}%` }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 border-r border-dashed border-orange-300/65"
              style={{ right: `${(1 - frontStart) * 100}%` }}
            />
          </>
        )}
      </div>
    </div>
  )
}

// ── Guides legend ─────────────────────────────────────────────────────────────

function GuidesLegend({ visible, advanced }: { readonly visible: boolean; readonly advanced: boolean }) {
  if (!visible) return null
  return (
    <div className="absolute bottom-3 right-3 z-20 rounded-2xl border border-black/8 bg-white/90 px-3 py-2 text-[11px] font-semibold text-black/50 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-slate-400/50" />
        Safe area
      </div>
      {advanced && (
        <>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-0.5 w-4 border-t border-dashed border-orange-400/70" />
            Trim line
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-0.5 w-4 border-t border-dashed border-red-400/60" />
            Bleed edge
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface FixStepProps {
  readonly issues: KRIssue[]
  readonly manuscriptFile: File | null
  readonly coverFile: File | null
  readonly result: KRResult
  readonly confirmedSettings: KRDetectedSettings
  readonly selectedIssueId?: string | null
  readonly firstPageDataUrl?: string | null
  readonly pageBoxes?: KRPageBoxDebug[]
  readonly coverData: KRCoverData | null
  readonly isRevalidating?: boolean
  readonly files?: { manuscript: File | null; cover: File | null }
  readonly onBackToConfig: () => void
  readonly onBack: () => void
  readonly onConfigChange?: (settings: KRDetectedSettings) => void
}

export default function FixStep({
  issues,
  manuscriptFile,
  coverFile,
  result,
  confirmedSettings,
  selectedIssueId = null,
  firstPageDataUrl = null,
  pageBoxes = [],
  coverData,
  isRevalidating = false,
  files,
  onBackToConfig,
  onConfigChange,
}: FixStepProps) {
  // Always derive config display values from confirmedSettings (user source of truth),
  // not result.settings, so the UI reflects config changes immediately on Apply.
  const pageCount = confirmedSettings.pageCount
  const interior = confirmedSettings.interior
  const trim = TRIM_SIZES[confirmedSettings.trimSize] ?? TRIM_SIZES['6x9']

  // Partition issues by validation system. These scopes intentionally do not overlap.
  const manuscriptIssues = useMemo(() => issues.filter((i) => i.scope === 'page'), [issues])
  const coverIssues = useMemo(() => issues.filter((i) => i.scope === 'cover' || isSpineIssue(i)), [issues])
  const setupIssues = useMemo(() => issues.filter((i) => i.scope === 'setup' && !isSpineIssue(i)), [issues])

  const advisoryPageIssues = useMemo(() => manuscriptIssues.filter(isPrintAdvisory), [manuscriptIssues])
  const problemIssues = useMemo(() => manuscriptIssues.filter(isValidationProblem), [manuscriptIssues])
  const allPageIssues = useMemo(() => buildPageIssues(manuscriptIssues, pageCount), [manuscriptIssues, pageCount])
  const problemPages = useMemo(() => buildPageIssues(problemIssues, pageCount), [problemIssues, pageCount])
  const initialProblem = selectedIssueId
    ? allPageIssues.find((page) => page.issues.some((i) => i.id === selectedIssueId))?.pageNumber
    : undefined

  // ── State ──────────────────────────────────────────────────────────────────
  const [viewContext, setViewContext] = useState<ViewContext>(() => {
    const sel = selectedIssueId ? issues.find((i) => i.id === selectedIssueId) : null
    if (sel?.scope === 'cover' || (sel && isSpineIssue(sel))) return 'cover'
    return 'manuscript'
  })
  const [coverTab, setCoverTab] = useState<CoverTab>(() => {
    const sel = selectedIssueId ? issues.find((i) => i.id === selectedIssueId) : null
    return sel && (sel.scope === 'cover' || isSpineIssue(sel)) ? coverIssueZones(sel)[0] : 'spread'
  })
  const [tab, setTab] = useState<PageTab>('problem')
  const [selectedPage, setSelectedPage] = useState(initialProblem ?? problemPages[0]?.pageNumber ?? 1)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('original')
  const [viewMode, setViewMode] = useState<ViewMode>('single')
  const [showGuides, setShowGuides] = useState(true)
  const [showAdvancedGuides, setShowAdvancedGuides] = useState(false)
  const [renderMode, setRenderMode] = useState<RenderMode>('hq')
  const [pageInput, setPageInput] = useState(String(initialProblem ?? problemPages[0]?.pageNumber ?? 1))
  const [zoom, setZoom] = useState(100)
  const [leftWidth, setLeftWidth] = useState(208)
  const [rightWidth, setRightWidth] = useState(276)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [pageImages, setPageImages] = useState<Record<number, string>>(() =>
    firstPageDataUrl ? ({ 1: firstPageDataUrl } as Record<number, string>) : {}
  )
  const [hqPageImages, setHqPageImages] = useState<Record<number, string>>({})
  const [coverHQImage, setCoverHQImage] = useState<string | null>(null)
  const [fixedPages, setFixedPages] = useState<Record<number, FixedPage>>({})
  const [draftFixes, setDraftFixes] = useState<Record<string, DraftFixPreview>>({})
  const [qualityMode, setQualityMode] = useState<QualityMode>('balanced')
  const [pageFixStates, setPageFixStates] = useState<Record<string, PageFixState>>({})
  const [bleedMode, setBleedMode] = useState<'mirror' | 'solid'>('mirror')
  const [fixProgress, setFixProgress] = useState<FixProgress | null>(null)
  const [exportProgress, setExportProgress] = useState<FixProgress | null>(null)
  const [coverFixProgress, setCoverFixProgress] = useState<FixProgress | null>(null)
  const [coverFixedBlob, setCoverFixedBlob] = useState<Blob | null>(null)
  const [lastDownload, setLastDownload] = useState<LastDownload | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [previewMenuOpen, setPreviewMenuOpen] = useState(false)
  const [guidesMenuOpen, setGuidesMenuOpen] = useState(false)
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false)
  const [activeIssueId, setActiveIssueId] = useState<string | null>(selectedIssueId)
  const [fixPanelCollapsed, setFixPanelCollapsed] = useState(false)
  const [fixAllConfirm, setFixAllConfirm] = useState<FixAllConfirmState | null>(null)
  const [fixAllProgress, setFixAllProgress] = useState<{ current: number; total: number; message: string } | null>(null)

  const cancelRef = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLeaveToSetup = useCallback(() => {
    cancelRef.current = true
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.body.style.pointerEvents = ''
    document.body.style.overflow = ''
    window.requestAnimationFrame(() => {
      onBackToConfig()
    })
  }, [onBackToConfig])

  // ── Derived ────────────────────────────────────────────────────────────────
  const allSpreadItems = useMemo(() => allSpreads(pageCount), [pageCount])
  const coverZones = useMemo(() => buildCoverZones(coverIssues), [coverIssues])
  const activeSpread = useMemo(() => spreadFor(selectedPage, pageCount), [pageCount, selectedPage])
  const activeSpreadPages = useMemo(() => activeSpread.filter((p): p is number => p !== null), [activeSpread])
  const pageDiagnostics = result.pageDiagnostics ?? {}
  const problemPageNums = useMemo(() => new Set(problemPages.map((p) => p.pageNumber)), [problemPages])
  const incompletePageNums = useMemo(
    () =>
      new Set(
        Object.entries(pageDiagnostics)
          .filter(([, diag]) => hasIncompleteRequiredPageChecks(diag))
          .map(([page]) => Number(page))
          .filter((page) => Number.isFinite(page) && page >= 1 && page <= pageCount)
      ),
    [pageDiagnostics, pageCount]
  )
  const attentionPageNums = useMemo(
    () => new Set([...problemPageNums, ...incompletePageNums]),
    [problemPageNums, incompletePageNums]
  )
  const advisoryPageNums = useMemo(
    () => new Set(buildPageIssues(advisoryPageIssues, pageCount).map((p) => p.pageNumber)),
    [advisoryPageIssues, pageCount]
  )

  const selectedPageIssues =
    viewMode === 'spread'
      ? activeSpreadPages.flatMap((p) => allPageIssues.find((item) => item.pageNumber === p)?.issues ?? [])
      : (allPageIssues.find((p) => p.pageNumber === selectedPage)?.issues ?? [])
  const selectedIssue = selectedPageIssues.find((issue) => issue.id === activeIssueId) ?? selectedPageIssues[0] ?? null
  const selectedIssuePage = selectedIssue
    ? (activeSpreadPages.find((p) => selectedIssue.pageRefs.length === 0 || selectedIssue.pageRefs.includes(p)) ??
      selectedPage)
    : selectedPage
  const selectedPageDiagnostic = pageDiagnostics[selectedPage]
  const copy = issueCopy(selectedIssue)
  const selectedFixed = fixedPages[selectedIssuePage]
  // issueFixed: only the fix that matches the currently selected issue (page may have a fix for a different issue)
  const issueFixed = selectedFixed?.issueId === selectedIssue?.id ? selectedFixed : undefined
  const selectedDebug = pageBoxes.find((b) => b.pageNumber === selectedIssuePage)
  const selectedFixKey = fixKey(selectedIssuePage, selectedIssue?.id)
  const recommendedMode = recommendedFixMode(selectedIssue, selectedDebug)
  const selectedPageFixState = pageFixStates[selectedFixKey]
  const fitMode: FixMode = selectedPageFixState?.mode ?? recommendedMode
  const selectedDraft = draftFixes[selectedFixKey] ?? null
  const fixedPreviewUrl = selectedDraft?.preview.dataUrl ?? issueFixed?.preview.dataUrl
  const pageStatus: PageStatus = issueFixed
    ? 'fixed'
    : selectedIssue
      ? 'issue'
      : hasIncompleteRequiredPageChecks(selectedPageDiagnostic)
        ? 'unchecked'
        : 'ok'
  const selectedPageCriticalCount = selectedPageIssues.filter((issue) => issue.category === 'must-fix').length
  const selectedPageWarningCount = selectedPageIssues.filter((issue) => issue.category === 'should-fix').length
  const selectedPageAdvisoryCount = selectedPageIssues.filter(isPrintAdvisory).length
  const selectedCoverIssues = useMemo(
    () => coverZones.find((zone) => zone.key === coverTab)?.issues ?? [],
    [coverTab, coverZones]
  )
  const selectedCoverIssue = selectedCoverIssues[0] ?? null

  const visiblePages = useMemo(
    () =>
      viewMode === 'spread'
        ? spreadFor(selectedPage, pageCount).filter((p): p is number => p !== null)
        : [selectedPage],
    [pageCount, selectedPage, viewMode]
  )

  const spreadPages = activeSpread
  const currentPageLabel = pageRangeLabel(viewMode, selectedPage, pageCount)
  const hasFixes = Object.keys(fixedPages).length > 0
  const allIssues = useMemo(
    () => [...manuscriptIssues, ...coverIssues, ...setupIssues],
    [manuscriptIssues, coverIssues, setupIssues]
  )
  const criticalCount = useMemo(
    () => allIssues.filter((i) => !isPrintAdvisory(i) && i.category === 'must-fix').length,
    [allIssues]
  )
  const warningCount = useMemo(
    () => allIssues.filter((i) => !isPrintAdvisory(i) && i.category === 'should-fix').length,
    [allIssues]
  )
  const advisoryCount = useMemo(
    () => allIssues.filter((i) => isPrintAdvisory(i) || i.scope === 'setup').length,
    [allIssues]
  )
  const selectedFixability: KRFixability = selectedIssue ? issueFixability(selectedIssue) : 'info-only'
  const selectedCanAutoFix =
    selectedFixability === 'auto-fix' &&
    !!selectedIssue &&
    isSupported(selectedIssue) &&
    selectedIssue.id !== 'size-slight' &&
    !issueFixed
  const fixModeOptions = useMemo(() => (['fit', 'fill', 'center'] as const).map((mode) => fixModeMeta(mode)), [])

  // Per-section issue breakdowns for tab tooltips
  const msBreakdown = useMemo(
    () => ({
      critical: manuscriptIssues.filter((i) => i.category === 'must-fix').length,
      warning: manuscriptIssues.filter((i) => i.category === 'should-fix').length,
      advisory: manuscriptIssues.filter(isPrintAdvisory).length,
    }),
    [manuscriptIssues]
  )
  const cvBreakdown = useMemo(
    () => ({
      critical: coverIssues.filter((i) => i.category === 'must-fix').length,
      warning: coverIssues.filter((i) => i.category === 'should-fix').length,
      advisory: coverIssues.filter(isPrintAdvisory).length,
    }),
    [coverIssues]
  )

  // Pages affected by the same issue type as the currently selected issue
  const affectedPagesForIssueType = useMemo(() => {
    if (!selectedIssue || !FIX_ALL_SAFE_TYPES.has(selectedIssue.issueType)) return []
    const issuesOfType = manuscriptIssues.filter((i) => i.issueType === selectedIssue.issueType)
    return [
      ...new Set(
        issuesOfType.flatMap((i) =>
          i.pageRefs.length > 0 ? i.pageRefs : Array.from({ length: pageCount }, (_, idx) => idx + 1)
        )
      ),
    ].filter((p) => !fixedPages[p])
  }, [selectedIssue, manuscriptIssues, pageCount, fixedPages])

  const showFixAll =
    selectedIssue !== null &&
    FIX_ALL_SAFE_TYPES.has(selectedIssue.issueType) &&
    isSupported(selectedIssue) &&
    affectedPagesForIssueType.length >= 1

  const problemSpreadCount = allSpreadItems.filter((s) => s.pages.some((p) => problemPageNums.has(p))).length

  // Unfixed counts for badge display — decreases as user applies fixes
  const unfixedProblemPages = useMemo(
    () => problemPages.filter((p) => !fixedPages[p.pageNumber]),
    [problemPages, fixedPages]
  )
  const unfixedProblemPageNums = useMemo(
    () => new Set(unfixedProblemPages.map((p) => p.pageNumber)),
    [unfixedProblemPages]
  )
  const unfixedProblemSpreadCount = useMemo(
    () => allSpreadItems.filter((s) => s.pages.some((p) => unfixedProblemPageNums.has(p))).length,
    [allSpreadItems, unfixedProblemPageNums]
  )

  const spreadsForList =
    tab === 'problem' ? allSpreadItems.filter((s) => s.pages.some((p) => attentionPageNums.has(p))) : allSpreadItems
  const pagesForList =
    tab === 'problem'
      ? Array.from({ length: pageCount }, (_, i) => i + 1).filter((page) => attentionPageNums.has(page))
      : Array.from({ length: pageCount }, (_, i) => i + 1)

  const thumbnailPages = useMemo(
    () => Array.from(new Set([...visiblePages, ...pagesForList])),
    [visiblePages, pagesForList]
  )

  const trimLabel = `${trim.widthIn} × ${trim.heightIn} in`
  const interiorLabel =
    interior === 'black-white' ? 'Black & White' : interior === 'premium-color' ? 'Premium Color' : 'Standard Color'
  const bookTypeLabel = confirmedSettings.bookType === 'paperback' ? 'Paperback' : 'Hardcover'
  const contextName =
    viewContext === 'manuscript' ? result.fileNames.manuscript : (result.fileNames.cover ?? 'No cover file')
  const bodyGridStyle = {
    '--left-sidebar': `${leftCollapsed ? 0 : leftWidth}px`,
    '--right-sidebar': `${rightCollapsed ? 0 : rightWidth}px`,
  } as CSSProperties

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    },
    []
  )


  useEffect(() => {
    let cancelled = false
    if (selectedPageIssues.length === 0) {
      if (activeIssueId !== null)
        queueMicrotask(() => {
          if (!cancelled) setActiveIssueId(null)
        })
      return () => {
        cancelled = true
      }
    }
    if (!activeIssueId || !selectedPageIssues.some((issue) => issue.id === activeIssueId)) {
      queueMicrotask(() => {
        if (!cancelled) setActiveIssueId(selectedPageIssues[0].id)
      })
    }
    return () => {
      cancelled = true
    }
  }, [activeIssueId, selectedPageIssues])

  const updateFixMode = useCallback(
    (mode: FixMode) => {
      setPageFixStates((prev) => ({
        ...prev,
        [selectedFixKey]: {
          mode,
          previewMode: prev[selectedFixKey]?.previewMode ?? previewMode,
        },
      }))
      setDraftFixes((prev) => {
        const next = { ...prev }
        delete next[selectedFixKey]
        return next
      })
      // Clear existing fix so user can re-generate with new mode
      setFixedPages((prev) => {
        if (!prev[selectedIssuePage]) return prev
        const next = { ...prev }
        delete next[selectedIssuePage]
        return next
      })
    },
    [previewMode, selectedFixKey, selectedIssuePage]
  )

  const setScopedPreviewMode = useCallback(
    (mode: PreviewMode) => {
      setPreviewMode(mode)
      setPageFixStates((prev) => ({
        ...prev,
        [selectedFixKey]: {
          mode: prev[selectedFixKey]?.mode ?? fitMode,
          previewMode: mode,
        },
      }))
    },
    [fitMode, selectedFixKey]
  )

  // Ctrl+Shift+D → debug panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setShowDebug((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    if (!previewMenuOpen && !guidesMenuOpen) return
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-menu]')) {
        setPreviewMenuOpen(false)
        setGuidesMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [previewMenuOpen, guidesMenuOpen])

  // Fast page thumbnails — loads current page + all sidebar list pages
  useEffect(() => {
    if (!manuscriptFile || viewContext !== 'manuscript') return
    let cancelled = false
    const missing = thumbnailPages.filter((p) => !pageImages[p])
    if (missing.length === 0) return

    // Render in batches of 3 to avoid spawning hundreds of concurrent canvas ops
    const BATCH = 3
    let idx = 0
    const runBatch = async () => {
      if (cancelled || idx >= missing.length) return
      const batch = missing.slice(idx, idx + BATCH)
      idx += BATCH
      await Promise.all(
        batch.map(async (pageNumber) => {
          try {
            const page = await renderSinglePage(manuscriptFile, pageNumber, 0.7, {
              imageType: 'image/jpeg',
              quality: 0.78,
              isCancelled: () => cancelled,
            })
            if (!cancelled) setPageImages((prev) => ({ ...prev, [pageNumber]: page.dataUrl }))
          } catch {
            /* non-blocking */
          }
        })
      )
      // Yield to UI between batches
      if (!cancelled) setTimeout(runBatch, 0)
    }
    void runBatch()
    return () => {
      cancelled = true
    }
  }, [manuscriptFile, pageImages, thumbnailPages, viewContext])

  // High-quality page renders
  useEffect(() => {
    if (!manuscriptFile || renderMode !== 'hq' || viewContext !== 'manuscript') return
    let cancelled = false
    const missing = visiblePages.filter((p) => !hqPageImages[p])
    if (missing.length === 0) return
    const dpr = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    const scale = Math.min(3.2, Math.max(2.1, dpr * 1.7))

    // HQ renders are expensive — process sequentially to avoid GPU contention
    const runSerial = async () => {
      for (const pageNumber of missing) {
        if (cancelled) break
        try {
          const page = await renderSinglePage(manuscriptFile, pageNumber, scale, { imageType: 'image/png', isCancelled: () => cancelled })
          if (!cancelled) setHqPageImages((prev) => ({ ...prev, [pageNumber]: page.dataUrl }))
        } catch {
          /* keep fast preview */
        }
        // Yield between HQ renders so the UI stays responsive
        if (!cancelled) await new Promise<void>((r) => setTimeout(r, 0))
      }
    }
    void runSerial()
    return () => {
      cancelled = true
    }
  }, [manuscriptFile, hqPageImages, renderMode, visiblePages, viewContext])

  // Cover HQ render
  useEffect(() => {
    if (!coverFile || viewContext !== 'cover') return
    let cancelled = false
    const dpr = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    const scale = Math.min(3.0, Math.max(1.8, dpr * 1.4))
    renderSinglePage(coverFile, 1, scale, { imageType: 'image/png', isCancelled: () => cancelled })
      .then((page) => {
        if (!cancelled) setCoverHQImage(page.dataUrl)
      })
      .catch(() => {
        /* keep thumbnail */
      })
    return () => {
      cancelled = true
    }
  }, [coverFile, viewContext])

  // ── Actions ────────────────────────────────────────────────────────────────

  const scheduleHQ = () => {
    setRenderMode('fast' as RenderMode)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setRenderMode('hq'), 520)
  }

  const optionsForIssue = useCallback(
    (issue: KRIssue): FixExportOptions => {
      const op = operationFor(issue)
      return {
        quality: QUALITY[qualityMode].value,
        bleedMode,
        normalizeMode: fitMode,
        brightness: op === 'print-color-adjust' ? 8 : undefined,
        contrast: op === 'print-color-adjust' ? 10 : undefined,
        targetWidthPt:
          op === 'normalize-page-size' ? trim.widthIn * 72 + (confirmedSettings.bleed === 'bleed' ? 18 : 0) : undefined,
        targetHeightPt:
          op === 'normalize-page-size'
            ? trim.heightIn * 72 + (confirmedSettings.bleed === 'bleed' ? 18 : 0)
            : undefined,
      }
    },
    [bleedMode, confirmedSettings.bleed, fitMode, qualityMode, trim.heightIn, trim.widthIn]
  )

  const buildSelectedPlan = useCallback((): PageFixPlan | null => {
    if (!selectedIssue) return null
    return {
      pageNumber: selectedIssuePage,
      operations: [operationFor(selectedIssue)],
      options: optionsForIssue(selectedIssue),
      label: copy.fixedLabel,
    }
  }, [copy.fixedLabel, optionsForIssue, selectedIssue, selectedIssuePage])

  const previewSelectedFix = async () => {
    if (!selectedIssue || !manuscriptFile) return
    const plan = buildSelectedPlan()
    if (!plan) return
    cancelRef.current = false
    setDraftFixes((prev) => {
      const next = { ...prev }
      delete next[selectedFixKey]
      return next
    })
    try {
      const preview = await renderPageFixPreview(
        manuscriptFile,
        plan,
        (progress) => setFixProgress(progress),
        () => cancelRef.current
      )
      setDraftFixes((prev) => ({
        ...prev,
        [selectedFixKey]: { pageNumber: selectedIssuePage, issueId: selectedIssue.id, mode: fitMode, plan, preview },
      }))
      setViewMode('single')
      setScopedPreviewMode('compare')
      setLastDownload(null)
      setTimeout(() => setFixProgress(null), 250)
    } catch (err) {
      setFixProgress(null)
      if (!String(err).includes('Fix cancelled')) {
        toast({ title: 'Preview failed', description: 'Could not generate a preview. Please try again.' })
      }
    }
  }

  const applyPreviewedFix = async () => {
    if (
      !selectedIssue ||
      !selectedDraft ||
      selectedDraft.pageNumber !== selectedIssuePage ||
      selectedDraft.issueId !== selectedIssue.id
    )
      return
    setFixProgress({ phase: 'rendering', current: 1, total: 2, message: 'Rechecking selected page...' })
    await new Promise((r) => setTimeout(r, 120))
    setFixedPages((prev) => ({
      ...prev,
      [selectedIssuePage]: {
        pageNumber: selectedIssuePage,
        issueId: selectedIssue.id,
        appliedAt: Date.now(),
        plan: selectedDraft.plan,
        preview: selectedDraft.preview,
        message: 'This page now passes this check.',
      },
    }))
    setScopedPreviewMode('fixed')
    setLastDownload(null)
    setFixProgress({ phase: 'done', current: 2, total: 2, message: 'Fix applied.' })
    setTimeout(() => setFixProgress(null), 250)
  }

  const undoSelectedFix = () => {
    setFixedPages((prev) => {
      const n = { ...prev }
      delete n[selectedIssuePage]
      return n
    })
    setDraftFixes((prev) => {
      const next = { ...prev }
      delete next[selectedFixKey]
      return next
    })
    setScopedPreviewMode('original')
    setLastDownload(null)
  }

  const executeFixAll = useCallback(
    async (pages: number[]) => {
      if (!selectedIssue || !manuscriptFile) return
      setFixAllConfirm(null)
      cancelRef.current = false
      const newFixed: Record<number, FixedPage> = {}
      for (let i = 0; i < pages.length; i++) {
        if (cancelRef.current) break
        const pageNumber = pages[i]
        setFixAllProgress({
          current: i + 1,
          total: pages.length,
          message: `Fixing page ${pageNumber} of ${pages.length}…`,
        })
        const plan: PageFixPlan = {
          pageNumber,
          operations: [operationFor(selectedIssue)],
          options: optionsForIssue(selectedIssue),
          label: copy.fixedLabel,
        }
        try {
          const preview = await renderPageFixPreview(
            manuscriptFile,
            plan,
            () => { },
            () => cancelRef.current
          )
          newFixed[pageNumber] = {
            pageNumber,
            issueId: selectedIssue.id,
            appliedAt: Date.now(),
            plan,
            preview,
            message: 'Fixed in batch operation.',
          }
        } catch {
          /* skip pages that fail */
        }
      }
      if (!cancelRef.current) {
        setFixedPages((prev) => ({ ...prev, ...newFixed }))
        const n = Object.keys(newFixed).length
        toast({ title: `Fixed ${n} page${n === 1 ? '' : 's'}.` })
      }
      setFixAllProgress(null)
    },
    [selectedIssue, manuscriptFile, copy.fixedLabel, optionsForIssue]
  )

  const finishExportDownload = useCallback(async (assets: DownloadAsset[]) => {
    if (assets.length === 0) return
    setExportProgress({
      phase: 'encoding',
      current: assets.length,
      total: assets.length,
      message: 'Preparing download...',
    })
    const download = await buildDownloadAsset(assets)
    setLastDownload(download)
    downloadBlob(download.blob, download.fileName)
    setExportProgress({ phase: 'done', current: assets.length, total: assets.length, message: 'Download started.' })
    toast({ title: 'Download started' })
    window.setTimeout(() => setExportProgress(null), 250)
  }, [])

  const downloadAgain = useCallback(() => {
    if (!lastDownload) return
    downloadBlob(lastDownload.blob, lastDownload.fileName)
    toast({ title: 'Download started' })
  }, [lastDownload])

  const exportOriginalManuscript = async () => {
    if (!manuscriptFile) return
    cancelRef.current = false
    setExportProgress({ phase: 'loading', current: 0, total: 1, message: 'Preparing manuscript...' })
    try {
      const assets: DownloadAsset[] = [{ blob: manuscriptFile, fileName: 'corrected-manuscript.pdf' }]
      if (coverFixedBlob) assets.push({ blob: coverFixedBlob, fileName: 'corrected-cover.pdf' })
      await finishExportDownload(assets)
    } catch (err) {
      setExportProgress(null)
      throw err
    }
  }

  const exportCorrected = async () => {
    if (!manuscriptFile) return
    const plans = Object.values(fixedPages).map((p) => p.plan)
    if (plans.length === 0) {
      await exportOriginalManuscript()
      return
    }
    cancelRef.current = false
    setExportProgress({ phase: 'loading', current: 0, total: pageCount, message: 'Collecting fixed pages...' })
    try {
      const fixed = await applyPageFixes(
        manuscriptFile,
        plans,
        (progress) => {
          const message =
            progress.phase === 'loading'
              ? 'Collecting fixed pages...'
              : progress.phase === 'rendering'
                ? progress.message
                : progress.phase === 'encoding'
                  ? 'Creating download...'
                  : 'Done.'
          setExportProgress({ ...progress, message })
        },
        () => cancelRef.current,
        { grayscale: interior === 'black-white' }
      )
      const assets: DownloadAsset[] = [{ blob: fixed.blob, fileName: 'corrected-manuscript.pdf' }]
      if (coverFixedBlob) assets.push({ blob: coverFixedBlob, fileName: 'corrected-cover.pdf' })
      await finishExportDownload(assets)
    } catch (err) {
      setExportProgress(null)
      if (!String(err).includes('Fix cancelled')) {
        toast({ title: 'Export failed', description: 'An error occurred while preparing your file. Please try again.' })
      }
    }
  }

  const fixCover = async () => {
    if (!coverFile || !selectedCoverIssue) return
    const cap = FIX_CAPABILITIES[selectedCoverIssue.issueType]
    if (!cap) return
    cancelRef.current = false
    setCoverFixProgress({ phase: 'loading', current: 0, total: 1, message: 'Loading cover PDF…' })
    try {
      const fixed = await applyAutoFixes(
        coverFile,
        [cap.operationType],
        (p) => setCoverFixProgress(p),
        { quality: QUALITY[qualityMode].value, bleedMode },
        () => cancelRef.current
      )
      setCoverFixedBlob(fixed.blob)
      setCoverFixProgress(null)
    } catch (err) {
      setCoverFixProgress(null)
      if (!String(err).includes('cancelled')) {
        toast({ title: 'Cover fix failed', description: 'An error occurred. Please try again.' })
      }
    }
  }

  const downloadCover = useCallback(async () => {
    const source = coverFixedBlob ?? coverFile
    if (!source) return
    cancelRef.current = false
    setExportProgress({ phase: 'loading', current: 0, total: 1, message: 'Preparing cover...' })
    try {
      await finishExportDownload([{ blob: source, fileName: 'corrected-cover.pdf' }])
    } catch (err) {
      setExportProgress(null)
      throw err
    }
  }, [coverFile, coverFixedBlob, finishExportDownload])

  // ── Navigation ─────────────────────────────────────────────────────────────

  const issueCountForPages = (pages: number[]) =>
    pages.reduce((n, p) => n + (problemPages.find((item) => item.pageNumber === p)?.issues.length ?? 0), 0)
  const allIssueCountForPages = (pages: number[]) =>
    pages.reduce((n, p) => n + (allPageIssues.find((item) => item.pageNumber === p)?.issues.length ?? 0), 0)

  const statusForPages = (pages: number[]): PageStatus => {
    const withIssue = pages.filter((p) => problemPageNums.has(p))
    const withIncomplete = pages.filter((p) => incompletePageNums.has(p))
    if (withIssue.length === 0) return withIncomplete.length > 0 ? 'unchecked' : 'ok'
    if (withIssue.every((p) => !!fixedPages[p])) return 'fixed'
    return 'issue'
  }
  const severityForPages = (pages: number[], allIssues: KRIssue[], anyFixed: boolean): StatusSeverity => {
    if (anyFixed && pages.some((p) => problemPageNums.has(p))) return 'fixed'
    if (pages.some((p) => problemPageNums.has(p))) return pageSeverity(allIssues.filter(isValidationProblem), false)
    if (pages.some((p) => advisoryPageNums.has(p))) return 'info'
    if (pages.some((p) => incompletePageNums.has(p))) return 'unchecked'
    return 'ok'
  }

  const choosePage = (page: number) => {
    const next = Math.max(1, Math.min(pageCount, page))
    setSelectedPage(next)
    setPageInput(String(next))
    const nextIssueId = allPageIssues.find((item) => item.pageNumber === next)?.issues[0]?.id ?? null
    setActiveIssueId(nextIssueId)
    const savedMode = pageFixStates[fixKey(next, nextIssueId)]?.previewMode
    setPreviewMode(savedMode ?? (fixedPages[next] ? 'fixed' : 'original'))
  }

  const chooseSpread = (spread: SpreadItem) => {
    const issuePage = spread.pages.find((p) => problemPageNums.has(p))
    choosePage(issuePage ?? spread.left ?? spread.right ?? 1)
  }

  const goPreviousPage = () =>
    choosePage(viewMode === 'spread' ? (selectedPage <= 2 ? 1 : selectedPage - 2) : selectedPage - 1)
  const goNextPage = () =>
    choosePage(viewMode === 'spread' ? (selectedPage <= 1 ? 2 : selectedPage + 2) : selectedPage + 1)
  const submitPageInput = () => {
    const n = Number.parseInt(pageInput, 10)
    if (Number.isNaN(n)) {
      setPageInput(String(selectedPage))
      return
    }
    choosePage(n)
  }

  const startSidebarResize = (side: 'left' | 'right', e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = side === 'left' ? leftWidth : rightWidth
    const onMove = (event: MouseEvent) => {
      const delta = side === 'left' ? event.clientX - startX : startX - event.clientX
      const next = Math.max(156, Math.min(420, startWidth + delta))
      if (side === 'left') setLeftWidth(next)
      else setRightWidth(next)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const sectionBadge = (count: number) =>
    count > 0 ? (
      <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-bold text-amber-700">{count}</span>
    ) : null

  return (
    <div className="relative grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden bg-[#e9edf4] text-[#0f172a]">
      <ConfigDrawer
        open={configDrawerOpen}
        settings={confirmedSettings}
        files={files}
        onClose={() => setConfigDrawerOpen(false)}
        onApply={(settings) => {
          onConfigChange?.(settings)
        }}
      />
      <AnimatePresence>
        {fixProgress && (
          <ProgressModal
            title="Fixing this page…"
            progress={fixProgress}
            onCancel={() => {
              cancelRef.current = true
              setFixProgress(null)
            }}
          />
        )}
        {exportProgress && (
          <ProgressModal
            title="Preparing your corrected file…"
            progress={exportProgress}
            onCancel={() => {
              cancelRef.current = true
              setExportProgress(null)
            }}
          />
        )}
        {coverFixProgress && (
          <ProgressModal
            title="Fixing cover…"
            progress={coverFixProgress}
            onCancel={() => {
              cancelRef.current = true
              setCoverFixProgress(null)
            }}
          />
        )}
        {fixAllProgress && (
          <ProgressModal
            title={`Fixing ${fixAllProgress.total} pages…`}
            progress={{
              phase: 'rendering',
              current: fixAllProgress.current,
              total: fixAllProgress.total,
              message: fixAllProgress.message,
            }}
            onCancel={() => {
              cancelRef.current = true
              setFixAllProgress(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-black/8 bg-white/92 backdrop-blur-md">
        <div className="flex h-14 items-center gap-2 px-3">
          {/* Left — back + config + context name */}
          <div className="flex min-w-0 shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleLeaveToSetup}
              className="flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-black/55 hover:bg-black/3 active:scale-[0.97]"
              title="Return to setup page"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Setup
            </button>
            <button
              type="button"
              onClick={() => setConfigDrawerOpen((v) => !v)}
              className={[
                'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors active:scale-[0.97]',
                configDrawerOpen
                  ? 'border-[#df8e51]/40 bg-[#df8e51]/8 text-[#df8e51]'
                  : 'border-black/10 bg-white text-black/55 hover:bg-black/3',
              ].join(' ')}
              title="Edit book config"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Config
            </button>
            <span className="text-black/20">·</span>
            <p className="max-w-[180px] truncate text-sm font-semibold text-black/65">{contextName}</p>
          </div>

          {/* Center — Manuscript / Cover only */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center rounded-xl border border-black/10 bg-black/4 p-0.5">
              {(['manuscript', 'cover'] as const).map((ctx) => {
                const bd = ctx === 'manuscript' ? msBreakdown : cvBreakdown
                const count = ctx === 'manuscript' ? unfixedProblemPages.length : coverIssues.length
                const tip =
                  count > 0
                    ? `${bd.critical} critical · ${bd.warning} warning${bd.warning !== 1 ? 's' : ''} · ${bd.advisory} advisor${bd.advisory !== 1 ? 'ies' : 'y'}`
                    : undefined
                return (
                  <button
                    key={ctx}
                    type="button"
                    title={tip}
                    onClick={() => setViewContext(ctx)}
                    className={[
                      'flex items-center rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors',
                      viewContext === ctx ? 'bg-white text-[#0f172a] shadow-sm' : 'text-black/45 hover:text-black/65',
                    ].join(' ')}
                  >
                    {ctx === 'manuscript' ? 'Manuscript' : 'Cover'}
                    {count > 0 && (
                      <span
                        title={tip}
                        className={`ml-1 rounded-full px-1.5 py-px text-[10px] font-bold ${bd.critical > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right — issue count + export */}
          <div className="flex shrink-0 items-center gap-2">
            {criticalCount + warningCount + advisoryCount > 0 && (
              <div className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {criticalCount} critical · {warningCount} warnings · {advisoryCount} advisories
              </div>
            )}

            {viewContext === 'manuscript' &&
              (hasFixes ? (
                <button
                  type="button"
                  onClick={exportCorrected}
                  className="flex items-center gap-1.5 rounded-xl bg-[#df8e51] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#df8e51]/25 hover:bg-[#c2410c] active:scale-[0.98] transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              ) : (
                <button
                  type="button"
                  onClick={exportOriginalManuscript}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e293b] active:scale-[0.98] transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              ))}

            {viewContext === 'cover' &&
              coverFile &&
              (coverFixedBlob ? (
                <button
                  type="button"
                  onClick={downloadCover}
                  className="flex items-center gap-1.5 rounded-xl bg-[#df8e51] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#df8e51]/25 hover:bg-[#c2410c] active:scale-[0.98] transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Export Cover
                </button>
              ) : (
                <button
                  type="button"
                  onClick={downloadCover}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e293b] active:scale-[0.98] transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Export Cover
                </button>
              ))}
          </div>
        </div>

        {/* Revalidation banner */}
        {isRevalidating && (
          <div className="flex h-8 items-center gap-2 border-t border-[#df8e51]/20 bg-[#df8e51]/6 px-3">
            <Loader2 className="h-3 w-3 animate-spin text-[#df8e51]" />
            <span className="text-xs font-semibold text-[#df8e51]">Rechecking with updated settings…</span>
          </div>
        )}
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div
        className="relative grid min-h-0 grid-cols-[var(--left-sidebar)_minmax(0,1fr)_var(--right-sidebar)] max-md:grid-cols-[1fr]"
        style={bodyGridStyle}
      >
        {/* ── Left sidebar ──────────────────────────────────────────────────── */}
        <aside
          className={`relative flex min-h-0 flex-col overflow-hidden border-r border-black/8 bg-white/86 max-md:hidden ${leftCollapsed ? 'pointer-events-none invisible' : ''}`}
        >
          {/* Manuscript — page list */}
          {viewContext === 'manuscript' && (
            <>
              <div className="flex shrink-0 gap-1 border-b border-black/8 p-2 pr-10">
                {(['problem', 'all'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={[
                      'flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors',
                      tab === t ? 'bg-[#df8e51]/10 text-[#df8e51]' : 'text-black/45 hover:bg-black/4',
                    ].join(' ')}
                  >
                    {t === 'problem' ? (
                      <>
                        Problem
                        {unfixedProblemPages.length > 0 && (
                          <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-bold text-amber-700">
                            {viewMode === 'spread' ? unfixedProblemSpreadCount : unfixedProblemPages.length}
                          </span>
                        )}
                      </>
                    ) : viewMode === 'spread' ? (
                      'All Spreads'
                    ) : (
                      'All'
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-2 pb-16">
                <div className="space-y-0.5">
                  {tab === 'problem' && pagesForList.length === 0 ? (
                    isRevalidating ? (
                      <div className="flex items-center gap-2.5 rounded-2xl border border-[#df8e51]/30 bg-[#df8e51]/5 p-4">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#df8e51]" />
                        <div>
                          <p className="text-sm font-semibold text-[#df8e51]">Rechecking…</p>
                          <p className="mt-0.5 text-xs text-black/45">Validating against updated config.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                        <p className="text-sm font-semibold text-emerald-700">No page problems</p>
                        <p className="mt-1 text-xs leading-relaxed text-black/45">
                          All manuscript pages look OK for the checks that were completed.
                        </p>
                      </div>
                    )
                  ) : viewMode === 'spread' ? (
                    spreadsForList.map((spread) => {
                      const count =
                        tab === 'problem' ? issueCountForPages(spread.pages) : allIssueCountForPages(spread.pages)
                      const sel = activeSpreadPages.some((p) => spread.pages.includes(p))
                      const allIssues = spread.pages.flatMap(
                        (p) => allPageIssues.find((i) => i.pageNumber === p)?.issues ?? []
                      )
                      const anyFixed =
                        spread.pages.every((p) => !!fixedPages[p]) && spread.pages.some((p) => !!fixedPages[p])
                      const sev = severityForPages(spread.pages, allIssues, anyFixed)
                      const sc = STATUS_COLORS[sev]
                      return (
                        <button
                          key={spread.key}
                          type="button"
                          onClick={() => chooseSpread(spread)}
                          className={[
                            'flex w-full items-center gap-2 rounded-xl border border-l-4 p-2 text-left transition-colors',
                            sel
                              ? 'border-[#df8e51]/25 border-l-[#df8e51] bg-[#df8e51]/5 shadow-sm'
                              : `border-transparent border-l-transparent ${sc.hover}`,
                          ].join(' ')}
                        >
                          <div className="flex h-12 w-14 shrink-0 items-center justify-center gap-0.5 overflow-hidden rounded-lg bg-[#f1f4f8] px-1">
                            {[spread.left, spread.right].map((page, idx) => (
                              <div
                                key={page ?? `b-${idx}`}
                                className="grid h-9 w-6 shrink-0 place-items-center overflow-hidden rounded-sm bg-white shadow-sm"
                              >
                                {page && pageImages[page] ? (
                                  <img
                                    src={pageImages[page]}
                                    alt=""
                                    className="h-full w-full object-contain"
                                    style={{ filter: interior === 'black-white' ? 'grayscale(1)' : undefined }}
                                  />
                                ) : (
                                  <span className="text-[8px] font-bold text-black/25">{page ?? '·'}</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">{spread.label}</p>
                            <p className={`mt-0.5 text-[11px] font-medium ${sc.text}`}>
                              {sc.icon}{' '}
                              {sev === 'ok'
                                ? 'OK'
                                : sev === 'fixed'
                                  ? 'Fixed'
                                  : sev === 'info'
                                    ? 'Print advisory'
                                    : sev === 'unchecked'
                                      ? 'Not checked'
                                      : `${count} ${sev === 'error' ? 'error' : 'warning'}${count !== 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${sc.dot}`} />
                        </button>
                      )
                    })
                  ) : (
                    pagesForList.map((pageNumber) => {
                      const pageIssue = allPageIssues.find((p) => p.pageNumber === pageNumber)
                      const fixed = !!fixedPages[pageNumber]
                      const sev = pageSeverity(pageIssue?.issues, fixed, pageDiagnostics[pageNumber])
                      const sc = STATUS_COLORS[sev]
                      const issueCount = pageIssue?.issues.length ?? 0
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => choosePage(pageNumber)}
                          className={[
                            'flex w-full items-center gap-2 rounded-xl border border-l-4 p-2 text-left transition-colors',
                            selectedPage === pageNumber
                              ? 'border-[#df8e51]/25 border-l-[#df8e51] bg-[#df8e51]/5 shadow-sm'
                              : `border-transparent border-l-transparent ${sc.hover}`,
                          ].join(' ')}
                        >
                          <div className="grid h-14 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f1f4f8] shadow-sm">
                            {pageImages[pageNumber] ? (
                              <img
                                src={pageImages[pageNumber]}
                                alt=""
                                className="h-full w-full object-contain"
                                style={{ filter: interior === 'black-white' ? 'grayscale(1)' : undefined }}
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-black/25">{pageNumber}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold">Page {pageNumber}</p>
                            <p className={`mt-0.5 text-[11px] font-medium ${sc.text}`}>
                              {sc.icon}{' '}
                              {sev === 'ok'
                                ? 'OK'
                                : sev === 'fixed'
                                  ? 'Fixed'
                                  : sev === 'info'
                                    ? 'Print advisory'
                                    : sev === 'unchecked'
                                      ? 'Not checked'
                                      : `${issueCount} ${sev === 'error' ? 'error' : 'warning'}${issueCount !== 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${sc.dot}`} />
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* Cover — issue list */}
          {viewContext === 'cover' && (
            <div className="min-h-0 flex-1 overflow-auto p-3 pt-11">
              {!coverFile && coverIssues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/12 bg-black/2 p-4 text-center">
                  <BookOpen className="mx-auto mb-2 h-7 w-7 text-black/20" />
                  <p className="text-xs font-semibold text-black/45">No cover uploaded</p>
                  <p className="mt-1 text-[11px] text-black/35">
                    Upload a cover PDF on the Upload step to get cover validation.
                  </p>
                </div>
              ) : coverIssues.length === 0 ? (
                isRevalidating ? (
                  <div className="flex items-center gap-2.5 rounded-2xl border border-[#df8e51]/30 bg-[#df8e51]/5 p-4">
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#df8e51]" />
                    <div>
                      <p className="text-sm font-semibold text-[#df8e51]">Rechecking…</p>
                      <p className="mt-0.5 text-xs text-black/45">Validating cover against updated config.</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#059669]/18 bg-[#059669]/5 p-4">
                    <p className="text-sm font-semibold text-[#047857]">Cover looks good</p>
                    <p className="mt-1 text-xs text-black/45">No cover issues detected.</p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-black/30">Cover Zones</p>
                  {coverZones.map((zone) => {
                    const sev = pageSeverity(zone.issues, false)
                    const sc = STATUS_COLORS[sev]
                    const issueCount = zone.issues.length
                    return (
                      <button
                        key={zone.key}
                        type="button"
                        onClick={() => setCoverTab(zone.key)}
                        className={[
                          'flex w-full items-center justify-between rounded-xl border border-l-4 p-3 text-left transition-colors',
                          coverTab === zone.key
                            ? 'border-[#df8e51]/25 border-l-[#df8e51] bg-[#df8e51]/5 shadow-sm'
                            : `border-transparent border-l-transparent ${sc.hover}`,
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-[#0f172a]">{zone.label}</span>
                        <span className={`text-[11px] font-bold ${sc.text}`}>
                          {sc.icon}{' '}
                          {issueCount === 0
                            ? 'OK'
                            : `${issueCount} ${sev === 'error' ? 'issue' : 'warning'}${issueCount === 1 ? '' : 's'}`}
                        </span>
                      </button>
                    )
                  })}
                  {setupIssues.length > 0 && (
                    <div className="mt-4 rounded-xl border border-black/8 bg-black/3 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">
                        Setup Advisories
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-black/50">
                        {setupIssues.length} book-level recommendation{setupIssues.length === 1 ? '' : 's'} shown in the
                        setup summary, not attached to cover zones.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
        {!leftCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={(e) => startSidebarResize('left', e)}
            className="absolute bottom-0 top-0 z-30 w-2 cursor-col-resize bg-transparent hover:bg-[#df8e51]/20 max-md:hidden"
            style={{ left: leftWidth - 4 }}
          />
        )}
        {/* Left sidebar edge tab */}
        <button
          type="button"
          onClick={() => setLeftCollapsed((v) => !v)}
          className="absolute top-1/2 z-30 flex h-14 w-3.5 -translate-y-1/2 items-center justify-center rounded-r-[6px] border border-l-0 border-black/[0.09] bg-[#eaecf0] text-black/32 transition-colors hover:bg-white hover:text-black/58 max-md:hidden"
          style={{ left: leftCollapsed ? 0 : leftWidth - 1 }}
          aria-label={leftCollapsed ? 'Open left sidebar' : 'Collapse left sidebar'}
        >
          {leftCollapsed ? <ChevronRight className="h-2.5 w-2.5" /> : <ChevronLeft className="h-2.5 w-2.5" />}
        </button>

        {/* ── Centre — full-bleed preview canvas ────────────────────────────── */}
        <main className="relative min-h-0 overflow-hidden bg-[#d8dfe9]">
          {viewContext === 'manuscript' && selectedIssue && (
            <div className="absolute left-3 right-3 top-3 z-20 rounded-2xl border border-black/10 bg-white shadow-[0_18px_48px_-30px_rgba(15,23,42,0.65)] max-md:bottom-3 max-md:top-auto">
              {/* ── Compact header — always visible ── */}
              <div className="flex items-center gap-2 p-3">
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${ISSUE_COLORS[issueColorKey(selectedIssue)].badgeBg} text-white`}
                >
                  {issueSeverityLabel(selectedIssue)}
                </span>
                <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-[#0f172a]">{selectedIssue.title}</h2>
                {fixPanelCollapsed && issueFixed && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    Fixed
                  </span>
                )}
                {fixPanelCollapsed && !issueFixed && selectedCanAutoFix && (
                  <span className="shrink-0 rounded-full bg-[#df8e51]/10 px-2.5 py-1 text-[11px] font-bold text-[#c2410c]">
                    Recommended: {fixModeCopy(recommendedMode).label}
                  </span>
                )}
              </div>

              {/* ── Expanded fix tools ── */}
              {!fixPanelCollapsed && (
                <div className="border-t border-black/7 p-3 pt-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-[180px] flex-1">
                      {issueFixed && (
                        <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          Fixed
                        </span>
                      )}
                      {!issueFixed && selectedCanAutoFix && (
                        <span className="mb-2 inline-block rounded-full bg-[#df8e51]/10 px-2.5 py-1 text-[11px] font-bold text-[#c2410c]">
                          Recommended: {fixModeCopy(recommendedMode).label}
                        </span>
                      )}
                      <p className="text-xs leading-relaxed text-black/55">{copy.risk}</p>
                    </div>

                    <div className="flex min-w-[260px] flex-col gap-2">
                      <div className="grid grid-cols-3 gap-1 rounded-xl border border-black/8 bg-black/4 p-0.5">
                        {(['original', 'fixed', 'compare'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setScopedPreviewMode(mode)}
                            className={`rounded-lg px-2.5 py-2 text-xs font-bold transition-colors ${previewMode === mode ? 'bg-white text-[#0f172a] shadow-sm' : 'text-black/45 hover:text-black/65'}`}
                          >
                            {mode === 'original' ? 'Original' : mode === 'fixed' ? 'Fixed Preview' : 'Compare'}
                          </button>
                        ))}
                      </div>

                      {(selectedCanAutoFix || issueFixed) &&
                        (selectedIssue.issueType === 'size-mismatch' ||
                          selectedIssue.issueType === 'inconsistent-pages' ||
                          selectedIssue.issueType === 'bleed-missing') && (
                          <div className="grid gap-2 lg:grid-cols-3">
                            {fixModeOptions.map(({ label, explanation, Icon }, index) => {
                              const mode = (['fit', 'fill', 'center'] as const)[index]
                              const active = fitMode === mode
                              const recommended = recommendedMode === mode
                              return (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => updateFixMode(mode)}
                                  className={`relative rounded-xl border p-3 text-left transition-all ${active ? 'border-[#df8e51] bg-[#fff7ed] text-[#0f172a] shadow-sm' : 'border-black/8 bg-white text-black/60 hover:border-black/18 hover:bg-black/[0.02]'}`}
                                >
                                  {recommended && (
                                    <span className="absolute right-2 top-2 rounded-full bg-[#df8e51] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                      Best
                                    </span>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${active ? 'text-[#df8e51]' : 'text-black/38'}`} />
                                    <span className="text-sm font-bold">{label}</span>
                                  </div>
                                  <p className="mt-1 text-[11px] leading-snug text-black/45">{explanation}</p>
                                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-black/35">
                                    {fixModeScaleLabel(mode, selectedDebug)}
                                  </p>
                                </button>
                              )
                            })}
                          </div>
                        )}

                      {selectedCanAutoFix && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={previewSelectedFix}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#df8e51] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#c2410c] active:scale-[0.98]"
                          >
                            <Loader2 className={`h-4 w-4 ${fixProgress ? 'animate-spin' : 'hidden'}`} />
                            Generate Fixed Preview
                          </button>
                          {selectedDraft && (
                            <button
                              type="button"
                              onClick={applyPreviewedFix}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#047857] active:scale-[0.98]"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Apply Fix To This Page
                            </button>
                          )}
                        </div>
                      )}
                      {showFixAll && (
                        <button
                          type="button"
                          onClick={() =>
                            setFixAllConfirm({ pages: affectedPagesForIssueType, fixLabel: copy.fixedLabel })
                          }
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#df8e51]/40 bg-[#fff7ed] px-4 py-2.5 text-sm font-bold text-[#c2410c] hover:bg-[#df8e51]/15 active:scale-[0.98]"
                        >
                          Fix All {affectedPagesForIssueType.length} Remaining Pages
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {(selectedCanAutoFix || showFixAll || issueFixed) && (
                <button
                  type="button"
                  onClick={() => setFixPanelCollapsed((v) => !v)}
                  className="absolute -bottom-[15px] left-1/2 -translate-x-1/2 flex h-3.5 w-12 items-center justify-center rounded-b-[5px] border border-t-0 border-black/10 bg-[#eaecf0] text-black/32 transition-colors hover:bg-white hover:text-black/60"
                  title={fixPanelCollapsed ? 'Expand fix tools' : 'Collapse fix tools'}
                  aria-label={fixPanelCollapsed ? 'Expand fix tools' : 'Collapse fix tools'}
                >
                  <ChevronDown
                    className={`h-2.5 w-2.5 transition-transform duration-200 ${fixPanelCollapsed ? '' : 'rotate-180'}`}
                  />
                </button>
              )}
            </div>
          )}

          {/* Fix All confirmation modal */}
          {fixAllConfirm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-base font-bold text-[#0f172a]">Fix all similar pages?</h3>
                <p className="mt-2 text-sm text-black/55">
                  <span className="font-semibold text-black/70">{fixAllConfirm.fixLabel}</span> will be applied to{' '}
                  <span className="font-semibold text-black/70">
                    {fixAllConfirm.pages.length} page{fixAllConfirm.pages.length !== 1 ? 's' : ''}
                  </span>
                  . This can be undone individually from each page.
                </p>
                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFixAllConfirm(null)}
                    className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black/55 hover:bg-black/3"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => executeFixAll(fixAllConfirm.pages)}
                    className="flex-1 rounded-xl bg-[#df8e51] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c2410c]"
                  >
                    Fix {fixAllConfirm.pages.length} page{fixAllConfirm.pages.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating overlays */}
          {viewContext === 'manuscript' && (
            <div className="pointer-events-none absolute left-3 top-2.5 z-10">
              <span className="rounded-full bg-black/28 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                {currentPageLabel}
              </span>
            </div>
          )}

          {viewContext === 'cover' && coverFile && (
            <div className="absolute left-1/2 top-2.5 z-10 -translate-x-1/2">
              <div className="flex items-center rounded-xl border border-black/12 bg-white/88 p-0.5 shadow-sm backdrop-blur-sm">
                {(['spread', 'front', 'spine', 'back'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCoverTab(t)}
                    className={[
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                      coverTab === t ? 'bg-[#0f172a] text-white shadow-sm' : 'text-black/50 hover:text-black/70',
                    ].join(' ')}
                  >
                    {COVER_TAB_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Page status badge — preview chrome, outside page bounds */}
          {viewContext === 'manuscript' &&
            (() => {
              const sev = pageSeverity(
                selectedPageIssues.length > 0 ? selectedPageIssues : undefined,
                !!selectedFixed,
                selectedPageDiagnostic
              )
              const sc = STATUS_COLORS[sev]
              const labels: Record<StatusSeverity, string> = {
                ok: 'Looks good',
                info: 'Print advisory',
                warning: 'Needs review',
                error: 'Has issues',
                fixed: 'Fixed',
                unchecked: 'Not fully checked',
              }
              return (
                <div className="pointer-events-none absolute right-3 top-2.5 z-10">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm ${sc.badgeBg} ${sc.badgeText}`}
                  >
                    {sc.icon} {labels[sev]}
                  </span>
                </div>
              )
            })()}

          {/* Guides legend — manuscript only */}
          {viewContext === 'manuscript' && <GuidesLegend visible={showGuides} advanced={showAdvancedGuides} />}

          {/* ── Manuscript page preview ──────────────────────────────────── */}
          {viewContext === 'manuscript' && (
            <div
              className="absolute inset-0 overflow-hidden p-3"
              style={{ paddingTop: selectedIssue ? (fixPanelCollapsed ? '5.5rem' : '15.5rem') : '2.75rem' }}
            >
              {previewMode === 'compare' && viewMode === 'single' ? (
                <div
                  className="grid h-full min-h-0 gap-4 md:grid-cols-2"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
                >
                  <PagePreviewFrame title="Original" status={`Page ${selectedIssuePage}`}>
                    <div className="flex h-full items-center justify-center">
                      <PageSurface
                        pageNumber={selectedIssuePage}
                        imageUrl={
                          renderMode === 'hq'
                            ? (hqPageImages[selectedIssuePage] ?? pageImages[selectedIssuePage])
                            : pageImages[selectedIssuePage]
                        }
                        debug={selectedDebug}
                        bleed={confirmedSettings.bleed}
                        previewMode="original"
                        interior={interior}
                        issue={selectedIssue}
                        copy={copy}
                        showGuides={showGuides}
                        showAdvancedGuides={showAdvancedGuides}
                        fitMode={fitMode}
                        isFocusPage
                      />
                    </div>
                  </PagePreviewFrame>
                  <PagePreviewFrame
                    title="Fixed Preview"
                    status={selectedDraft ? 'Ready to apply' : issueFixed ? 'Applied' : undefined}
                  >
                    {fixedPreviewUrl ? (
                      <div className="flex h-full items-center justify-center">
                        <PageSurface
                          pageNumber={selectedIssuePage}
                          imageUrl={fixedPreviewUrl}
                          debug={selectedDebug}
                          bleed={confirmedSettings.bleed}
                          previewMode="fixed"
                          interior={interior}
                          issue={selectedIssue}
                          copy={copy}
                          showGuides={showGuides}
                          showAdvancedGuides={showAdvancedGuides}
                          fitMode={fitMode}
                          isFocusPage
                        />
                      </div>
                    ) : (
                      <div className="grid h-full place-items-center rounded-2xl border border-dashed border-black/12 bg-white/70 p-6 text-center text-sm font-semibold text-black/45">
                        Choose a fix option to preview the result.
                      </div>
                    )}
                  </PagePreviewFrame>
                </div>
              ) : (
                <div
                  className={`flex h-full max-h-full items-center justify-center gap-4 ${viewMode === 'spread' ? 'w-full max-w-[min(92vw,1500px)]' : 'mx-auto max-w-[min(78vw,920px)] min-w-[240px]'}`}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
                >
                  {(viewMode === 'spread' ? spreadPages : [selectedPage]).map((pageNumber, idx) => {
                    const dp = pageNumber ?? null
                    const pageIssue = dp === selectedIssuePage ? selectedIssue : null
                    const pageCopy = dp === selectedIssuePage ? copy : issueCopy(null)
                    const pageDebug = dp ? pageBoxes.find((b) => b.pageNumber === dp) : selectedDebug
                    const isFocus = dp === selectedIssuePage
                    const originalUrl = dp
                      ? renderMode === 'hq'
                        ? (hqPageImages[dp] ?? pageImages[dp])
                        : pageImages[dp]
                      : undefined
                    const imgUrl =
                      previewMode === 'fixed' && dp === selectedIssuePage && fixedPreviewUrl
                        ? fixedPreviewUrl
                        : originalUrl
                    return (
                      <PageSurface
                        key={dp ?? `blank-${idx}`}
                        pageNumber={dp}
                        imageUrl={imgUrl}
                        debug={pageDebug}
                        bleed={confirmedSettings.bleed}
                        previewMode={previewMode}
                        interior={interior}
                        issue={pageIssue}
                        copy={pageCopy}
                        showGuides={showGuides}
                        showAdvancedGuides={showAdvancedGuides}
                        fitMode={fitMode}
                        isFocusPage={isFocus}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Cover preview ────────────────────────────────────────────── */}
          {viewContext === 'cover' && (
            <CoverSurface
              coverData={coverData}
              coverTab={coverTab}
              hqImage={coverHQImage}
              issue={selectedCoverIssue}
              hasCoverFile={!!coverFile}
            />
          )}
        </main>

        {/* ── Right panel — issue details ────────────────────────────────────── */}
        {!rightCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={(e) => startSidebarResize('right', e)}
            className="absolute bottom-0 top-0 z-30 w-2 cursor-col-resize bg-transparent hover:bg-[#df8e51]/20 max-md:hidden"
            style={{ right: rightWidth - 4 }}
          />
        )}
        {/* Right sidebar edge tab */}
        <button
          type="button"
          onClick={() => setRightCollapsed((v) => !v)}
          className="absolute top-1/2 z-30 flex h-14 w-3.5 -translate-y-1/2 items-center justify-center rounded-l-[6px] border border-r-0 border-black/[0.09] bg-[#eaecf0] text-black/32 transition-colors hover:bg-white hover:text-black/58 max-md:hidden"
          style={{ right: rightCollapsed ? 0 : rightWidth - 1 }}
          aria-label={rightCollapsed ? 'Open right sidebar' : 'Collapse right sidebar'}
        >
          {rightCollapsed ? <ChevronLeft className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
        </button>

        <aside
          className={`relative min-h-0 overflow-auto border-l border-black/8 bg-white p-4 pt-4 max-md:hidden ${rightCollapsed ? 'pointer-events-none invisible' : ''}`}
        >
          {/* Manuscript issue details */}
          {viewContext === 'manuscript' &&
            (() => {
              const fixability: KRFixability = selectedIssue ? issueFixability(selectedIssue) : 'info-only'
              const printAdvisory = !!selectedIssue && isPrintAdvisory(selectedIssue)
              const darkPrintIssue = selectedIssue?.issueType === 'dark-background-risk'
              return (
                <>
                  {/* ── Selected page summary ── */}
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">
                    Selected Page Summary
                  </p>
                  <h3 className="mt-1.5 text-base font-bold leading-snug text-[#0f172a]">Page {selectedPage}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {[
                      [
                        'Status',
                        isRevalidating
                          ? 'Checking…'
                          : pageStatus === 'fixed'
                            ? 'Fixed'
                            : pageStatus === 'unchecked'
                              ? 'Not fully checked'
                              : selectedPageIssues.length > 0
                                ? 'Has issues'
                                : 'OK',
                      ],
                      ['Total', isRevalidating ? '—' : String(selectedPageIssues.length)],
                      ['Critical', isRevalidating ? '—' : String(selectedPageCriticalCount)],
                      ['Warning', isRevalidating ? '—' : String(selectedPageWarningCount)],
                      ['Advisory', isRevalidating ? '—' : String(selectedPageAdvisoryCount)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-black/7 bg-black/2 px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">{label}</p>
                        <p className="mt-0.5 font-bold text-[#0f172a]">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── All issues for selected page ── */}
                  <div className="mt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">
                      {selectedPageIssues.length} issue{selectedPageIssues.length === 1 ? '' : 's'} found
                    </p>
                    {selectedPageIssues.length === 0 ? (
                      isRevalidating ? (
                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#df8e51]/30 bg-[#df8e51]/5 p-3">
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#df8e51]" />
                          <p className="text-sm font-semibold text-[#df8e51]">Rechecking with updated config…</p>
                        </div>
                      ) : pageStatus === 'unchecked' ? (
                        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-700">This page was not fully checked.</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            Color analysis is missing or incomplete for this page, so it is not marked OK.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-sm font-semibold text-emerald-700">No page issues detected.</p>
                        </div>
                      )
                    ) : (
                      <div className="mt-2 space-y-2">
                        {selectedPageIssues.map((issue, index) => {
                          const active = selectedIssue?.id === issue.id
                          const color = ISSUE_COLORS[issueColorKey(issue)]
                          const debug = pageBoxes.find((b) => b.pageNumber === selectedPage)
                          const detected = issueDetectedDebug(issue, debug)
                          return (
                            <button
                              key={`${issue.id}-${index}`}
                              type="button"
                              onClick={() => setActiveIssueId(issue.id)}
                              className={[
                                'w-full rounded-xl border p-3 text-left transition-colors',
                                active
                                  ? `${color.cardBorder} ${color.cardBg} shadow-sm`
                                  : 'border-black/8 bg-white hover:bg-black/3',
                              ].join(' ')}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-sm font-bold leading-snug ${active ? color.text : 'text-[#0f172a]'}`}
                                >
                                  {issue.title}
                                </p>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? `${color.badgeBg} text-white` : 'bg-black/5 text-black/45'}`}
                                >
                                  {issueSeverityLabel(issue)}
                                </span>
                              </div>
                              <p className="mt-2 text-xs font-semibold text-black/45">{fixabilityLabel(issue)}</p>
                              <p className="mt-2 text-xs leading-relaxed text-black/55">
                                <span className="font-semibold text-black/45">Cause:</span> {issue.where}
                              </p>
                              <p className="mt-2 text-xs leading-relaxed text-black/55">{issue.whyMatters}</p>
                              {detected && (
                                <p className="mt-2 font-mono text-[11px] leading-relaxed text-black/45">{detected}</p>
                              )}
                              {issueFixability(issue) !== 'info-only' && (
                                <span className="mt-3 inline-flex rounded-lg border border-black/8 bg-white px-2.5 py-1 text-[11px] font-bold text-[#df8e51]">
                                  {active ? 'Selected' : 'Select fix'}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {selectedIssue && (
                    <div className="mt-5 border-t border-black/6 pt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">
                        {printAdvisory
                          ? 'Selected Advisory'
                          : selectedIssue.category === 'must-fix'
                            ? 'Selected Critical Issue'
                            : 'Selected Warning'}
                      </p>
                      <h3
                        className={`mt-1.5 text-base font-bold leading-snug ${ISSUE_COLORS[issueColorKey(selectedIssue)].text}`}
                      >
                        {copy.problem}
                      </h3>
                    </div>
                  )}

                  {selectedIssue && selectedCanAutoFix && (
                    <div className="mt-4 rounded-xl border border-[#df8e51]/20 bg-[#fff7ed] p-3">
                      <p className="text-xs font-bold text-[#c2410c]">Fix tools are above the preview.</p>
                      <p className="mt-1 text-xs leading-relaxed text-black/55">
                        Use the canvas toolbar to generate a fixed preview, compare it, then apply the patch.
                      </p>
                    </div>
                  )}

                  {/* ── Manual fix guidance ── */}
                  {selectedIssue &&
                    (darkPrintIssue || fixability === 'manual-review' || selectedIssue.id === 'size-slight') && (
                      <div
                        className={`mt-4 rounded-xl border p-3 ${darkPrintIssue ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}
                      >
                        <p className={`text-xs font-semibold ${darkPrintIssue ? 'text-blue-700' : 'text-amber-700'}`}>
                          {darkPrintIssue ? 'Recommendation' : 'How to fix'}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-black/60">{copy.method}</p>
                      </div>
                    )}

                  {/* ── Info-only advisory ── */}
                  {selectedIssue && !darkPrintIssue && fixability === 'info-only' && (
                    <div className="mt-4 rounded-xl border border-black/8 bg-black/3 p-3">
                      <p className="text-xs font-semibold text-black/45">No automated fix</p>
                      <p className="mt-1 text-xs leading-relaxed text-black/45">{copy.method}</p>
                    </div>
                  )}

                  {/* ── Fixed state ── */}
                  {issueFixed && (
                    <div className="mt-4 space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-700">✓ {issueFixed.message}</p>
                      <button
                        type="button"
                        onClick={undoSelectedFix}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white py-2.5 text-sm font-semibold text-emerald-700"
                      >
                        <Undo2 className="h-4 w-4" /> Undo Fix
                      </button>
                    </div>
                  )}

                  {/* ── Details (cause / risk) ── */}
                  <div className="mt-5 space-y-3.5 border-t border-black/6 pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">Cause</p>
                      <p className="mt-1 text-xs leading-relaxed text-black/55">{copy.cause}</p>
                    </div>
                    {(selectedIssue?.issueType === 'size-mismatch' ||
                      selectedIssue?.issueType === 'inconsistent-pages') &&
                      selectedDebug && (
                        <div className="rounded-xl border border-black/8 bg-[#f6f8fb] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">Detected</p>
                          <div className="mt-2 space-y-1 font-mono text-xs text-black/55">
                            {selectedDebug.expectedWidthIn && selectedDebug.expectedHeightIn && (
                              <p>
                                Exp: {selectedDebug.expectedWidthIn.toFixed(3)} ×{' '}
                                {selectedDebug.expectedHeightIn.toFixed(3)}"
                              </p>
                            )}
                            <p>
                              Got: {selectedDebug.printBox.widthIn.toFixed(3)} ×{' '}
                              {selectedDebug.printBox.heightIn.toFixed(3)}"
                            </p>
                            {selectedDebug.diffWidthIn !== null && selectedDebug.diffHeightIn !== null && (
                              <p>
                                Δ: {selectedDebug.diffWidthIn.toFixed(4)} × {selectedDebug.diffHeightIn.toFixed(4)}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">KDP Risk</p>
                      <p className="mt-1 text-xs leading-relaxed text-black/55">{copy.risk}</p>
                    </div>
                  </div>

                  {/* Debug */}
                  {showDebug && (selectedDebug || selectedPageDiagnostic) && (
                    <div className="mt-5 rounded-xl border border-black/10 bg-[#0f172a] p-3 font-mono text-[11px] leading-relaxed text-white/70">
                      <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-widest text-white/35">
                        Debug · Ctrl+Shift+D
                      </p>
                      {selectedDebug && (
                        <>
                          <p>Page: {selectedDebug.pageNumber}</p>
                          <p>Effective box: {selectedDebug.printBoxUsed}</p>
                          <p>
                            Exp: {selectedDebug.expectedWidthIn?.toFixed(3) ?? 'n/a'} ×{' '}
                            {selectedDebug.expectedHeightIn?.toFixed(3) ?? 'n/a'}"
                          </p>
                          <p>
                            Got: {selectedDebug.printBox.widthIn.toFixed(3)} ×{' '}
                            {selectedDebug.printBox.heightIn.toFixed(3)}"
                          </p>
                          <p>
                            Dominant: {selectedDebug.dominantWidthIn?.toFixed(3) ?? 'n/a'} ×{' '}
                            {selectedDebug.dominantHeightIn?.toFixed(3) ?? 'n/a'}"
                          </p>
                          <p>
                            Δ: {selectedDebug.diffWidthIn?.toFixed(4) ?? 'n/a'} ×{' '}
                            {selectedDebug.diffHeightIn?.toFixed(4) ?? 'n/a'}"
                          </p>
                          <p>
                            Dominant Δ: {selectedDebug.dominantDiffWidthIn?.toFixed(4) ?? 'n/a'} ×{' '}
                            {selectedDebug.dominantDiffHeightIn?.toFixed(4) ?? 'n/a'}"
                          </p>
                          <p>Result: {selectedDebug.validationResult}</p>
                          <p>Reason: {selectedDebug.reasonCode}</p>
                          <p>Source: {selectedDebug.validationSource ?? 'document-level'}</p>
                        </>
                      )}
                      {selectedPageDiagnostic?.color && (
                        <div className="mt-3 border-t border-white/10 pt-3">
                          <p>Color analyzed: {String(selectedPageDiagnostic.color.analyzed)}</p>
                          <p>Color reason: {selectedPageDiagnostic.color.reasonCode}</p>
                          <p>Meaningful color: {String(selectedPageDiagnostic.color.meaningfulColor)}</p>
                          <p>
                            Color ratio:{' '}
                            {selectedPageDiagnostic.color.saturatedColorPixelRatio?.toFixed(5) ??
                              selectedPageDiagnostic.color.colorPixelRatio?.toFixed(5) ??
                              'n/a'}
                          </p>
                          <p>Color-like px: {selectedPageDiagnostic.color.colorLikePixels ?? 'n/a'}</p>
                          <p>Sampled px: {selectedPageDiagnostic.color.totalPixelsSampled ?? 'n/a'}</p>
                          <p>
                            Avg sat: {selectedPageDiagnostic.color.averageSaturation?.toFixed(4) ?? 'n/a'} · Max Δ:{' '}
                            {selectedPageDiagnostic.color.maxColorDelta?.toFixed(1) ?? 'n/a'}
                          </p>
                          <p>
                            Threshold: Δ {selectedPageDiagnostic.color.threshold?.colorDelta ?? 'n/a'} · sat{' '}
                            {selectedPageDiagnostic.color.threshold?.saturation ?? 'n/a'} · meaningful{' '}
                            {selectedPageDiagnostic.color.threshold?.meaningfulRatio ?? 'n/a'}
                          </p>
                        </div>
                      )}
                      <p>Zoom: {zoom}%</p>
                    </div>
                  )}
                </>
              )
            })()}

          {/* Cover issue details */}
          {viewContext === 'cover' &&
            (() => {
              const coverCopy = issueCopy(selectedCoverIssue)
              const coverFixability: KRFixability = selectedCoverIssue
                ? issueFixability(selectedCoverIssue)
                : 'info-only'
              const coverCanAutoFix = coverFixability === 'auto-fix' && !!selectedCoverIssue && !coverFixedBlob
              const coverSeverity =
                selectedCoverIssue?.category === 'must-fix' ? 'error' : selectedCoverIssue ? 'warning' : 'ok'
              const coverStatus = STATUS_COLORS[coverSeverity]
              return (
                <>
                  <div
                    className={`rounded-2xl border p-4 ${selectedCoverIssue ? `${ISSUE_COLORS[issueColorKey(selectedCoverIssue)].cardBorder} ${ISSUE_COLORS[issueColorKey(selectedCoverIssue)].cardBg}` : 'border-emerald-200 bg-emerald-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-black/35">
                          Cover · {COVER_TAB_LABELS[coverTab]}
                        </p>
                        <h3
                          className={`mt-2 text-base font-bold leading-snug ${selectedCoverIssue ? ISSUE_COLORS[issueColorKey(selectedCoverIssue)].text : 'text-emerald-700'}`}
                        >
                          {selectedCoverIssue ? coverCopy.problem : 'Cover looks good'}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${coverStatus.badgeBg} ${coverStatus.badgeText}`}
                      >
                        {coverStatus.icon}{' '}
                        {selectedCoverIssue ? (coverSeverity === 'error' ? 'Issue' : 'Advisory') : 'OK'}
                      </span>
                    </div>

                    {selectedCoverIssue && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {coverFixability === 'auto-fix' && !coverFixedBlob && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            Auto Fix Available
                          </span>
                        )}
                        {coverFixability === 'manual-review' && (
                          <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                            Manual fix required
                          </span>
                        )}
                        {coverFixability === 'info-only' && (
                          <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-black/45 ring-1 ring-black/8">
                            Advisory only
                          </span>
                        )}
                      </div>
                    )}

                    {selectedCoverIssue && (
                      <p className="mt-3 text-xs leading-relaxed text-black/60">{coverCopy.risk}</p>
                    )}
                  </div>

                  {/* ── Auto Fix action area (first-class CTA) ── */}
                  {selectedCoverIssue && coverCanAutoFix && (
                    <div className="mt-4 space-y-2.5">
                      <div>
                        <p className="text-xs font-bold text-[#0f172a]">Auto Fix</p>
                        <p className="mt-1 text-xs leading-relaxed text-black/45">
                          Apply this as a corrected copy. Your original cover remains untouched.
                        </p>
                      </div>
                      {selectedCoverIssue.issueType === 'cover-bleed-missing' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBleedMode('mirror')}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${bleedMode === 'mirror' ? 'border-[#df8e51] bg-[#df8e51]/7 text-[#df8e51]' : 'border-black/8 text-black/55 hover:bg-black/3'}`}
                          >
                            <ImageDown className="h-3.5 w-3.5" /> Mirror
                          </button>
                          <button
                            type="button"
                            onClick={() => setBleedMode('solid')}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${bleedMode === 'solid' ? 'border-[#df8e51] bg-[#df8e51]/7 text-[#df8e51]' : 'border-black/8 text-black/55 hover:bg-black/3'}`}
                          >
                            White fill
                          </button>
                        </div>
                      )}
                      {selectedCoverIssue.issueType === 'cover-low-quality' && (
                        <div className="grid gap-1.5">
                          {(Object.keys(QUALITY) as QualityMode[]).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setQualityMode(mode)}
                              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${qualityMode === mode ? 'border-[#df8e51] bg-[#df8e51]/7 text-[#df8e51]' : 'border-black/8 text-black/55 hover:bg-black/3'}`}
                            >
                              {QUALITY[mode].label}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={fixCover}
                        className="w-full rounded-xl bg-[#df8e51] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#c2410c] active:scale-[0.98]"
                      >
                        {FIX_CAPABILITIES[selectedCoverIssue.issueType]?.label ?? 'Fix Cover'}
                      </button>
                    </div>
                  )}

                  {/* ── Manual fix guidance ── */}
                  {selectedCoverIssue && coverFixability === 'manual-review' && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-700">How to fix</p>
                      <p className="mt-1 text-xs leading-relaxed text-black/60">{coverCopy.method}</p>
                    </div>
                  )}

                  {/* ── Info-only advisory ── */}
                  {selectedCoverIssue && coverFixability === 'info-only' && (
                    <div className="mt-4 rounded-xl border border-black/8 bg-black/3 p-3">
                      <p className="text-xs font-semibold text-black/45">No automated fix</p>
                      <p className="mt-1 text-xs leading-relaxed text-black/45">{coverCopy.method}</p>
                    </div>
                  )}

                  {/* ── Fixed state ── */}
                  {coverFixedBlob && (
                    <div className="mt-4 space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-700">✓ Cover fix applied. Export when ready.</p>
                      <button
                        type="button"
                        onClick={() => setCoverFixedBlob(null)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white py-2.5 text-sm font-semibold text-emerald-700"
                      >
                        <Undo2 className="h-4 w-4" /> Undo Fix
                      </button>
                    </div>
                  )}

                  {/* ── Details (cause / risk) ── */}
                  {selectedCoverIssue && (
                    <div className="mt-5 space-y-3.5 border-t border-black/6 pt-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">Cause</p>
                        <p className="mt-1 text-xs leading-relaxed text-black/55">{coverCopy.cause}</p>
                      </div>
                      {coverData && (
                        <div className="rounded-xl border border-black/8 bg-[#f6f8fb] p-3 font-mono text-xs text-black/55">
                          <p className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-black/30">
                            Dimensions
                          </p>
                          <p>
                            Actual: {coverData.widthIn.toFixed(3)}" × {coverData.heightIn.toFixed(3)}"
                          </p>
                          <p>
                            Expected: {coverData.expectedFullWidthIn.toFixed(3)}" ×{' '}
                            {coverData.expectedFullHeightIn.toFixed(3)}"
                          </p>
                          <p>Spine: {coverData.spineWidthIn.toFixed(3)}"</p>
                          <p>Bleed: {coverData.bleedIn}"</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">KDP Risk</p>
                        <p className="mt-1 text-xs leading-relaxed text-black/55">{coverCopy.risk}</p>
                      </div>
                    </div>
                  )}

                  {/* Cover looks good — show dimensions */}
                  {!selectedCoverIssue && coverData && (
                    <div className="mt-4 rounded-xl border border-black/8 bg-[#f6f8fb] p-3 font-mono text-xs text-black/55">
                      <p className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-black/30">
                        Dimensions
                      </p>
                      <p>
                        Actual: {coverData.widthIn.toFixed(3)}" × {coverData.heightIn.toFixed(3)}"
                      </p>
                      <p>
                        Expected: {coverData.expectedFullWidthIn.toFixed(3)}" ×{' '}
                        {coverData.expectedFullHeightIn.toFixed(3)}"
                      </p>
                      <p>Spine: {coverData.spineWidthIn.toFixed(3)}"</p>
                    </div>
                  )}

                  {/* No cover file */}
                  {!selectedCoverIssue && !coverData && (
                    <p className="mt-2 text-sm text-black/45">
                      No cover file uploaded. Upload a cover PDF on the Upload step.
                    </p>
                  )}
                </>
              )
            })()}
        </aside>
      </div>

      {/* ── Footer toolbar — manuscript only ──────────────────────────────────── */}
      {viewContext === 'manuscript' && (
        <footer className="flex h-11 items-center gap-1 border-t border-black/8 bg-white/90 px-3 text-xs font-semibold text-black/50 backdrop-blur-md">
          {/* Zoom */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                scheduleHQ()
                setZoom((z) => Math.max(40, z - 8))
              }}
              className="grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => {
                scheduleHQ()
                setZoom((z) => Math.min(160, z + 8))
              }}
              className="grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                scheduleHQ()
                setZoom(100)
              }}
              className="grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5"
              aria-label="Reset zoom"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mx-1.5 h-4 w-px bg-black/10" />

          {/* Navigation */}
          <div className="flex items-center gap-0.5 max-lg:hidden">
            <button
              type="button"
              onClick={goPreviousPage}
              className="grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <label className="flex items-center gap-1 rounded-lg bg-black/4 px-2 py-1">
              <input
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={submitPageInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitPageInput()
                }}
                className="h-5 w-9 rounded border border-black/10 bg-white px-1 text-center text-xs text-[#0f172a] outline-none"
                inputMode="numeric"
              />
              <span className="text-black/38">/ {pageCount}</span>
            </label>
            <button
              type="button"
              onClick={goNextPage}
              className="grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mx-1.5 h-4 w-px bg-black/10 max-lg:hidden" />

          {/* View mode */}
          <div className="flex items-center rounded-lg border border-black/8 bg-black/3 p-0.5">
            {(['single', 'spread'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`rounded-md px-2.5 py-1 transition-colors ${viewMode === m ? 'bg-white text-[#0f172a] shadow-sm' : 'text-black/40 hover:text-black/60'}`}
              >
                {m === 'single' ? 'Single' : 'Spread'}
              </button>
            ))}
          </div>

          <div className="mx-1.5 h-4 w-px bg-black/10" />

          {/* Preview mode */}
          <div className="relative" data-menu="preview">
            <button
              type="button"
              onClick={() => {
                setPreviewMenuOpen((v) => !v)
                setGuidesMenuOpen(false)
              }}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 transition-colors ${previewMenuOpen ? 'border-[#df8e51]/40 bg-[#df8e51]/5 text-[#df8e51]' : 'border-black/8 text-black/50 hover:bg-black/4'}`}
            >
              {previewMode === 'original' ? 'Original' : previewMode === 'compare' ? 'Compare' : 'Fixed Preview'}
              <ChevronDown className="h-3 w-3" />
            </button>
            {previewMenuOpen && (
              <div className="absolute bottom-full left-0 z-30 mb-1 w-44 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl">
                {(['original', 'fixed', 'compare'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setScopedPreviewMode(mode)
                      setPreviewMenuOpen(false)
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${previewMode === mode ? 'bg-[#df8e51]/8 text-[#df8e51]' : 'text-black/65 hover:bg-black/4'}`}
                  >
                    {mode === 'original' ? 'Original' : mode === 'compare' ? 'Compare' : 'Fixed Preview'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mx-1.5 h-4 w-px bg-black/10" />

          {/* Guides */}
          <div className="relative" data-menu="guides">
            <button
              type="button"
              onClick={() => {
                setGuidesMenuOpen((v) => !v)
                setPreviewMenuOpen(false)
              }}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 transition-colors ${guidesMenuOpen || showGuides ? 'border-[#0f172a]/12 bg-black/4 text-[#0f172a]' : 'border-black/8 text-black/40 hover:bg-black/4'}`}
            >
              Guides <ChevronDown className="h-3 w-3" />
            </button>
            {guidesMenuOpen && (
              <div className="absolute bottom-full left-0 z-30 mb-1 w-40 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl">
                {[
                  { label: 'Safe area', val: showGuides, set: () => setShowGuides((v) => !v) },
                  { label: 'Trim & bleed', val: showAdvancedGuides, set: () => setShowAdvancedGuides((v) => !v) },
                ].map(({ label, val, set }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={set}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-black/65 hover:bg-black/4"
                  >
                    {label}
                    <div
                      className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${val ? 'bg-[#df8e51] justify-end' : 'bg-black/15 justify-start'}`}
                    >
                      <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metadata — right side */}
          <span className="ml-auto text-[11px] text-black/35">
            {bookTypeLabel} · {trimLabel} · {interiorLabel} · {pageCount} pages
            {result.spineWidthIn != null && ` · Spine ${result.spineWidthIn.toFixed(3)}"`}
          </span>
        </footer>
      )}
    </div>
  )
}
